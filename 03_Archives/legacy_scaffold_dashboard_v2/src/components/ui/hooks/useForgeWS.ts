import { useEffect, useRef, useState, useCallback } from 'react';

type Telemetry = {
  ts: string;
  agents: Array<{ id: string; status: string; tasks: number }>;
};

export function useForgeWS(url = '/api/forge/ws') {
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<Telemetry | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Upgrade to ws:// from current origin
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const base = window.location.host;
    const wsUrl = `${protocol}://${base}${url}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };
    ws.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        setData(parsed);
      } catch (e) {
        console.warn('ws parse error', e);
      }
    };
    ws.onerror = (e) => {
      setError('WebSocket error');
    };
    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const send = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  return { data, connected, error, send };
}
