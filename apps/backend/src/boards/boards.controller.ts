import { Controller, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('boards')
export class BoardsController {
  constructor(@InjectQueue('boards-ingest') private readonly boardsQueue: Queue) {}

  @Post('trigger-ingest')
  async triggerIngest() {
    await this.boardsQueue.add('ingest-now', {}, {
      removeOnComplete: true,
    });
    return { status: 'Ingestion job added to queue' };
  }
}
