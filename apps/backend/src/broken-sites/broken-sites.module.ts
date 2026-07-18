import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BrokenSitesService } from './broken-sites.service';
import { BrokenSitesProcessor } from './broken-sites.processor';
import { BrokenSitesController } from './broken-sites.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'broken-sites-scan',
    }),
  ],
  controllers: [BrokenSitesController],
  providers: [BrokenSitesService, BrokenSitesProcessor],
})
export class BrokenSitesModule {}
