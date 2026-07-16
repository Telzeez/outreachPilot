import { Injectable, Inject, Logger } from '@nestjs/common';
import { LLM_PROVIDER } from './llm/llm-provider.interface';
import type { LlmProvider } from './llm/llm-provider.interface';
import { DRIZZLE } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { companies, contacts, leads, outreachMessages } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AiDraftService {
  private readonly logger = new Logger(AiDraftService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
  ) {}

  async generateDraftForLead(leadId: string) {
    this.logger.log(`Starting draft generation for lead: ${leadId}`);

    // 1. Fetch Lead + Company + Contact data
    const leadRecords = await this.db.select({
      leadId: leads.id,
      companyName: companies.name,
      companyWebsite: companies.website,
      companyNotes: companies.notes,
      contactName: contacts.name,
      contactRole: contacts.role,
    })
    .from(leads)
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.id, leadId));

    if (!leadRecords.length) {
      this.logger.warn(`Lead ${leadId} not found, aborting draft generation.`);
      return;
    }

    const data = leadRecords[0];

    // 2. Construct Prompt
    const prompt = `
      Write a short, professional, and highly personalized cold outreach email.
      The recipient is: ${data.contactName || 'the team'} at ${data.companyName}.
      ${data.contactRole ? `Their role is: ${data.contactRole}.` : ''}
      ${data.companyNotes ? `Additional context about the company: ${data.companyNotes}` : ''}
      
      Keep it under 100 words. Focus on a simple introduction and a low-friction call to action (e.g., asking for a 10 min chat).
    `;

    try {
      // 3. Generate Draft using LLM
      const draftContent = await this.llmProvider.generateDraft(prompt);
      
      // 4. Save to Database
      await this.db.insert(outreachMessages).values({
        leadId: data.leadId,
        draft: draftContent,
        status: 'PENDING_REVIEW',
      });

      this.logger.log(`Successfully generated and saved draft for lead ${leadId}`);
    } catch (error) {
      this.logger.error(`Error generating draft for lead ${leadId}: ${error.message}`);
    }
  }
}
