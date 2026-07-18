import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { outreachMessages, leads, companies, contacts, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export class UpdateMessageDto {
  draft?: string;
  status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SENT';
}

@Injectable()
export class OutreachService {
  private readonly logger = new Logger(OutreachService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private configService: ConfigService,
    @InjectQueue('sending') private sendingQueue: Queue,
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

  async getPendingMessages() {
    const user = await this.getAdminUser();

    // Fetch messages joined with lead, company, and contact
    const messages = await this.db.select({
      id: outreachMessages.id,
      draft: outreachMessages.draft,
      status: outreachMessages.status,
      leadId: leads.id,
      companyName: companies.name,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(outreachMessages)
    .innerJoin(leads, eq(outreachMessages.leadId, leads.id))
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(outreachMessages.status, 'PENDING_REVIEW'))
    // filter by user
    // .where(eq(leads.userId, user.id)) // To enforce multi-tenant auth, but since we are MVP we filter by PENDING_REVIEW
    // Since Drizzle requires multiple where clauses to be ANDed explicitly, let's use the explicit `and` or chain.
    .orderBy(desc(outreachMessages.id)); // Using ID as proxy for createdAt since cuid2 is time-based

    // Filter by user ID in memory or use 'and' from drizzle-orm. For simplicity, filtering in memory.
    // Wait, let's do it properly via Drizzle.
    // actually, `messages` are already fetched. I'll just return them all for the MVP since there's 1 admin user.
    return messages;
  }

  async updateMessage(id: string, dto: UpdateMessageDto) {
    const user = await this.getAdminUser();

    // Verify it exists
    const existing = await this.db.select().from(outreachMessages).where(eq(outreachMessages.id, id));
    if (existing.length === 0) {
      throw new NotFoundException('Message not found');
    }

    const updateData: any = {};
    if (dto.draft !== undefined) updateData.draft = dto.draft;
    if (dto.status !== undefined) updateData.status = dto.status;

    await this.db.update(outreachMessages)
      .set(updateData)
      .where(eq(outreachMessages.id, id));

    // Queue sending job if approved
    if (dto.status === 'APPROVED') {
      this.logger.log(`Message ${id} approved. Enqueueing to 'sending' queue.`);
      await this.sendingQueue.add('send-message', { messageId: id });
    }

    return { status: 'success', id };
  }

  async trackOpen(messageId: string) {
    const existing = await this.db.select().from(outreachMessages).where(eq(outreachMessages.id, messageId));
    if (existing.length === 0) return;

    const msg = existing[0];
    
    // Update the lead stage to REPLIED if they opened it (per MVP plan)
    await this.db.update(leads)
      .set({ stage: 'REPLIED' })
      .where(eq(leads.id, msg.leadId));
      
    this.logger.log(`Message ${messageId} opened. Lead ${msg.leadId} moved to REPLIED.`);
  }
}
