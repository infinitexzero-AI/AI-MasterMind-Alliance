import express from 'express';
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy', agent: 'claude-proxy' }));
app.listen(5002, () => console.log('Claude Proxy placeholder running'));
