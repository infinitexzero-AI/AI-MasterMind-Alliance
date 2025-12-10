import { useEffect, useState } from 'react';

export function useForgeHealth() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  async function refresh() {
    try {
      const res = await fetch('/api/forge/agents/health');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  return { data, error, refresh };
}
