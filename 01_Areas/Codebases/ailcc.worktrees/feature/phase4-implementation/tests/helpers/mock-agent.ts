/**
 * Mock Agent Helper
 * Provides stub implementations for testing Mode 6 routing and dispatching
 * without hitting real external APIs.
 */

export interface MockAgentResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export class MockAgent {
  name: string;
  capabilities: string[];

  constructor(name: string, capabilities: string[]) {
    this.name = name;
    this.capabilities = capabilities;
  }

  async execute(task: string): Promise<MockAgentResponse> {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 10));

    // Mock success response
    if (!task.includes('fail')) {
      return {
        success: true,
        result: `[${this.name}] Successfully executed: ${task}`,
      };
    }

    return {
      success: false,
      error: `[${this.name}] Task execution failed: ${task}`,
    };
  }

  async validateCapability(capability: string): Promise<boolean> {
    return this.capabilities.includes(capability);
  }

  getStats() {
    return {
      name: this.name,
      capabilities: this.capabilities,
    };
  }
}

export function createMockAgent(name: string, capabilities: string[] = []) {
  return new MockAgent(name, capabilities);
}
