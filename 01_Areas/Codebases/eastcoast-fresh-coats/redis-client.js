import { createClient } from 'redis';

let client;

if (process.env.REDIS_URL) {
    client = createClient({
        url: process.env.REDIS_URL
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    client.on('connect', () => console.log('Connected to Redis Shared Memory'));

    client.connect().catch(console.error);
} else {
    console.warn('[Valentine] REDIS_URL not set. Shared memory disabled.');
    // Mock client for dev without Redis
    client = {
        set: async () => { },
        get: async () => null,
        keys: async () => []
    };
}

export async function storeContext(taskId, agent, data) {
    if (!client.isOpen && process.env.REDIS_URL) return;

    const key = `task:${taskId}:${agent}`;
    try {
        await client.set(key, JSON.stringify({
            timestamp: new Date(),
            agent,
            data,
            status: 'pending'
        }), { EX: 86400 }); // 24 hour expiry
        console.log(`[Memory] Context stored for ${key}`);
    } catch (e) {
        console.error(`[Memory] Failed to store context: ${e.message}`);
    }
}

export async function getTaskHistory(taskId) {
    if (!client.isOpen && process.env.REDIS_URL) return [];

    try {
        const keys = await client.keys(`task:${taskId}:*`);
        const history = await Promise.all(
            keys.map(k => client.get(k))
        );
        return history.map(JSON.parse);
    } catch (e) {
        console.error(`[Memory] Failed to fetch history: ${e.message}`);
        return [];
    }
}

export { client };
