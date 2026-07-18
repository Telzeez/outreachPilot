import { Logger } from '@nestjs/common';
import { LlmProvider } from '../llm-provider.interface';

export class OpenAILlmProvider implements LlmProvider {
  name = 'OpenAIProvider';
  private readonly logger = new Logger(OpenAILlmProvider.name);
  
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl?: string,
  ) {
    if (!this.model) this.model = 'gpt-4o-mini';
    if (!this.baseUrl) this.baseUrl = 'https://api.openai.com/v1';
  }

  async generateDraft(prompt: string): Promise<string> {
    this.logger.log(`Generating draft message via OpenAI/Compatible API (${this.model})...`);
    
    if (!this.apiKey) {
      throw new Error('API key is missing for OpenAI provider');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('Failed to generate draft with OpenAI', error);
      throw error;
    }
  }
}
