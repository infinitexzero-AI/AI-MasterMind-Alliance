import React from 'react';
import { useForgeHealth } from './hooks/useForgeHealth';

export default function AgentGrid() {
  const { data } = useForgeHealth();
  if (!data) return <div>Loading agents…</div>;

  return (
    <div>
      {data.agents.map((a: any) => (
        <div key={a.agent}>
          <strong>{a.agent}</strong> — 
          <span style={{ color: a.status === 'ok' ? 'green' : a.status === 'warn' ? 'orange' : 'red' }}>
            {a.status}
          </span>
        </div>
      ))}
    </div>
  );
}
