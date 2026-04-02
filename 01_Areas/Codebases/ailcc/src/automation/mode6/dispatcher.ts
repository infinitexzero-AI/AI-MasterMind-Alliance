import { Task, AgentRole, AgentResponse } from './types';
import { LinearTool, GitHubTool, LinearIssue } from './tools';

export class Dispatcher {
  private linear: LinearTool;
  private github: GitHubTool;

  constructor() {
    this.linear = new LinearTool();
    this.github = new GitHubTool();
  }

  async dispatch(task: Task, role: AgentRole): Promise<AgentResponse> {
    console.log(`[Dispatcher] Dispatching task "${task.description}" to [${role}]...`);
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulation logic
    let output = '';
    switch (role) {
      case 'coder':
        if (task.description.toLowerCase().includes('pr')) {
            const pr = await this.github.createPR(task.description, 'Automated PR from Mode 6', 'feature/mode6-auto');
            output = `Created PR: ${pr.url}`;
        } else {
            output = `Generated code for: ${task.description}`;
        }
        break;
      case 'researcher':
        if (task.description.toLowerCase().includes('issues')) {
            const issues: LinearIssue[] = await this.linear.getMyIssues();
            output = `Found ${issues.length} assigned issues: ${issues.map(i => i.title).join(', ')}`;
        } else {
            output = `Found results for: ${task.description}`;
        }
        break;
      case 'strategist':
        output = `Created plan for: ${task.description}`;
        break;
      case 'automation': {
        // Check Linear issues as a test of automation
        const issues: LinearIssue[] = await this.linear.getMyIssues();
        output = `Automation checks: ${issues.length} active issues. Triggered workflow for: ${task.description}`;
        break;
      }
      default:
        output = `Processed task: ${task.description}`;
    }

    return {
      success: true,
      output,
      metadata: { timestamp: new Date().toISOString() }
    };
  }
}
