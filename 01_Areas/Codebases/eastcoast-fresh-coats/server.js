import 'dotenv/config';
import express from 'express';
import { storeContext, getTaskHistory } from './redis-client.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'active', system: 'Valentine Core Gateway', timestamp: new Date() });
});

// Task Routing
app.post('/api/task', async (req, res) => {
    try {
        const { task, context, agent: preferredAgent } = req.body;

        // Determine agent (simple router)
        const agent = preferredAgent || determineAgent(task);

        console.log(`[Valentine] Routing task to ${agent}: ${task.substring(0, 50)}...`);

        // In a real implementation, we would call the agent's API here.
        // For MVP, we simulate execution or just log the handoff.

        const result = {
            message: `Task routed to ${agent}`,
            status: 'pending_execution',
            taskId: `task-${Date.now()}`
        };

        // Store in shared memory
        if (process.env.REDIS_URL) {
            await storeContext(result.taskId, agent, { task, context, result });
        }

        res.json({ agent, result });
    } catch (error) {
        console.error('Task routing error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function determineAgent(task) {
    const t = task.toLowerCase();
    if (t.includes('code') || t.includes('implement')) return 'ChatGPT';
    if (t.includes('analyze') || t.includes('review') || t.includes('architecture')) return 'Claude';
    if (t.includes('research') || t.includes('find')) return 'Perplexity';
    return 'Claude'; // Default architect
}

app.listen(PORT, () => {
    console.log(`Valentine Core Gateway running on port ${PORT}`);
});
