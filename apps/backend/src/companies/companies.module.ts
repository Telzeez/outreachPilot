import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CompaniesService } from './companies.service';
import { EnrichmentProcessor } from './enrichment.processor';
import { ENRICHMENT_PROVIDER } from './enrichment/enrichment-provider.interface';
import { MockEnrichmentProvider } from './enrichment/providers/mock.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'enrichment',
    }),
    BullModule.registerQueue({
      name: 'drafting',
    }),
  ],
  providers: [
    CompaniesService,
    EnrichmentProcessor,
    {
      provide: ENRICHMENT_PROVIDER,
      useClass: MockEnrichmentProvider, // Can swap this later based on ConfigService if needed
    },
  ],
  exports: [BullModule], // Export BullModule so other modules can inject the 'enrichment' queue
})
export class CompaniesModule {}
