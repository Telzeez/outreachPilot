import { Injectable, Logger } from '@nestjs/common';
import { BoardSource, JobListing } from '../interfaces/board-source.interface';

@Injectable()
export class RemoteOkSource implements BoardSource {
  name = 'Remote OK';
  private readonly logger = new Logger(RemoteOkSource.name);

  // Focus on these keywords for web dev opportunities
  private targetTags = ['react', 'nextjs', 'next.js', 'frontend', 'full stack', 'nodejs', 'typescript', 'web developer'];

  async fetchListings(): Promise<JobListing[]> {
    try {
      this.logger.log('Fetching listings from Remote OK API...');
      const response = await fetch('https://remoteok.com/api');
      
      if (!response.ok) {
        throw new Error(`Remote OK API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Remote OK returns metadata in the first element, so we slice it off
      const rawJobs = Array.isArray(data) ? data.slice(1) : [];
      
      const filteredJobs: JobListing[] = [];

      for (const job of rawJobs) {
        if (!job.company || !job.position) continue;

        const isWebDev = this.isRelevantRole(job);
        if (isWebDev) {
          filteredJobs.push({
            companyName: job.company,
            website: job.company_url || undefined,
            role: job.position,
            source: this.name,
            applyUrl: job.apply_url || job.url,
            postedAt: new Date(job.date),
          });
        }
      }

      this.logger.log(`Found ${filteredJobs.length} relevant web-dev jobs out of ${rawJobs.length} total.`);
      return filteredJobs;

    } catch (error: any) {
      this.logger.error(`Failed to fetch from Remote OK: ${error.message}`, error.stack);
      return [];
    }
  }

  private isRelevantRole(job: any): boolean {
    const roleText = `${job.position} ${job.tags?.join(' ') || ''}`.toLowerCase();
    return this.targetTags.some(tag => roleText.includes(tag.toLowerCase()));
  }
}
