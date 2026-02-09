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

// Enable CORS for Dashboard (Port 3000)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for local dev
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', agent: 'chatgpt-proxy' });
});

app.get('/health/system', async (req, res) => {
    try {
        // Check Redis Code
        const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
        
        // Mock Queue Status (replace with real BullMQ check later)
        const queues = {
            'task-queue': { active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }
        };

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                core: {
                    status: 'up',
                    uptime: process.uptime(),
                    version: '1.0.0',
                    agents_active: 1
                },
                redis: {
                    status: redisStatus
                },
                queues
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
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
