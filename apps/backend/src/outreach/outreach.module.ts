import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiDraftService } from './ai-draft.service';
import { DraftingProcessor } from './drafting.processor';
import { LLM_PROVIDER } from './llm/llm-provider.interface';
import { MockLlmProvider } from './llm/providers/mock.provider';
import { OllamaLlmProvider } from './llm/providers/ollama.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'drafting',
    }),
    ConfigModule,
  ],
  providers: [
    AiDraftService,
    DraftingProcessor,
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useOllama = configService.get<string>('USE_OLLAMA') === 'true';
        return useOllama ? new OllamaLlmProvider(configService) : new MockLlmProvider();
      },
    },
  ],
  exports: [BullModule], // Export BullModule so other modules can inject the 'drafting' queue
})
export class OutreachModule {}
