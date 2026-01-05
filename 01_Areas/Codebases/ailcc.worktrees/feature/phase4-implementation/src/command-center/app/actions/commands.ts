'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Load registry safely on server side
const REGISTRY_PATH = path.join(process.cwd(), 'app/lib/commands.json');

export async function executeCommand(commandId: string) {
  try {
    const registryRaw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(registryRaw);
    const cmdEntry = registry.find((c: { id: string; type?: string; cwd?: string; command: string }) => c.id === commandId);

    if (!cmdEntry) {
      return { success: false, output: `Command ID '${commandId}' not found.` };
    }

    if (cmdEntry.type === 'view') {
        // For 'view' types, we might just return the instruction to open it client side or specific message
        // But the user requested execution. If it's "open", it might open on the server Mac, which is actually intended here since it's a local dashboard.
    }

    // Resolve CWD relative to the Next.js project root (src/command-center)
    // cmdEntry.cwd is likely "../../" to go to ailcc root
    const executionCwd = path.resolve(process.cwd(), cmdEntry.cwd || '.');

    console.log(`[COMMAND] Executing ${cmdEntry.id}: ${cmdEntry.command} in ${executionCwd}`);

    const { stdout, stderr } = await execAsync(cmdEntry.command, { cwd: executionCwd });
    
    return { 
        success: true, 
        output: stdout + (stderr ? `\n[STDERR]\n${stderr}` : '') 
    };

  } catch (error: unknown) {
    console.error(`[COMMAND] Execution failed:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
        success: false, 
        output: errorMessage 
    };
  }
}
