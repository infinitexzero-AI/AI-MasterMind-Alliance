import React, { useEffect, useState } from 'react';

export default function ControlPanel() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:7070');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (msg) => {
      setMessages((prev) => [...prev, JSON.parse(msg.data)]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 border rounded-xl bg-gray-900 text-white">
      <h2 className="text-xl mb-2">Forge Control Panel (WS)</h2>
      <div>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</div>
      <pre className="mt-4 max-h-64 overflow-auto bg-black p-2 text-green-400 text-xs">
        {JSON.stringify(messages, null, 2)}
      </pre>
    </div>
  );
}
