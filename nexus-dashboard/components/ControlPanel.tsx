import React, { useEffect, useState } from 'react';

export default function ControlPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5005');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (msg) => {
      setMessages((prev) => [...prev, JSON.parse(msg.data)]);
    };

    return () => ws.close();
  }, []);

  async function sendCommand(cmd: string) {
    await fetch('/api/forge/bus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
  }

  return (
    <div className="p-4 border rounded-xl bg-gray-900 text-white">
      <h2 className="text-xl mb-2">Forge Control Panel (WS + Command Bus)</h2>

      <div>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</div>

      <div className="mt-4 space-x-3">
        <button onClick={() => sendCommand("start-agent")} className="bg-green-700 px-3 py-1 rounded">Start</button>
        <button onClick={() => sendCommand("stop-agent")} className="bg-red-700 px-3 py-1 rounded">Stop</button>
        <button onClick={() => sendCommand("restart")} className="bg-yellow-600 px-3 py-1 rounded">Restart</button>
      </div>

      <pre className="mt-4 max-h-64 overflow-auto bg-black p-2 text-green-400 text-xs">
        {JSON.stringify(messages, null, 2)}
      </pre>
    </div>
  );
}
