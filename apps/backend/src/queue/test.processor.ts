import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('test-queue')
export class TestProcessor extends WorkerHost {
  private readonly logger = new Logger(TestProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name} with data: ${JSON.stringify(job.data)}`);
    
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Completed job ${job.id}`);
    return 'Job done';
  }
}
