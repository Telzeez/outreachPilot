export const LLM_PROVIDER = 'LLM_PROVIDER';

export interface LlmProvider {
  name: string;
  generateDraft(prompt: string): Promise<string>;
}
