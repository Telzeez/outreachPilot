import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('test-queue') private readonly testQueue: Queue,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-job')
  async triggerTestJob() {
    await this.testQueue.add('test-job-name', {
      message: 'Hello from BullMQ!',
      timestamp: new Date().toISOString(),
    });
    return { status: 'Job added to the test-queue!' };
  }
}
