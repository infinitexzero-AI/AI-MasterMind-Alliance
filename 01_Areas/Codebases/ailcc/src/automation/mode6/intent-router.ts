import { Task, AgentRole } from './types';
import { AIClient } from './ai-client';
import * as fs from 'fs';
import * as path from 'path';

export class IntentRouter {
  private ai: AIClient;

  constructor() {
    this.ai = new AIClient();
  }

  async route(task: Task): Promise<AgentRole> {
    const localRole = this.localRoute(task);
    if (localRole) {
      console.log(`[Router] Local semantic match found: ${localRole}`);
      return localRole;
    }

    const prompt = `
      You are an Intent Router for an autonomous AI system.
      Your job is to classify the following task into one of these roles:
      - coder: Writes code, fixes bugs, refactors.
      - researcher: Searches the web, gathers information.
      - strategist: Plans, researches high-level topics, creates roadmaps.
      - automation: Deploys, monitors, CI/CD, managing files.
      - orchestrator: General coordination or if unclear.

      Task Description: "${task.description}"

      Return ONLY the role name (lowercase).
    `;

    try {
      const response = await this.ai.complete({
        system: 'You are a precise classifier. Output only the category name.',
        user: prompt
      });

      const role = response.trim().toLowerCase();
      if (['coder', 'researcher', 'strategist', 'automation', 'orchestrator'].includes(role)) {
        return role as AgentRole;
      }
      return 'orchestrator'; // Fallback
    } catch (e) {
      console.error('[Router] AI routing failed, falling back to basic regex:', e);
      return this.fallbackRoute(task);
    }
  }

  private localRoute(task: Task): AgentRole | null {
    try {
      const mapPath = path.join(__dirname, 'intent_map.json');
      if (fs.existsSync(mapPath)) {
        const intentMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
        const desc = task.description.toLowerCase();

        for (const [role, keywords] of Object.entries(intentMap)) {
          if ((keywords as string[]).some(kw => desc.includes(kw))) {
            return role as AgentRole;
          }
        }
      }
    } catch (err) {
      console.error('[Router] Local mapping error:', err);
    }
    return null;
  }

  private fallbackRoute(task: Task): AgentRole {
    const desc = task.description.toLowerCase();
    if (desc.includes('code') || desc.includes('function') || desc.includes('fix')) return 'coder';
    if (desc.includes('research') || desc.includes('find')) return 'researcher';
    if (desc.includes('plan')) return 'strategist';
    if (desc.includes('deploy')) return 'automation';
    return 'orchestrator';
  }
}
