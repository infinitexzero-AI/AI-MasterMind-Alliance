
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAgent {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-pro-latest') {
    if (!apiKey) throw new Error("GeminiAgent: Missing API Key");
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt; // Gemini 1.0/1.5 structure

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
}
