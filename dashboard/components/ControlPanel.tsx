import React from "react";
import useForgeStream from "./hooks/useForgeStream";

export default function ControlPanel() {
  const { connected, data, sendCommand, lastPing } = useForgeStream();

  return (
    <div style={{ padding: "1rem", border: "1px solid #444" }}>
      <h2>Forge Control Panel</h2>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <p>Last Ping: {lastPing ? new Date(lastPing).toLocaleTimeString() : "—"}</p>

      <button onClick={() => sendCommand("RESTART_AGENT")}>Restart Agent</button>
      <button onClick={() => sendCommand("PAUSE_PIPELINE")}>Pause Pipeline</button>
      <button onClick={() => sendCommand("RESUME_PIPELINE")}>Resume Pipeline</button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
