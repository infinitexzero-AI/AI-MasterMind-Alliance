
import OpenAI from 'openai';
import { ModelRouter } from '../../lib/ai/ModelRouter';

export class CopilotAgent {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    if (!apiKey) throw new Error("CopilotAgent: Missing API Key");
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.model = model || ModelRouter.MODELS.OPENAI.OPTIMAL;
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const systemPrompt = context ? context : "You are an expert React developer. Focus on UI components and clean code.";

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message?.content || '';
  }
}
