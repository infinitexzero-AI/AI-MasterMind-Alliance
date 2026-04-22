import fetch from 'node-fetch';
import { ToolRegistry } from '../lib/tools/index';
import { ReadFileTool, WriteFileTool } from '../lib/tools/fileSystem';
import { WebSearchTool } from '../lib/tools/search';

const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'antigravity_dev_key';

// Mock Agent State
interface AgentState {
  status: 'idle' | 'active' | 'paused' | 'offline';
  currentTaskId: string | null;
}

const agents: Record<string, AgentState> = {
  'OmniRouter': { status: 'idle', currentTaskId: null },
  'ResearchUnit': { status: 'idle', currentTaskId: null },
  'DevModule': { status: 'idle', currentTaskId: null }
};

interface Task {
  taskId: string;
  title: string;
  status: 'queued' | 'active' | 'completed' | 'pending';
  targetAgent?: string;
  context?: string;
  source?: 'grok' | 'voice' | 'system' | 'web';
}

async function loop() {
  try {
    // 1. Fetch pending tasks
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { 'X-API-Key': API_KEY }
    });

    if (!res.ok) {
      // Silent fail if server is down to avoid log spam
      if (res.status !== 500) throw new Error(`API Error: ${res.statusText}`);
      return;
    }

    const json = await res.json() as { data: Task[] };
    const tasks = json.data;

    if (!tasks) return;

    // Filter for 'queued' or 'pending' tasks
    const queuedTasks = tasks.filter(t => t.status === 'queued' || t.status === 'pending');

    if (queuedTasks.length > 0) {
      console.log(`[System] Found ${queuedTasks.length} queued tasks.`);

      for (const task of queuedTasks) {
        // Find available agent
        const targetAgent = task.targetAgent || 'OmniRouter';
        const agent = agents[targetAgent];

        if (agent && agent.status === 'idle') {
          console.log(`[System] Assigning task ${task.taskId} to ${targetAgent}...`);

          // 2. Assign Task (Update Status to Active)
          try {
            await fetch(`${API_BASE}/tasks/update`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
              body: JSON.stringify({ taskId: task.taskId, status: 'active', progress: 0 })
            });

            // Update local agent state
            agent.status = 'active';
            agent.currentTaskId = task.taskId;

            // 3. Determine Tool & Execute
            let output = "Task completed (simulation).";
            let toolUsed = null;

            // Simple intent detection for Phase 6
            const taskTitle = task.title.toLowerCase();

            // Register Setup (Idempotent-ish)
            if (ToolRegistry.getAll().length === 0) {
              ToolRegistry.register(ReadFileTool);
              ToolRegistry.register(WriteFileTool);
              ToolRegistry.register(WebSearchTool);
            }

            if ((taskTitle.includes('write') || taskTitle.includes('create')) && (taskTitle.includes('file') || taskTitle.includes('.txt') || taskTitle.includes('.md') || taskTitle.includes('.js') || taskTitle.includes('.ts'))) {
              toolUsed = 'writeFile';
              // Try to extract filename
              let filename = 'output.txt';
              const parts = taskTitle.split(' ');
              for (const part of parts) {
                if (part.includes('.')) {
                  filename = part;
                  break;
                }
              }

              const result = await ToolRegistry.execute('writeFile', {
                filePath: filename,
                content: task.context || `Generated content for ${task.title}`
              });
              output = result.success ? result.output : `Tool Error: ${result.error}`;
            } else if (taskTitle.includes('read')) {
              toolUsed = 'readFile';
              const filename = taskTitle.split('read ')[1] || 'output.txt';
              const cleanFilename = filename.split(' ')[0];
              const result = await ToolRegistry.execute('readFile', { filePath: cleanFilename });
              output = result.success ? `File Content: ${result.output.substring(0, 100)}...` : `Tool Error: ${result.error}`;
            } else if (taskTitle.includes('search')) {
              toolUsed = 'webSearch';
              const query = taskTitle.replace('search for', '').trim();
              const result = await ToolRegistry.execute('webSearch', { query });
              output = result.success ? result.output : `Tool Error: ${result.error}`;
            }

            // Phase 8: Control Signals
            // STOP_AGENT, PAUSE_AGENT, RESUME_AGENT
            if (taskTitle.startsWith('stop_agent')) {
              const target = taskTitle.split(' ')[1];
              if (agents[target]) {
                agents[target].status = 'offline';
                output = `Command Accepted: ${target} is now OFFLINE.`;
              }
            } else if (taskTitle.startsWith('pause_agent')) {
              const target = taskTitle.split(' ')[1];
              if (agents[target]) {
                agents[target].status = 'paused';
                output = `Command Accepted: ${target} is now PAUSED.`;
              }
            } else if (taskTitle.startsWith('resume_agent')) {
              const target = taskTitle.split(' ')[1];
              if (agents[target]) {
                agents[target].status = 'idle';
                output = `Command Accepted: ${target} is now ACTIVE (Idle).`;
              }
            }

            // Phase 9: Swarm Intelligence (Delegation)
            const isManager = targetAgent === 'OmniRouter';
            if (isManager && (taskTitle.startsWith('project:') || taskTitle.startsWith('plan:') || taskTitle.startsWith('build:'))) {
              const projectScope = taskTitle.split(':')[1].trim();
              output = `Delegating "${projectScope}" to Swarm...`;

              // Spawn Sub-tasks...
              // (Delegation logic preserved)
              await fetch(`${API_BASE}/tasks/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                body: JSON.stringify({
                  title: `Research dependencies for ${projectScope}`,
                  targetAgent: 'ResearchUnit',
                  priority: 'high',
                  source: 'system',
                  context: `Parent Task: ${task.taskId}`
                })
              });
              // ...
              output += " Sub-tasks assigned.";
            }

            // Phase 10: Memory Integration
            // 1. Recall
            const { MemoryStore } = require('../lib/memory');
            const relevantMemories = MemoryStore.search(taskTitle);

            let contextWrapper = "";
            if (relevantMemories.length > 0) {
              const memoriesText = relevantMemories.map((m: any) => `- [${m.timestamp}] ${m.content}`).join('\n');
              console.log(`[Memory] Recalled ${relevantMemories.length} items for "${taskTitle}"`);
              contextWrapper = `\n\n[RECALLED CONTEXT]:\n${memoriesText}`;
            }

            // 2. Execute (with Context)
            console.log(`[System] Agent ${targetAgent} executing ${toolUsed || 'simulation'}...`);
            // Agent Logic Improvements for Phase 11 (Life OS)
            // -------------------------------------------------------------------------
            // BURSARY BOT & ADVOCACY LOGIC
            // -------------------------------------------------------------------------
            if (taskTitle.includes('funding') || taskTitle.includes('bursary') || taskTitle.includes('scholarship')) {
              output = `[Bursary Bot] Scanning New Brunswick & Canada Student Aid...
        
        > Found Potential Matches for "Mature Student + Bio/Psych":
        1. **New Brunswick Bursary for Students with Disabilities** (Up to $2,000/yr) - *High Priority*
        2. **Mount Allison Mature Student Entrance Scholarship** (Check eligibility)
        3. **Canada Student Grant for Full-Time Students** (Automatic assessment)
        
        Action: "Drafting Application for NB Bursary..."`;

              // Auto-save to memory
              const { MemoryStore } = require('../lib/memory');
              MemoryStore.add('ResearchUnit', output, ['finance', 'bursary', 'nb_aid']);
            } else if (taskTitle.includes('draft') && (taskTitle.includes('appeal') || taskTitle.includes('letter'))) {
              const { Templates } = require('../lib/templates');
              let templateType = 'Financial Aid Appeal'; // Default
              if (taskTitle.includes('tenant') || taskTitle.includes('landlord')) templateType = 'Tenancy Dispute';
              if (taskTitle.includes('exam') || taskTitle.includes('accommodation')) templateType = 'Academic Accommodation';

              output = `[Advocacy Generator] Drafted "${templateType}":\n\n${Templates[templateType]}`;
            }
            // -------------------------------------------------------------------------

            // Normal Simulation Fallback
            else if (!output) {
              output = `Executed ${toolUsed} successfully. Result: [Simulated Data for ${taskTitle}]`;
            }
            // Simulate Execution Time

            // 3. Save Result to Memory (Consolidation)
            // Filter out system commands from memory
            if (!taskTitle.startsWith('stop_agent') && !taskTitle.startsWith('pause_agent')) {
              MemoryStore.add(targetAgent, `Completed task "${taskTitle}": ${output}`, ['task_history', targetAgent]);
            }

            // Simulate "Thinking" time even for real tools
            setTimeout(async () => {
              console.log(`[System] Agent ${targetAgent} completed task ${task.taskId}. Output: ${output.substring(0, 50)}...`);

              // If source is 'grok' (Chat), send reply
              if (task.source === 'grok') {
                const { ChatManager } = require('../lib/chatManager');
                const { v4: uuidv4 } = require('uuid');

                ChatManager.addMessage({
                  id: uuidv4(),
                  role: 'agent',
                  content: output, // The tool result is the reply
                  timestamp: new Date().toISOString(),
                  agentName: targetAgent
                });
              }

              await fetch(`${API_BASE}/tasks/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                body: JSON.stringify({
                  taskId: task.taskId,
                  status: 'completed',
                  progress: 100
                })
              });

              // Reset Agent
              agent.status = 'idle';
              agent.currentTaskId = null;

            }, 5000); // 5 second simulation cost

          } catch (updateErr) {
            console.error(`[System] Failed to assign task: ${updateErr}`);
          }
        }
      }
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      // Server not up yet, ignore
    } else {
      console.error(err);
    }
  }
}

console.log("[Agent System] Initialized. Monitoring Task Queue...");
setInterval(loop, 3000);
