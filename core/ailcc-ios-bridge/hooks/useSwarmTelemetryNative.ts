import { useState, useEffect, useRef } from 'react';

// Targets the Orchestrator's central WebSocket tunnel
const DASHBOARD_WS_URL = 'ws://127.0.0.1:8765';

export const useSwarmTelemetryNative = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(DASHBOARD_WS_URL);
    
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TASK_UPDATE') {
          // Prepend new messages to top, max 50 length
          setMessages(prev => [data.payload.message, ...prev].slice(0, 50));
        }
      } catch (e) {
        console.warn('WSS Parse Error', e);
      }
    };
    
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const dispatchTask = (prompt: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PROCESS_TASK',
        payload: { prompt, trace: false, source: 'iOS_BRIDGE' } // Special iOS Telemetry Node Identifier
      }));
    }
  };

  return { isConnected, messages, dispatchTask };
};
