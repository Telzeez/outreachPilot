import { Injectable, Inject, Logger } from '@nestjs/common';
import { ENRICHMENT_PROVIDER } from './enrichment/enrichment-provider.interface';
import type { EnrichmentProvider } from './enrichment/enrichment-provider.interface';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { companies, contacts, leads } from '../db/schema';
import { eq } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @Inject(ENRICHMENT_PROVIDER) private readonly enrichmentProvider: EnrichmentProvider,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    @InjectQueue('drafting') private draftingQueue: Queue,
  ) {}

  async enrichCompany(companyId: string, leadId: string) {
    this.logger.log(`Starting enrichment for company: ${companyId}`);

    // Fetch the company
    const companyRecords = await this.db.select().from(companies).where(eq(companies.id, companyId));
    if (!companyRecords.length) {
      this.logger.warn(`Company ${companyId} not found`);
      return;
    }

    const company = companyRecords[0];
    if (!company.website) {
      this.logger.warn(`Company ${companyId} has no website, cannot enrich`);
      return;
    }

    // Clean website to get domain
    let domain = company.website.replace('https://', '').replace('http://', '').replace('www.', '');
    domain = domain.split('/')[0]; // simple domain extraction

    try {
      const foundContacts = await this.enrichmentProvider.findContacts(domain);
      
      if (foundContacts && foundContacts.length > 0) {
        // Just take the first contact for the MVP
        const targetContact = foundContacts[0];
        
        // Insert into contacts table
        const [newContact] = await this.db.insert(contacts).values({
          companyId: company.id,
          name: targetContact.name,
          email: targetContact.email,
          role: targetContact.role,
          source: this.enrichmentProvider.name,
        }).returning();

        // Update the lead to point to this contact
        await this.db.update(leads)
          .set({ contactId: newContact.id })
          .where(eq(leads.id, leadId));
          
        this.logger.log(`Successfully enriched company ${company.name} with contact ${newContact.email}`);
      } else {
        this.logger.log(`No contacts found for domain ${domain}`);
      }
    } catch (error) {
      this.logger.error(`Error enriching company ${companyId}: ${error.message}`);
    } finally {
      // Always trigger drafting, even if enrichment failed (we can draft a generic company message)
      await this.draftingQueue.add('draft-message', { leadId });
      this.logger.log(`Enqueued drafting for lead ${leadId} after enrichment attempt`);
    }
  }
}
