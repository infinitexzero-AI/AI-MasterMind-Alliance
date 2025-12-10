import React, { useEffect, useState } from 'react';

export default function PipelineView() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const r = await fetch('/api/forge/pipeline/telemetry');
    setData(await r.json());
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <div>Loading pipeline metrics…</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
