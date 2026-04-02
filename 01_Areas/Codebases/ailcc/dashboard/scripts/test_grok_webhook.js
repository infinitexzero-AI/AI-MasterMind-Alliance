const crypto = require('crypto');
// Axios removed to use native fetch
// const axios = require('axios');

const SECRET = 'nexus_secret_default';
const URL = 'http://localhost:3000/api/webhooks/external';

const title = process.argv[2] || 'Grok Discovery';
const context = process.argv[3] || 'Automated insight from external AI';

const payload = {
  title,
  context,
  priority: 'high',
  targetAgent: 'ResearchUnit'
};

const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', SECRET)
  .update(payloadString)
  .digest('hex');

const body = {
  source: 'grok',
  payload,
  signature
};

console.log('Sending Webhook...');
console.log('Payload:', JSON.stringify(body, null, 2));

fetch(URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
.then(async res => {
  const data = await res.json();
  console.log('Response:', res.status, data);
})
.catch(err => {
  console.error('Error:', err.message);
});
