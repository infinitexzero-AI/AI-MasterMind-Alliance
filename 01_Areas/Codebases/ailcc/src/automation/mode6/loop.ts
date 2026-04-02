import { MemoryManager } from './memory';
import { IntentRouter } from './intent-router';
import { Dispatcher } from './dispatcher';
import fs from 'fs';
import path from 'path';

const POLL_INTERVAL = 5000;
const streamPath = path.join(__dirname, 'mode6_stream.json');

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'limit' | 'error';
  agent: string;
}

const logToStream = (message: string, type: 'info' | 'success' | 'limit' | 'error' = 'info', agent?: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message,
      type,
      agent: agent || 'SYSTEM'
    };
    
    // Keep last 50 logs for the feed
    let logs: LogEntry[] = [];
    try {
      if (fs.existsSync(streamPath)) {
          logs = JSON.parse(fs.readFileSync(streamPath, 'utf-8'));
      }
    } catch {
       // Ignore read errors
    }

    logs.unshift(entry);
    if (logs.length > 50) logs = logs.slice(0, 50);
    
    try {
        fs.writeFileSync(streamPath, JSON.stringify(logs, null, 2));
    } catch (e) {
         // silent fail
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`);
};

async function main() {
  console.log('[Mode 6] Starting Automation Loop...');
  
  const memory = new MemoryManager();
  const router = new IntentRouter();
  const dispatcher = new Dispatcher();

  // Initial Seed if empty
  if (memory.getAllTasks().length === 0) {
    console.log('[Mode 6] Memory empty. Seeding initial task...');
    memory.createTask('Research latest agentic design patterns', 'system');
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pendingTasks = memory.getPendingTasks();

    if (pendingTasks.length > 0) {
      logToStream(`Found ${pendingTasks.length} pending tasks.`, 'info');
      
      for (const task of pendingTasks) {
        // 1. Mark in progress
        memory.updateTask(task.id, { status: 'in_progress' });

        // 2. Route
        logToStream(`Analyzing intent for Task ${task.id.slice(0, 8)}...`, 'info', 'ROUTER');
        const role = await router.route(task);
        logToStream(`Task routed to [${role.toUpperCase()}]`, 'success', 'ROUTER');

        // Exception: Handle Python-native Daemons
        if (['forge_verifier', 'alchemist_daemon'].includes(role)) {
          logToStream(`${role} is a Python daemon. Handling natively.`, 'info', 'DAEMON');
          memory.updateTask(task.id, {
            status: 'delegated_to_daemon',
            daemon: role,
            timestamp: new Date().toISOString()
          });
          continue;
        }

        // 3. Dispatch
        try {
          const result = await dispatcher.dispatch(task, role);
          
          // 4. Update status
          if (result.success) {
            memory.updateTask(task.id, { 
              status: 'completed', 
              result: result.output 
            });
            logToStream(`Task ${task.id.slice(0, 8)} COMPLETED by ${role}`, 'success', role.toUpperCase());
          } else {
             memory.updateTask(task.id, { status: 'failed' });
             logToStream(`Task ${task.id.slice(0, 8)} FAILED`, 'error', role.toUpperCase());
          }

        } catch (error) {
          logToStream(`Error processing task ${task.id}`, 'error', 'SYSTEM');
          memory.updateTask(task.id, { status: 'failed' });
        }
      }
      
      // Keep memory clean
      memory.archiveCompletedTasks();

    } else {
       // Optional: Heartbeat
       // logToStream('Scanning for new intent...', 'limit', 'SYSTEM');
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch(console.error);
