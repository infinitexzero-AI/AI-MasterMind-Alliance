import React, { useEffect, useState } from "react";
import AlignmentDashboard from './AlignmentDashboard';

export default function RuntimePanel() {
  const [status, setStatus] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  
  // Simulated initial loading state until first fetch
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/forge/runtime/status");
      if (!res.ok) throw new Error("Connection failed");
      const d = await res.json();
      setStatus(d);
      setIsError(false);
    } catch (e) {
      setIsError(true);
      // Keep old status if available, so UI doesn't flash
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

  // To simulate the 'useless' JSON being replaced, we map whatever status we get
  // to the AlignmentDashboard format if it roughly matches, or pass it as is for debugging if needed.
  // For this tasks, we assume the backend (or mock) returns data that fits AlignmentDashboard
  // or we default to a loading state.

  return (
    <div className="space-y-6">
       {/* Inject the Telemetry Visualization */}
       <AlignmentDashboard data={status?.agents ? null : status} /> 
       {/* Note: In a real scenario, status might come from different endpoints. 
           If 'status' is the raw JSON user complained about, we pass it to the visualizer. 
           If it's just runtime status, we might need to adjust. 
           Assuming 'status' holds the telemetry object for now. */}

        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="panel-header mb-0">RUNTIME CONTROL</h3>
                {isError && <span className="text-xs text-red-400 font-mono animate-pulse">CONNECTION ERROR</span>}
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => cmd("start-runtime")} className="glass-button text-green-400 border-green-500/20 hover:bg-green-500/10 flex-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_currentColor]" />
                    INITIALIZE LAYER
                </button>
                <button onClick={() => cmd("stop-runtime")} className="glass-button text-red-400 border-red-500/20 hover:bg-red-500/10 flex-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_currentColor]" />
                     TERMINATE
                </button>
                <button onClick={() => cmd("status")} className="glass-button text-slate-400 hover:text-white flex-1">
                    PING STATUS
                </button>
            </div>
        </div>
    </div>
  );
}
