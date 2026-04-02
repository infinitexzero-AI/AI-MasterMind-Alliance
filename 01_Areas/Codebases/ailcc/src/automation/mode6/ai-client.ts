
import https from 'https';

// Declare globals that might be missing from type definitions in this context
declare const process: { env: Record<string, string | undefined> };

interface AIRequest {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}

interface AnthropicResponse {
  content: Array<{ text: string }>;
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
}

export class AIClient {
  private anthropicKey: string;
  private openaiKey: string;

  constructor() {
    this.anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    this.openaiKey = process.env.OPENAI_API_KEY || '';
  }

  async complete(request: AIRequest): Promise<string> {
    if (this.anthropicKey && !this.anthropicKey.includes('placeholder')) {
      return this.callClaude(request);
    } else if (this.openaiKey && !this.openaiKey.includes('placeholder')) {
        return this.callOpenAI(request);
    }
    
    console.warn('[AIClient] No valid API keys found. Returning mock response.');
    return this.mockResponse(request);
  }

  private mockResponse(req: AIRequest): string {
    const prompt = req.user.toLowerCase();
    if (prompt.includes('code') || prompt.includes('fix')) return 'coder';
    if (prompt.includes('search') || prompt.includes('find')) return 'researcher';
    if (prompt.includes('plan')) return 'strategist';
    return 'orchestrator';
  }

  private async callClaude(req: AIRequest): Promise<string> {
    const data = JSON.stringify({
      model: req.model || 'claude-3-opus-20240229',
      max_tokens: req.maxTokens || 1024,
      system: req.system,
      messages: [{ role: 'user', content: req.user }]
    });

    const response = await this.httpsPost('api.anthropic.com', '/v1/messages', {
      'x-api-key': this.anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    }, data) as AnthropicResponse;
    
    return response.content[0]?.text || '';
  }

  private async callOpenAI(req: AIRequest): Promise<string> {
    const data = JSON.stringify({
      model: req.model || 'gpt-4-turbo-preview',
      max_tokens: req.maxTokens || 1024,
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.user }
      ]
    });

    const response = await this.httpsPost('api.openai.com', '/v1/chat/completions', {
      'Authorization': `Bearer ${this.openaiKey}`,
      'Content-Type': 'application/json'
    }, data) as OpenAIResponse;
    
    return response.choices[0]?.message?.content || '';
  }

  private httpsPost(hostname: string, path: string, headers: Record<string, string>, body: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path,
        method: 'POST',
        headers
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer | string) => {
             // Handle chunk as string if Buffer is missing, or cast if present.
             // Simplest is to just append.
             data += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err: unknown) {
            reject(new Error(`Failed to parse response from ${hostname}: ${err}`));
          }
        });
      });

      req.on('error', (e: unknown) => reject(e));
      req.write(body);
      req.end();
    });
  }
}
