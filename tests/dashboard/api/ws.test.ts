/**
 * Basic test to ensure the WS endpoint exists and upgrades.
 * Note: Next.js API upgrade behavior hard to test in unit env; this test validates HTTP 200 from endpoint handler.
 */
const fetch = require('node-fetch');
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('GET /api/forge/ws returns 200 (ready to upgrade)', async () => {
  const res = await fetch(base + '/api/forge/ws');
  expect(res.status).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/WebSocket endpoint/);
});
