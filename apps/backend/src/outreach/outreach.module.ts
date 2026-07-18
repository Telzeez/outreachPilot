import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AiDraftService } from './ai-draft.service';
import { DraftingProcessor } from './drafting.processor';
import { SendingProcessor } from './sending.processor';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';
import { DigestService } from './digest.service';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'drafting',
    }),
    BullModule.registerQueue({
      name: 'sending',
    }),
    ConfigModule,
    LeadsModule,
  ],
  controllers: [
    OutreachController,
  ],
  providers: [
    AiDraftService,
    DraftingProcessor,
    SendingProcessor,
    OutreachService,
    DigestService,
  ],
  exports: [BullModule], // Export BullModule so other modules can inject the 'drafting' and 'sending' queues
})
export class OutreachModule {}
