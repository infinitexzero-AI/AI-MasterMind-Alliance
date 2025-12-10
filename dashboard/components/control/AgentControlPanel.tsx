import React from 'react';
import useForgeStream from '../hooks/useForgeStream';

export default function AgentControlPanel() {
  const { data, connected } = useForgeStream();

  return (
    <div className="p-4 rounded-xl border bg-neutral-900 text-white">
      <h2 className="text-xl font-bold mb-2">
        Agent Control Panel {connected ? '🟢' : '🔴'}
      </h2>

      {!data && <p className="opacity-60">Waiting for stream...</p>}

      {data?.type === 'agentStatus' && (
        <div className="mt-3">
          {data.payload.map((a: any) => (
            <div key={a.id} className="mb-1">
              <span className="font-semibold">{a.id}</span> — {a.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
