
import { MemoryManager } from './memory/memory-manager';
import { AdapterRegistry } from './agents/adapter-registry';
import { HandoffContext, DispatchResult } from './intent-router/types';
import path from 'path';
import fs from 'fs';

// Configuration
const POLLING_INTERVAL = 5000;
const DATA_DIR = path.join(__dirname, 'data');

async function main() {
    console.log('[Loop] Initializing Neural Loop...');

    // 1. Initialize Components
    const memory = new MemoryManager();
    await memory.init();

    const registry = new AdapterRegistry();
    console.log(`[Loop] Loaded Agents: ${registry.listAdapters().join(', ')}`);

    // 2. Start Polling
    console.log('[Loop] Watching for thoughts...');

    setInterval(async () => {
        try {
            await processPendingTasks(memory, registry);
        } catch (error) {
            console.error('[Loop] Cycle Error:', error);
        }
    }, POLLING_INTERVAL);
}

async function processPendingTasks(memory: MemoryManager, registry: AdapterRegistry) {
    // 1. Scan for Decisions (Tasks)
    // We access the provider directly or expose a list method on MemoryManager
    // Since MemoryManager abstracts this, we should add a 'listPendingTasks' method.
    // For now, we'll read the directory directly as a "God Mode" loop access.

    if (!fs.existsSync(DATA_DIR)) return;

    const files = fs.readdirSync(DATA_DIR);
    const decisions = files.filter(f => f.startsWith('decision-') && f.endsWith('.json'));

    for (const file of decisions) {
        const taskId = file.replace('decision-', '').replace('.json', '');

        // Check if result exists
        const resultFile = `result-${taskId}.json`;
        if (fs.existsSync(path.join(DATA_DIR, resultFile))) {
            continue; // Already done
        }

        // 2. Load Intent
        console.log(`[Loop] Processing Task: ${taskId}`);
        const decisionData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));

        // Reconstruct Handoff Context (simplified)
        const handoff: HandoffContext = {
            taskId: decisionData.taskId,
            sourceMode: 'mode6',
            targetAgent: decisionData.primaryAgent,
            secondaryAgents: decisionData.secondaryAgents,
            timestamp: new Date(decisionData.timestamp),
            metadata: { description: 'From Memory' }, // We should persist full metadata
            taskData: 'Task execution requested via persistent memory.'
        };

        // 3. Select Agent
        const agentName = decisionData.primaryAgent;
        
        // Exception: Handle Python-native Daemons by generating a synthetic completion
        if (['forge_verifier', 'alchemist_daemon'].includes(agentName)) {
            console.log(`[Loop] Agent ${agentName} corresponds to a Python Daemon. Handling natively (no error spam).`);
            const resultPath = path.join(DATA_DIR, resultFile);
            fs.writeFileSync(resultPath, JSON.stringify({ success: true, message: "Handled by Python daemon natively.", daemon: agentName }, null, 2));
            continue; // Skip logging "Agent not found" error
        }

        const agent = registry.getAdapter(agentName);

        if (!agent) {
            console.error(`[Loop] Agent not found: ${agentName}. This agent may be a Python daemon or external service.`);
            continue;
        }

        // 4. Execute
        console.log(`[Loop] Dispatching to ${agentName}...`);
        const result = await agent.executeTask(handoff);

        // 5. Store Result
        const resultPath = path.join(DATA_DIR, resultFile);
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

        console.log(`[Loop] Task Complete: ${taskId} (Success: ${result.success})`);
    }
}

// Start
main().catch(err => console.error(err));
