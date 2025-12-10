import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch('http://localhost:3001/api/pipeline/telemetry');
    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Forge Monitor unreachable', details: String(err) });
  }
}
