import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BrokenSitesService } from './broken-sites.service';

@Processor('broken-sites-scan')
export class BrokenSitesProcessor extends WorkerHost {
  private readonly logger = new Logger(BrokenSitesProcessor.name);

  constructor(private readonly brokenSitesService: BrokenSitesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing broken sites scan job: ${job.id}`);
    
    if (job.name === 'scan-domain') {
        const { domain } = job.data;
        if (domain) {
            await this.brokenSitesService.processDomainCheck(domain);
        }
    }
  }
}
