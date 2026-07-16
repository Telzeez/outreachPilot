import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BOARD_SOURCE, BoardSource, JobListing } from './interfaces/board-source.interface';
import { DRIZZLE } from '../db/db.module';
import { eq } from 'drizzle-orm';
import { companies, leads, users } from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(
    @Inject(BOARD_SOURCE) private readonly sources: BoardSource[],
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private configService: ConfigService,
  ) {}

  async runIngestion() {
    this.logger.log('Starting job board ingestion cycle...');
    
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.error('ADMIN_EMAIL is not set in .env. Cannot assign leads.');
      return;
    }

    // Find the admin user
    let adminUsers = await this.db.select().from(users).where(eq(users.email, adminEmail));
    let adminUser = adminUsers[0];

    if (!adminUser) {
      this.logger.log(`Admin user with email ${adminEmail} not found. Auto-creating for ingestion.`);
      const [newUser] = await this.db.insert(users).values({
        email: adminEmail,
        name: 'Admin User',
      }).returning();
      adminUser = newUser;
    }

    let totalIngested = 0;

    for (const source of this.sources) {
      this.logger.log(`Fetching from source: ${source.name}`);
      try {
        const jobs = await source.fetchListings();
        this.logger.log(`Received ${jobs.length} jobs from ${source.name}`);

        for (const job of jobs) {
          const success = await this.processJob(job, adminUser.id);
          if (success) totalIngested++;
        }
      } catch (error: any) {
        this.logger.error(`Error processing source ${source.name}: ${error.message}`);
      }
    }

    this.logger.log(`Ingestion cycle complete. Added ${totalIngested} new leads.`);
  }

  private async processJob(job: JobListing, userId: string): Promise<boolean> {
    try {
      // Upsert company
      // Since Drizzle requires a bit of gymnastics for ON CONFLICT DO NOTHING with postgres,
      // we can do a select then insert to keep it simple, or use onConflictDoNothing.
      
      const existingCompany = await this.db.select().from(companies).where(eq(companies.name, job.companyName));
      let companyId: string;

      if (existingCompany.length > 0) {
        // Company already exists, we might already have a lead for it
        companyId = existingCompany[0].id;
        
        // Check if we already have a lead for this user and company
        const existingLead = await this.db.select().from(leads)
          .where(eq(leads.companyId, companyId));
          
        if (existingLead.length > 0) {
           return false; // Skip, lead already exists
        }
      } else {
        // Insert new company
        const [newCompany] = await this.db.insert(companies).values({
          name: job.companyName,
          website: job.website,
          source: job.source,
          notes: `Role: ${job.role}\nApply: ${job.applyUrl}`,
        }).returning({ id: companies.id });
        companyId = newCompany.id;
      }

      // Create new Lead in NEW stage
      await this.db.insert(leads).values({
        companyId,
        userId,
        stage: 'NEW',
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.companyName}: ${error.message}`);
      return false;
    }
  }
}
