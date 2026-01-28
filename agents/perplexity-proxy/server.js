import express from 'express';
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy', agent: 'perplexity-proxy' }));
app.listen(5003, () => console.log('Perplexity Proxy placeholder running'));
