
import { configLoader } from '../config/env';
import { HandoffContext, DispatchResult } from '../intent-router/types';

export interface GeminiAdapterConfig {
    apiKey?: string;
    modelId?: string;
    maxTokens?: number;
}

export class GeminiAdapter {
    private apiKey: string;
    private modelId: string;
    private apiBaseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';

    constructor(config: GeminiAdapterConfig = {}) {
        const configSettings = configLoader.getConfig();
        this.apiKey = config.apiKey || configSettings.gemini?.apiKey;
        this.modelId = config.modelId || configSettings.gemini?.model || 'gemini-pro';

        if (!this.apiKey) {
            console.warn('[Gemini Adapter] GEMINI_API_KEY not set; adapter will operate in mock mode.');
        }
    }

    async executeTask(handoff: HandoffContext): Promise<DispatchResult> {
        const startTime = Date.now();
        try {
            if (!this.apiKey) return this.mockExecute(handoff);

            const prompt = this.formatPrompt(handoff);
            const url = `${this.apiBaseUrl}/${this.modelId}:generateContent?key=${this.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);

            const data = await response.json();
            const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const usage = data.usageMetadata || {};

            return {
                success: true,
                taskId: handoff.taskId,
                agentUsed: 'gemini',
                output: output,
                metadata: {
                    duration: Date.now() - startTime,
                    tokens: usage.totalTokenCount || 0
                }
            };

        } catch (error: any) {
            return {
                success: false,
                taskId: handoff.taskId,
                agentUsed: 'gemini',
                error: error.message
            };
        }
    }

    private formatPrompt(handoff: HandoffContext): string {
        // Gemini expects simple text or multipart
        return `${handoff.metadata?.description}\n\n${JSON.stringify(handoff.taskData)}`;
    }

    async validateCapability(capability: string): Promise<boolean> {
        return ['analysis', 'creative-writing', 'multimodal'].includes(capability);
    }

    getStats() { return { model: this.modelId, isConfigured: !!this.apiKey }; }

    private mockExecute(handoff: HandoffContext): DispatchResult {
        return {
            success: true,
            taskId: handoff.taskId,
            agentUsed: 'gemini',
            output: '[Gemini Mock] Task completed based on heuristic analysis.',
            metadata: { mode: 'mock' }
        };
    }
}

export default GeminiAdapter;
