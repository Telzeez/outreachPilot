import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider } from '../llm-provider.interface';

@Injectable()
export class MockLlmProvider implements LlmProvider {
  name = 'MockProvider';
  private readonly logger = new Logger(MockLlmProvider.name);

  async generateDraft(prompt: string): Promise<string> {
    this.logger.log('Generating mock draft message...');
    
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `Hi there,\n\nI noticed your great work at your company and wanted to reach out. We specialize in helping teams scale their engineering efforts without overhead.\n\nWould you be open to a quick 10-minute chat next week to see if there's a mutual fit?\n\nBest,\nYour Name`;
  }
}
