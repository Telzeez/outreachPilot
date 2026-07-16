import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BoardsService } from '../boards.service';

@Processor('boards-ingest')
export class BoardIngestProcessor extends WorkerHost {
  private readonly logger = new Logger(BoardIngestProcessor.name);

  constructor(private readonly boardsService: BoardsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing board ingestion job ${job.id}...`);
    await this.boardsService.runIngestion();
    this.logger.log(`Completed board ingestion job ${job.id}`);
  }
}
