import React, { useEffect, useState } from 'react';

export default function PipelineView() {
  const [data, setData] = useState<any>(null);

  async function load() {
    try {
        const r = await fetch('/api/forge/pipeline/telemetry');
        if(r.ok) setData(await r.json());
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!data) return (
    <div className="glass-panel p-4 flex items-center justify-center text-xs font-mono text-slate-500">
        INITIALIZING PIPELINE...
    </div>
  );

  return (
      <div className="glass-panel p-4 overflow-hidden">
        <h3 className="panel-header">PIPELINE TELEMETRY</h3>
        <div className="space-y-2 text-xs font-mono text-cyan-300">
            {Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="uppercase text-slate-500">{k}</span>
                    <span>{String(v)}</span>
                </div>
            ))}
        </div>
      </div>
  );
}
