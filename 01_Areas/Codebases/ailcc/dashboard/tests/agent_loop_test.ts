import { MemoryManager } from '../src/lib/mode6/memory';
import { Dispatcher } from '../src/lib/mode6/dispatcher';
import { MCPResourceManager } from '../src/lib/mode6/resource-manager';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Note: IntentRouter is imported but not currently used in this verification segment
// import { IntentRouter } from '../src/lib/mode6/intent-router'; 

async function verifyAgenticCycle() {
    console.log('🚀 Starting Agentic Cycle Verification (MCP Edition)...');

    const baseDir = path.join(__dirname, '../../'); // AILCC root
    const memory = new MemoryManager(__dirname);
    const resourceManager = new MCPResourceManager(baseDir);
    const dispatcher = new Dispatcher();

    // 1. Resource Verification
    console.log('Step 1: Resource Discovery');
    const resources = await resourceManager.listResources();
    console.log(`Found ${resources.length} base resources.`);

    const cognitive = await resourceManager.discoverResources('Cognitive');
    if (cognitive.length > 0) {
        console.log('✅ Found Cognitive Architecture resource.');
        const content = await resourceManager.readResource(cognitive[0].uri);
        console.log(`Content length: ${content.text?.length} bytes.`);
    } else {
        console.log('❌ Failed to find Cognitive Architecture.');
    }

    // 2. Tool Verification
    console.log('\nStep 2: Tool Schema Verification');
    const schemas = await dispatcher.getToolSchemas();
    console.log(`Available Tools: ${schemas.map(s => s.name).join(', ')}`);
    if (schemas.some(s => s.name === 'create_github_pr')) {
        console.log('✅ GitHub PR tool registered.');
    }

    // 3. Task Creation & Memory
    console.log('\nStep 3: Task & Memory Integration');
    const task = memory.createTask('Verify MCP Integration', 'system');
    console.log(`Task created: ${task.id}`);

    const working = memory.getWorkingMemory();
    const creationEntry = working.find(m => m.metadata?.actionType === 'task_created');
    if (creationEntry) {
        console.log('✅ Working Memory captured task creation.');
    }

    // 4. Dispatch Simulation
    console.log('\nStep 4: Tool Dispatch Simulation');

    // Test Coder (Existing)
    const resultCoder = await dispatcher.dispatch(task, { name: 'coder', description: 'Code generator', capabilities: ['code'] });
    console.log(`Coder Output: ${resultCoder.output}`);

    // Test Comet (Research)
    const taskResearch = memory.createTask('Find latest agentic patterns', 'strategist');
    const resultComet = await dispatcher.dispatch(taskResearch, { name: 'comet', description: 'Web researcher', capabilities: ['web_search'] });
    console.log(`Comet Output: ${resultComet.output}`);

    // Test Valentine (Relay)
    const taskNotify = memory.createTask('Notify user on iOS', 'system');
    const resultValentine = await dispatcher.dispatch(taskNotify, { name: 'valentine', description: 'iOS Relay', capabilities: ['mobile_relay'] });
    console.log(`Valentine Output: ${resultValentine.output}`);

    if (resultCoder.success && resultComet.success && resultValentine.success) {
        console.log('✅ Dispatcher verified for Multi-Agent roles.');
    }

    console.log('\n✨ Verification Complete.');
}

verifyAgenticCycle().catch(err => {
    console.error('❌ Verification Failed:', err);
    process.exit(1);
});