
import { configLoader } from '../config/env';
import { HandoffContext, DispatchResult } from '../intent-router/types';

export interface PerplexityAdapterConfig {
    apiKey?: string;
    modelId?: string;
}

export class PerplexityAdapter {
    private apiKey: string;
    private modelId: string;
    private apiBaseUrl: string = 'https://api.perplexity.ai/chat/completions';

    constructor(config: PerplexityAdapterConfig = {}) {
        const configSettings = configLoader.getConfig();
        this.apiKey = config.apiKey || configSettings.perplexity?.apiKey;
        this.modelId = config.modelId || configSettings.perplexity?.model || 'pplx-7b-online';

        if (!this.apiKey) {
            console.warn('[Perplexity Adapter] PERPLEXITY_API_KEY not set.');
        }
    }

    async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
        const startTime = Date.now();
        try {
            if (!this.apiKey) return this.mockExecute(handoff);

            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: [{ role: 'user', content: handoff.metadata?.description }],
                    temperature: 0.1
                })
            });

            if (!response.ok) throw new Error(`Perplexity API Error: ${response.statusText}`);

            const data = await response.json();
            const output = data.choices?.[0]?.message?.content || '';

            return {
                success: true,
                taskId: handoff.taskId,
                agentUsed: 'perplexity',
                output: output,
                metadata: { duration: Date.now() - startTime }
            };

        } catch (error: any) {
            return {
                success: false,
                taskId: handoff.taskId,
                agentUsed: 'perplexity',
                error: error.message
            };
        }
    }

    async validateCapability(capability: string): Promise<boolean> {
        return ['research', 'fact-checking', 'search'].includes(capability);
    }

    getStats() { return { model: this.modelId, isConfigured: !!this.apiKey }; }

    private mockExecute(handoff: HandoffContext): DispatchResult {
        return {
            success: true,
            taskId: handoff.taskId,
            agentUsed: 'perplexity',
            output: '[Perplexity Mock] Research simulated. Information found.',
            metadata: { mode: 'mock' }
        };
    }
}

export default PerplexityAdapter;
