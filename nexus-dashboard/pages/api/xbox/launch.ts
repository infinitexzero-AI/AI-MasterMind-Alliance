import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed', code: 'METHOD_DENIED' });
  }

  // The Commander noted the Mac cannot natively execute legacy Xbox SmartGlass packages
  // due to Python 3.13 'imp' module constraints. We are forwarding the payload to the ThinkPad (Node Gamma).
  const thinkpadIp = process.env.THINKPAD_EDGE_HOST || '10.0.0.50'; // Requires mapping in Vanguard .env
  
  try {
    console.log(`[OBSERVER_TELEMETRY] Forwarding Xbox Launch Payload to ThinkPad Edge Node: ${thinkpadIp}`);
    
    // The ThinkPad will host a tiny FastAPI proxy server that executes the windows-native Xbox payload
    const response = await fetch(`http://${thinkpadIp}:5000/xbox/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: '10.0.0.31', app: 'Microsoft.MicrosoftEdge_8wekyb3d8bbwe!MicrosoftEdge' }),
      signal: AbortSignal.timeout(4000)
    });

    if (!response.ok) {
       throw new Error(`ThinkPad rejected payload: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Vanguard ThinkPad successfully hijacked Xbox monitor.',
      code: 'THINKPAD_XBOX_SUCCESS',
      details: data
    });

  } catch (error: any) {
    console.error(`[OBSERVER_TELEMETRY] ThinkPad Node Gamma Offline: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'ThinkPad unavailable. Ensure Edge Daemon is running on Windows.',
      code: 'THINKPAD_BRIDGE_ERROR',
      details: error.message
    });
  }
}
