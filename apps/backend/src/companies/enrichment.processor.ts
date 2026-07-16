import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Processor('enrichment')
export class EnrichmentProcessor extends WorkerHost {
  private readonly logger = new Logger(EnrichmentProcessor.name);

  constructor(private readonly companiesService: CompaniesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing enrichment job ${job.id}`);
    
    switch (job.name) {
      case 'enrich-lead': {
        const { companyId, leadId } = job.data;
        if (!companyId || !leadId) {
          throw new Error('companyId and leadId are required for enrich-lead job');
        }
        await this.companiesService.enrichCompany(companyId, leadId);
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
