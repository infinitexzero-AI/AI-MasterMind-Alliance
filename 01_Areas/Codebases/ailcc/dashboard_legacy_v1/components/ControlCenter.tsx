import React from 'react';
import RuntimePanel from './RuntimePanel';
import AgentControlPanel from './AgentControlPanel';

import { useForgeWS } from './hooks/useForgeWS';

export default function ControlCenter() {
  const { connected, send } = useForgeWS();
  const [intent, setIntent] = React.useState('');
  const [isPaused, setIsPaused] = React.useState(false);

  const togglePause = () => setIsPaused(!isPaused);

  const sendIntent = () => {
    if (!intent) return;
    send({ type: 'intent', payload: intent });
    setIntent('');
  };
  return (
    <div className="glass-panel text-slate-100 p-6 rounded-xl flex flex-col h-full">
       <header className="mb-6 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold tracking-tight">Control Nexus</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse-glow' : 'bg-red-500'}`}></span>
                <p className="text-xs text-blue-400 font-mono uppercase">
                    {connected ? 'UPLINK ESTABLISHED' : 'OFFLINE'}
                </p>
            </div>
        </div>
      </header>
      
      <div className="flex-1 space-y-4">
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Override Command
            </label>
            <div className="flex gap-0">
                <input 
                    type="text" 
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="Enter command..."
                    className="flex-1 bg-slate-950/50 border border-slate-700 rounded-l px-4 py-3 focus:outline-none focus:border-blue-500 text-sm text-white placeholder-slate-600"
                    onKeyDown={(e) => e.key === 'Enter' && sendIntent()}
                />
                <button 
                  onClick={sendIntent}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-r font-bold text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
                >
                    EXEC
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
             <QuickAction 
                label={isPaused ? "RESUME OPS" : "HALT ALL"} 
                color={isPaused ? "bg-green-900/40 text-green-300 border-green-700 hover:bg-green-900/60" : "bg-red-900/40 text-red-300 border-red-700 hover:bg-red-900/60"} 
                onClick={togglePause}
             />
             <QuickAction label="RESTART" color="bg-yellow-900/40 text-yellow-300 border-yellow-700 hover:bg-yellow-900/60" />
             <QuickAction label="FLUSH MEM" color="bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-700/60" />
             <QuickAction label="DEPLOY" color="bg-blue-900/40 text-blue-300 border-blue-700 hover:bg-blue-900/60" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, color, onClick }: { label: string, color: string, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`border rounded p-3 text-[10px] font-bold tracking-widest transition-all hover:scale-105 ${color}`}
        >
            {label}
        </button>
    )
}
