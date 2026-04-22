
import { CodeGenerationTask, TaskComplexity } from './types';
import { GrokAgent } from '../ai-providers/grok';

export class TaskParser {
  private agent: GrokAgent;

  constructor(apiKey: string) {
    this.agent = new GrokAgent(apiKey);
  }

  async parse(userPrompt: string): Promise<CodeGenerationTask[]> {
    const systemPrompt = `
      You are a Senior Technical Project Manager. 
      Your goal is to break down a high-level coding request into granular, executable engineering tasks.
      
      For each task, identify:
      1. A clear, actionable description.
      2. The specific files that need to be created or modified.
      3. The complexity of the task (simple, medium, complex).
      
      Output MUST be valid JSON array of objects with this structure:
      {
        "id": "unique_string",
        "description": "string",
        "files": ["string"],
        "complexity": "simple" | "medium" | "complex"
      }
      
      Do not include any markdown formatting, just the raw JSON array.
    `;

    try {
      const response = await this.agent.generate(
        `Break down this request: "${userPrompt}"`,
        systemPrompt
      );

      // Clean cleanup potential markdown code blocks
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const tasks = JSON.parse(cleanJson);
      
      // Hydrate with default status
      return tasks.map((t: any) => ({
        ...t,
        status: 'pending'
      }));

    } catch (error) {
      console.error("TaskParser Error:", error);
      throw new Error("Failed to parse tasks from prompt.");
    }
  }
}
