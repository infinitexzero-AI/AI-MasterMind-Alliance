import { useEffect, useState } from 'react';

interface ForgeHealthData {
  agents: { name: string; status: string; lastPing?: string }[];
  timestamp: string;
  uptime?: number;
}

export function useForgeHealth() {
  const [data, setData] = useState<ForgeHealthData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  async function refresh() {
    try {
      const res = await fetch('/api/forge/agents/health');
      const json: ForgeHealthData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  return { data, error, refresh };
}
