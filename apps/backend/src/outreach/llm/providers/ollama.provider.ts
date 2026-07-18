import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider } from '../llm-provider.interface';

@Injectable()
export class OllamaLlmProvider implements LlmProvider {
  name = 'OllamaProvider';
  private readonly logger = new Logger(OllamaLlmProvider.name);
  private readonly apiUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService, dynamicModel?: string) {
    this.apiUrl = this.configService.get<string>('OLLAMA_API_URL') || 'http://localhost:11434/api/generate';
    this.model = dynamicModel || this.configService.get<string>('OLLAMA_MODEL') || 'llama3';
  }

  async generateDraft(prompt: string): Promise<string> {
    this.logger.log(`Generating draft message via Ollama (${this.model})...`);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response.trim();
    } catch (error) {
      this.logger.error('Failed to generate draft with Ollama. Falling back to simple template.', error);
      throw error;
    }
  }
}
