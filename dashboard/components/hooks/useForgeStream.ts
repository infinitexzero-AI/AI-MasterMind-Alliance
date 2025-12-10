import { useEffect, useRef, useState } from "react";

export default function useForgeStream() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [lastPing, setLastPing] = useState<number | null>(null);

  useEffect(() => {
    let socket = new WebSocket("ws://localhost:3001");
    ws.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (evt) => {
      setLastPing(Date.now());
      setData(JSON.parse(evt.data));
    };

    return () => socket.close();
  }, []);

  function sendCommand(cmd: string) {
    ws.current?.send(cmd);
  }

  return { connected, data, lastPing, sendCommand };
}
