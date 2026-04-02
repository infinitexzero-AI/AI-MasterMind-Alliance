
import { CodeGenerationTask, AgentType, TaskComplexity } from './types';
import { TaskParser } from './parser';
import { GrokAgent } from '../ai-providers/grok';
import { CopilotAgent } from '../ai-providers/copilot';
import { GeminiAgent } from '../ai-providers/gemini';

export class CodeOrchestrator {
  private parser: TaskParser;
  private grok: GrokAgent;
  private copilot: CopilotAgent;
  private gemini: GeminiAgent;


  constructor(
    xaiKey: string, 
    openaiKey: string, 
    googleKey: string
  ) {
    // Only initialize agents if keys are present (or placeholders)
    // The individual agents should handle initialization, but we can wrap them here
    this.parser = new TaskParser(xaiKey);
    this.grok = new GrokAgent(xaiKey);
    this.copilot = new CopilotAgent(openaiKey);
    this.gemini = new GeminiAgent(googleKey);
  }

  // 1. Break down prompt into tasks
  async plan(prompt: string): Promise<CodeGenerationTask[]> {
    // Use Parser (Grok) if available, otherwise switch to Copilot (OpenAI)
    // or fallback to simple mock if completely offline
    if (process.env.XAI_API_KEY && !process.env.XAI_API_KEY.includes('placeholder')) {
         return this.parser.parse(prompt);
    } else if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
         // Fallback: Use Copilot as the "Parser" (assuming CopilotAgent has a similar method or we adapt)
         // For now, let's just return a basic task structure to keep it simple until Parser is fully abstracted
         return [{
             id: 'task-' + Math.random().toString(36).substr(2, 5),
             description: prompt, // Treat whole prompt as one task
             status: 'pending',
             assignedAgent: 'copilot',
             complexity: 'simple',
             files: []
         }];
    }

    // Demo Mode if NO keys
    console.warn('⚠️ No viable parser found. Returning demo task.');
    return [{
        id: 'demo-task',
        description: 'Demo: ' + prompt,
        status: 'pending',
        assignedAgent: 'copilot',
        complexity: 'simple',
        files: []
    }];
  }

  // 2. Assign best agent for the job
  assignAgent(task: CodeGenerationTask): AgentType {
    const grokOk = process.env.XAI_API_KEY && !process.env.XAI_API_KEY.includes('placeholder');
    
    // If Grok is requested but missing, route to Copilot
    if (task.assignedAgent === 'grok' && !grokOk) {
        return 'copilot';
    }

    // Original Heuristics
    if (task.complexity === 'complex' && grokOk) return 'grok';
    
    const desc = task.description.toLowerCase();
    if (desc.includes('component') || desc.includes('ui') || desc.includes('react')) {
      return 'copilot';
    }
    if (desc.includes('test') || desc.includes('doc') || desc.includes('readme')) {
      return 'gemini';
    }
    
    // Default fallback
    return grokOk ? 'grok' : 'copilot';
  }

  // 3. Execute a single task
  async executeTask(task: CodeGenerationTask): Promise<CodeGenerationTask> {
    const agentType = this.assignAgent(task); // Re-evaluate assignment based on availability
    let agent;

    switch (agentType) {
      case 'grok': agent = this.grok; break;
      case 'copilot': agent = this.copilot; break;
      case 'gemini': agent = this.gemini; break;
      default: agent = this.copilot; // Safe default
    }

    try {
      const context = `You are a specialist agent (${agentType}). 
      Task ID: ${task.id}
      Files: ${task.files ? task.files.join(', ') : 'None'}
      Complexity: ${task.complexity}`;

      const code = await agent.generate(task.description, context);
      
      return {
        ...task,
        assignedAgent: agentType,
        status: 'completed',
        code: code
      };
    } catch (error: any) {
      console.error(`Task execution failed on ${agentType}:`, error);
      return {
        ...task,
        assignedAgent: agentType,
        status: 'failed',
        error: error.message
      };
    }
  }

  // 4. Run all tasks (simple parallel execution)
  async executeAll(tasks: CodeGenerationTask[]): Promise<CodeGenerationTask[]> {
    const promises = tasks.map(task => this.executeTask(task));
    return Promise.all(promises);
  }
}

