import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TestProcessor } from './test.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'test-queue',
    }),
  ],
  providers: [TestProcessor],
  exports: [BullModule],
})
export class QueueModule {}
