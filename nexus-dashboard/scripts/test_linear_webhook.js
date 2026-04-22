const URL = 'http://localhost:3000/api/webhooks/linear';

const payload = {
  action: 'create',
  type: 'Issue',
  createdAt: new Date().toISOString(),
  data: {
    id: 'issue_12345',
    title: 'Deploy to Production',
    description: 'Automated issue from Linear webhook',
    priority: 1, // High
    url: 'https://linear.app/issue/123',
    assigneeId: 'nexus_user_id'
  }
};

console.log('Sending Linear Webhook Simulation...');

fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 'Linear-Signature': 'mock_signature' // Uncomment if testing signature logic
  },
  body: JSON.stringify(payload)
})
.then(async res => {
  const data = await res.json();
  console.log('Response:', res.status, data);
})
.catch(err => {
  console.error('Error:', err.message);
});
