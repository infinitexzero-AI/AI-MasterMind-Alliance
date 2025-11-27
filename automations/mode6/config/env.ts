/**
 * Environment Configuration Loader
 * Loads and validates agent API keys from environment
 * Provides fallback to mock mode if keys unavailable
 */

export interface AgentConfig {
  anthropic: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    mockMode: boolean;
  };
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    mockMode: boolean;
  };
  xai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    mockMode: boolean;
  };
}

export class ConfigLoader {
  private config: AgentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   * Falls back to mock mode if keys not provided
   */
  private loadConfig(): AgentConfig {
    return {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
        mockMode: !process.env.ANTHROPIC_API_KEY,
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048', 10),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        mockMode: !process.env.OPENAI_API_KEY,
      },
      xai: {
        apiKey: process.env.XAI_API_KEY || '',
        model: process.env.GROK_MODEL || 'grok-2',
        maxTokens: parseInt(process.env.GROK_MAX_TOKENS || '4000', 10),
        temperature: parseFloat(process.env.GROK_TEMPERATURE || '0.7'),
        mockMode: !process.env.XAI_API_KEY,
      },
    };
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Check if specific agent is in mock mode
   */
  isAgentMocked(agent: 'anthropic' | 'openai' | 'xai'): boolean {
    return this.config[agent].mockMode;
  }

  /**
   * Get configured agents (non-mocked only)
   */
  getAvailableAgents(): Array<'anthropic' | 'openai' | 'xai'> {
    const available: Array<'anthropic' | 'openai' | 'xai'> = [];
    if (!this.config.anthropic.mockMode) available.push('anthropic');
    if (!this.config.openai.mockMode) available.push('openai');
    if (!this.config.xai.mockMode) available.push('xai');
    return available;
  }

  /**
   * Log configuration status (safe — doesn't expose keys)
   */
  logStatus(): void {
    console.log('[Config] Agent Configuration Status:');
    console.log(
      `  • Anthropic Claude: ${this.config.anthropic.mockMode ? '⚠️  MOCK MODE' : '✅ Ready'}`
    );
    console.log(
      `  • OpenAI GPT: ${this.config.openai.mockMode ? '⚠️  MOCK MODE' : '✅ Ready'}`
    );
    console.log(`  • xAI Grok: ${this.config.xai.mockMode ? '⚠️  MOCK MODE' : '✅ Ready'}`);
  }
}

// Export singleton instance
export const configLoader = new ConfigLoader();
