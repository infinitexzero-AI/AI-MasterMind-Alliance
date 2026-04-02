
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeAgent {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    if (!apiKey) throw new Error("ClaudeAgent: Missing API Key");
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true }); // Enable for dashboard usage if needed, though server-side is preferred
    this.model = model;
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const systemPrompt = context ? context : "You are a senior software architect.";
    
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: systemPrompt
    });

    // Handle text content blocks safely
    const textContent = response.content.find(block => block.type === 'text');
    return textContent ? textContent.text : '';
  }
}
