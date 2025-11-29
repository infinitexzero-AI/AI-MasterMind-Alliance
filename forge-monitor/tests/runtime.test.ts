// AILCC Framework - Phase 4: Runtime Tests

import { AgentRuntime } from '../runtime';

describe('AgentRuntime', () => {
  let runtime: AgentRuntime;

  beforeEach(() => {
    runtime = new AgentRuntime();
  });

  afterEach(async () => {
    await runtime.stop();
  });

  test('should start and stop successfully', async () => {
    await runtime.start();
    expect(runtime.getActiveAgents()).toHaveLength(0);
    await runtime.stop();
  });

  test('should spawn agents', async () => {
    await runtime.start();
    await runtime.spawnAgent('test-agent-1', {});
    expect(runtime.getActiveAgents()).toContain('test-agent-1');
  });

  test('should enforce max agent limit', async () => {
    runtime = new AgentRuntime({ maxAgents: 2 });
    await runtime.start();
    await runtime.spawnAgent('agent-1', {});
    await runtime.spawnAgent('agent-2', {});
    await expect(runtime.spawnAgent('agent-3', {})).rejects.toThrow('Maximum agent limit');
  });
});
