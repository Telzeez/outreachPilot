import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiDraftService } from './ai-draft.service';

@Processor('drafting')
export class DraftingProcessor extends WorkerHost {
  private readonly logger = new Logger(DraftingProcessor.name);

  constructor(private readonly aiDraftService: AiDraftService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing drafting job ${job.id}`);
    
    switch (job.name) {
      case 'draft-message': {
        const { leadId } = job.data;
        if (!leadId) {
          throw new Error('leadId is required for draft-message job');
        }
        await this.aiDraftService.generateDraftForLead(leadId);
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
