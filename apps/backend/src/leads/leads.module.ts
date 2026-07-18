import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'enrichment',
    }),
    BullModule.registerQueue({
      name: 'drafting',
    }),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
