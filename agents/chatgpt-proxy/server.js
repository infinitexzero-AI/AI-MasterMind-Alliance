// agents/chatgpt-proxy/server.js
import express from 'express';
import OpenAI from 'openai';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', agent: 'chatgpt-proxy' });
});

app.post('/execute', async (req, res) => {
    const taskId = uuidv4();
    const { prompt, context } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are ChatGPT, an agent in the Alliance.' },
                ...(context ? [{ role: 'system', content: `Context: ${context}` }] : []),
                { role: 'user', content: prompt }
            ]
        });

        const response = completion.choices[0].message.content;
        res.json({ taskId, status: 'success', response });
    } catch (error) {
        res.status(500).json({ taskId, status: 'error', message: error.message });
    }
});

app.listen(PORT, () => console.log(`[ChatGPT Proxy] Running on port ${PORT}`));
