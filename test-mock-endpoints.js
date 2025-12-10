/**
 * Mock Endpoint Smoke Test
 * Verifies all three adapters work in mock mode
 */

const { GrokAdapter } = require('./automations/mode6/agents/grok-adapter');
const { ClaudeAdapter } = require('./automations/mode6/agents/claude-adapter');
const { OpenAIAdapter } = require('./automations/mode6/agents/openai-adapter');
const { AdapterRegistry } = require('./automations/mode6/agents/adapter-registry');

async function testMockEndpoints() {
  console.log('\n🧪 Mode 6 Mock Endpoint Smoke Tests\n');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Grok Mock Mode
  try {
    const grok = new GrokAdapter({ apiKey: '', modelId: 'grok-2' });
    const result = await grok.executeTask({
      taskId: 'test-grok-001',
      sourceMode: 'test',
      timestamp: new Date(),
      targetAgent: 'grok',
      taskData: 'Test reasoning task',
      metadata: { description: 'Mock Grok test', taskType: 'reasoning' }
    });
    
    if (result.success && result.agentUsed === 'grok') {
      console.log('✅ Grok Mock Mode: PASS');
      results.passed++;
    } else {
      throw new Error('Invalid response structure');
    }
    results.details.push({ adapter: 'Grok', status: 'PASS', output: result.output.substring(0, 50) });
  } catch (err) {
    console.log(`❌ Grok Mock Mode: FAIL - ${err.message}`);
    results.failed++;
    results.details.push({ adapter: 'Grok', status: 'FAIL', error: err.message });
  }

  // Test 2: Claude Mock Mode
  try {
    const claude = new ClaudeAdapter({ apiKey: '', modelId: 'claude-3-5-sonnet-20241022' });
    const result = await claude.executeTask({
      taskId: 'test-claude-001',
      sourceMode: 'test',
      timestamp: new Date(),
      targetAgent: 'claude',
      taskData: 'Test code generation',
      metadata: { description: 'Mock Claude test', taskType: 'code-generation' }
    });
    
    if (result.success && result.agentUsed === 'claude') {
      console.log('✅ Claude Mock Mode: PASS');
      results.passed++;
    } else {
      throw new Error('Invalid response structure');
    }
    results.details.push({ adapter: 'Claude', status: 'PASS', output: result.output.substring(0, 50) });
  } catch (err) {
    console.log(`❌ Claude Mock Mode: FAIL - ${err.message}`);
    results.failed++;
    results.details.push({ adapter: 'Claude', status: 'FAIL', error: err.message });
  }

  // Test 3: OpenAI Mock Mode
  try {
    const openai = new OpenAIAdapter({ apiKey: '', modelId: 'gpt-4-turbo' });
    const result = await openai.executeTask({
      taskId: 'test-openai-001',
      sourceMode: 'test',
      timestamp: new Date(),
      targetAgent: 'openai',
      taskData: 'Test quick task',
      metadata: { description: 'Mock OpenAI test', taskType: 'quick-task' }
    });
    
    if (result.success && result.agentUsed === 'openai') {
      console.log('✅ OpenAI Mock Mode: PASS');
      results.passed++;
    } else {
      throw new Error('Invalid response structure');
    }
    results.details.push({ adapter: 'OpenAI', status: 'PASS', output: result.output.substring(0, 50) });
  } catch (err) {
    console.log(`❌ OpenAI Mock Mode: FAIL - ${err.message}`);
    results.failed++;
    results.details.push({ adapter: 'OpenAI', status: 'FAIL', error: err.message });
  }

  // Test 4: Adapter Registry
  try {
    const registry = new AdapterRegistry();
    const adapters = registry.listAdapters();
    
    if (adapters.includes('claude') && adapters.includes('openai') && adapters.includes('grok')) {
      console.log('✅ Adapter Registry: PASS (all adapters registered)');
      results.passed++;
    } else {
      throw new Error(`Missing adapters. Found: ${adapters.join(', ')}`);
    }
    results.details.push({ adapter: 'Registry', status: 'PASS', count: adapters.length });
  } catch (err) {
    console.log(`❌ Adapter Registry: FAIL - ${err.message}`);
    results.failed++;
    results.details.push({ adapter: 'Registry', status: 'FAIL', error: err.message });
  }

  // Summary
  console.log(`\n📊 Results: ${results.passed} passed, ${results.failed} failed\n`);
  
  if (results.failed === 0) {
    console.log('🎉 All mock endpoint tests PASSED!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed.\n');
    process.exit(1);
  }
}

testMockEndpoints().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
