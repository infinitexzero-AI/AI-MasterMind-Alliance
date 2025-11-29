import { useEffect, useRef, useState } from 'react';

export function useForgeStream(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (msg) => {
      try {
        setData(JSON.parse(msg.data));
      } catch (_) {}
    };

    return () => ws.close();
  }, [url]);

  return { data, connected };
}
