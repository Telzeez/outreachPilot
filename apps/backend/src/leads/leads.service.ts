import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';
import { companies, leads, users, contacts } from '../db/schema';
import * as xlsx from 'xlsx';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class CreateLeadDto {
  companyName: string;
  website?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
}

export class UpdateLeadDto {
  companyName?: string;
  website?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private configService: ConfigService,
    @InjectQueue('enrichment') private enrichmentQueue: Queue,
    @InjectQueue('drafting') private draftingQueue: Queue,
  ) {}

  private async getAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) throw new Error('ADMIN_EMAIL not set');

    let adminUsers = await this.db.select().from(users).where(eq(users.email, adminEmail));
    let adminUser = adminUsers[0];

    if (!adminUser) {
      const [newUser] = await this.db.insert(users).values({
        email: adminEmail,
        name: 'Admin User',
      }).returning();
      adminUser = newUser;
    }
    return adminUser;
  }

  async getAllLeads() {
    const adminUser = await this.getAdminUser();
    
    // Join leads with companies and contacts
    const results = await this.db.select({
      leadId: leads.id,
      stage: leads.stage,
      createdAt: leads.createdAt,
      companyName: companies.name,
      website: companies.website,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(leads)
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.userId, adminUser.id))
    .orderBy(desc(leads.createdAt));

    return results;
  }

  async createLead(dto: CreateLeadDto, source: string = 'manual') {
    const adminUser = await this.getAdminUser();

    // 1. Find or create company
    const existingCompany = await this.db.select().from(companies).where(eq(companies.name, dto.companyName));
    let companyId: string;

    if (existingCompany.length > 0) {
      companyId = existingCompany[0].id;
    } else {
      const [newCompany] = await this.db.insert(companies).values({
        name: dto.companyName,
        website: dto.website,
        source: source,
        notes: dto.notes,
      }).returning({ id: companies.id });
      companyId = newCompany.id;
    }

    // 2. Insert Contact if email is provided
    let contactId: string | null = null;
    if (dto.contactEmail) {
      // Check if contact exists
      const existingContact = await this.db.select().from(contacts).where(eq(contacts.email, dto.contactEmail));
      if (existingContact.length > 0) {
        contactId = existingContact[0].id;
      } else {
        const [newContact] = await this.db.insert(contacts).values({
          companyId,
          name: dto.contactName,
          email: dto.contactEmail,
          source: source,
        }).returning({ id: contacts.id });
        contactId = newContact.id;
      }
    }

    // 3. Create Lead
    // Check if lead already exists for this company/contact combo
    const existingLead = await this.db.select().from(leads)
      .where(eq(leads.companyId, companyId)); // simplified for MVP: 1 lead per company per user

    if (existingLead.length > 0) {
      return { status: 'skipped', message: 'Lead already exists for this company', lead: existingLead[0] };
    }

    const [newLead] = await this.db.insert(leads).values({
      companyId,
      contactId,
      userId: adminUser.id,
      stage: 'NEW',
    }).returning();

    // 4. Trigger enrichment if contact is missing, else trigger drafting directly
    if (!contactId) {
      await this.enrichmentQueue.add('enrich-lead', {
        companyId,
        leadId: newLead.id,
      });
      this.logger.log(`Enqueued enrichment for lead ${newLead.id}`);
    } else {
      await this.draftingQueue.add('draft-message', {
        leadId: newLead.id,
      });
      this.logger.log(`Enqueued drafting for lead ${newLead.id}`);
    }

    return { status: 'created', lead: newLead };
  }

  async importLeads(buffer: Buffer) {
    let records: any[] = [];
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      records = xlsx.utils.sheet_to_json(worksheet);
    } catch (err) {
      this.logger.error('Failed to parse spreadsheet file', err);
      throw new Error('Failed to parse spreadsheet file');
    }

    let created = 0;
    let skipped = 0;

    for (const record of records) {
      const dto: CreateLeadDto = {
        companyName: record.company_name || record.company || record.Company,
        website: record.website || record.Website,
        notes: record.notes || record.Notes,
        contactName: record.contact_name || record.name,
        contactEmail: record.contact_email || record.email,
      };

      if (!dto.companyName) {
        skipped++;
        continue;
      }

      try {
        const result = await this.createLead(dto, 'spreadsheet_import');
        if (result.status === 'created') created++;
        else skipped++;
      } catch (err) {
        this.logger.error(`Failed to import row for ${dto.companyName}: ${err.message}`);
        skipped++;
      }
    }

    return { created, skipped, total: records.length };
  }

  async deleteLead(leadId: string) {
    const adminUser = await this.getAdminUser();
    
    // Only delete if it belongs to the admin user
    const result = await this.db.delete(leads)
      .where(eq(leads.id, leadId))
      .returning();

    if (result.length === 0) {
      throw new Error('Lead not found or unauthorized');
    }
    
    return { status: 'deleted', leadId };
  }

  async updateLead(leadId: string, dto: UpdateLeadDto) {
    const adminUser = await this.getAdminUser();
    const existingLeads = await this.db.select().from(leads).where(eq(leads.id, leadId));
    if (existingLeads.length === 0) throw new Error("Lead not found");
    
    const lead = existingLeads[0];
    
    // Update Company using Drizzle (which uses parameterized queries natively, preventing SQL injection)
    if (dto.companyName || dto.website !== undefined || dto.notes !== undefined) {
      await this.db.update(companies).set({
        ...(dto.companyName && { name: dto.companyName }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      }).where(eq(companies.id, lead.companyId));
    }
    
    // Update or Create Contact
    if (dto.contactEmail || dto.contactName !== undefined) {
      if (lead.contactId) {
        await this.db.update(contacts).set({
          ...(dto.contactName !== undefined && { name: dto.contactName }),
          ...(dto.contactEmail !== undefined && { email: dto.contactEmail }),
        }).where(eq(contacts.id, lead.contactId));
      } else if (dto.contactEmail) {
        const [newContact] = await this.db.insert(contacts).values({
          companyId: lead.companyId,
          name: dto.contactName,
          email: dto.contactEmail,
          source: 'manual',
        }).returning({ id: contacts.id });
        
        await this.db.update(leads).set({ contactId: newContact.id }).where(eq(leads.id, leadId));
      }
    }

    return { status: 'updated', leadId };
  }
}
