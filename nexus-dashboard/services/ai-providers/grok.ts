
import { ModelRouter } from '../../lib/ai/ModelRouter';

export class GrokAgent {
    private apiKey: string;
    
    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.XAI_API_KEY || '';
        if (!this.apiKey || this.apiKey.includes('placeholder')) {
            console.warn("[GrokAgent] Warning: No valid API Key found. Execution will fail.");
        }
    }

    async generate(prompt: string, context?: string): Promise<string> {
        if (!this.apiKey || this.apiKey.includes('placeholder')) {
            throw new Error("GrokAgent: Missing API Key");
        }

        const messages = [];
        if (context) {
            messages.push({ role: 'system', content: context });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2-1212',
                messages: messages,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            throw new Error(`Grok API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
}
