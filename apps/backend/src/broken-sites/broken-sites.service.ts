import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../db/db.module';
import { eq } from 'drizzle-orm';
import { companies, leads, users } from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as cheerio from 'cheerio';

@Injectable()
export class BrokenSitesService {
  private readonly logger = new Logger(BrokenSitesService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<any>,
    private configService: ConfigService,
    @InjectQueue('broken-sites-scan') private scanQueue: Queue,
  ) {}

  async searchAndSeed(query: string) {
    this.logger.log(`Searching DuckDuckGo for: ${query}`);
    try {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`DuckDuckGo responded with status ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const domains = new Set<string>();
      
      $('.result__url').each((i, el) => {
        const urlStr = $(el).text().trim();
        if (urlStr) {
          try {
             // Basic parsing since duckduckgo might return "example.com" or "www.example.com/page"
             const cleanUrlStr = urlStr.replace(/^\/+/, '').split('/')[0];
             domains.add(cleanUrlStr);
          } catch (e) {
             // Ignore malformed urls
          }
        }
      });

      const domainsList = Array.from(domains);
      this.logger.log(`Found ${domainsList.length} domains. Queuing for scan...`);
      
      for (const domain of domainsList) {
        await this.addDomainToCheck(domain);
      }
      
      return { message: `Successfully queued ${domainsList.length} domains from search.`, count: domainsList.length, domains: domainsList };

    } catch (error: any) {
      this.logger.error(`Failed to search and seed: ${error.message}`);
      throw error;
    }
  }

  async addDomainToCheck(domain: string) {
    this.logger.log(`Adding domain to queue: ${domain}`);
    await this.scanQueue.add('scan-domain', { domain });
  }

  async processDomainCheck(domain: string) {
    try {
      this.logger.log(`Checking domain: ${domain}`);
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout

      let isBroken = false;
      let errorMsg = '';
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok && response.status >= 400) {
           isBroken = true;
           errorMsg = `HTTP Error: ${response.status}`;
        }
      } catch (err: any) {
        clearTimeout(timeout);
        isBroken = true;
        errorMsg = err.name === 'AbortError' ? 'Timeout' : err.message;
      }

      if (isBroken) {
        this.logger.log(`Domain ${domain} is broken (${errorMsg}). Creating lead...`);
        await this.createLeadForBrokenSite(domain, errorMsg);
      } else {
        this.logger.log(`Domain ${domain} is working fine.`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to process domain ${domain}: ${error.message}`);
    }
  }

  private async createLeadForBrokenSite(domain: string, errorMsg: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.error('ADMIN_EMAIL is not set in .env. Cannot assign leads.');
      return;
    }

    let adminUsers = await this.db.select().from(users).where(eq(users.email, adminEmail));
    let adminUser = adminUsers[0];

    if (!adminUser) {
       this.logger.warn(`Admin user not found. Cannot create lead for ${domain}`);
       return;
    }

    const companyName = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    // Check if company exists
    const existingCompany = await this.db.select().from(companies).where(eq(companies.name, companyName));
    let companyId: string;

    if (existingCompany.length > 0) {
      companyId = existingCompany[0].id;
      const existingLead = await this.db.select().from(leads).where(eq(leads.companyId, companyId));
      if (existingLead.length > 0) return; // already exists
    } else {
      const [newCompany] = await this.db.insert(companies).values({
        name: companyName,
        website: `https://${companyName}`,
        source: 'broken-sites-scanner',
        notes: `Website is currently broken or unreachable.\nError: ${errorMsg}\nPitch: Web development or server recovery services.`,
      }).returning({ id: companies.id });
      companyId = newCompany.id;
    }

    await this.db.insert(leads).values({
      companyId,
      userId: adminUser.id,
      stage: 'NEW',
    });
    this.logger.log(`Successfully created lead for broken site: ${companyName}`);
  }
}
