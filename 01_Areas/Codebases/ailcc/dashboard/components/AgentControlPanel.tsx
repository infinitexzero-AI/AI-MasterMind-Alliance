import React, { useState } from 'react';
import { useForgeWS } from './hooks/useForgeWS';

export default function AgentControlPanel() {
  const { connected, send } = useForgeWS();
  const [cmd, setCmd] = useState('');
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleSend = () => {
    const payload = { type: 'command', command: cmd, ts: new Date().toISOString() };
    const ok = send(payload);
    if (ok) setLastSent(payload.ts);
  };

  return (
    <div className="p-3 border rounded shadow-sm">
      <h3 className="text-lg font-semibold">Agent Control Panel</h3>
      <p>Status: {connected ? <span className="text-green-600">connected</span> : <span className="text-red-600">disconnected</span>}</p>
      <div className="mt-2">
        <button className="px-3 py-1 mr-2 bg-blue-600 text-white rounded" onClick={() => setPaused(!paused)}>
          {paused ? 'Resume Agents' : 'Pause Agents'}
        </button>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="Agent command" className="ml-2 p-1 border rounded" />
        <button onClick={handleSend} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Send</button>
      </div>
      <div className="mt-2 text-sm text-slate-400">Last Sent: {lastSent ?? '—'}</div>
    </div>
  );
}
