import React, { useEffect, useState } from "react";

export default function RuntimePanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/forge/runtime/status");
      if (!res.ok) throw new Error("bad status");
      const d = await res.json();
      setStatus(d);
    } catch (e) {
      setStatus({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, []);

  async function cmd(command: string) {
    try {
      await fetch("/api/forge/runtime/cmd", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ command })
      });
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-4 border rounded bg-white/5">
      <h3 className="text-lg font-semibold">Forge Runtime</h3>
      <div className="mt-2">{loading ? "Loading..." : JSON.stringify(status)}</div>
      <div className="mt-3 space-x-2">
        <button onClick={() => cmd("start-runtime")} className="px-3 py-1 rounded bg-green-600">Start</button>
        <button onClick={() => cmd("stop-runtime")} className="px-3 py-1 rounded bg-red-600">Stop</button>
        <button onClick={() => cmd("status")} className="px-3 py-1 rounded bg-gray-600">Status</button>
      </div>
    </div>
  );
}
