import React, { useState } from 'react';
import { useForgeWS } from './hooks/useForgeWS';

export default function AgentControlPanel() {
  const { connected, send } = useForgeWS();
  const [cmd, setCmd] = useState('');
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleSend = () => {
    if (!cmd.trim()) return;
    const payload = { type: 'command', command: cmd, ts: new Date().toISOString() };
    const ok = send(payload);
    if (ok) {
        setLastSent(payload.ts);
        setCmd('');
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold tracking-widest text-slate-100">AGENT CONTROL</h3>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-500 shadow-[0_0_10px_currentColor]' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-mono uppercase ${connected ? 'text-cyan-400' : 'text-red-400'}`}>
                {connected ? 'CONNECTED' : 'OFFLINE'}
            </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
            className={`glass-button flex-1 ${paused ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'text-slate-300'}`}
            onClick={() => setPaused(!paused)}
        >
          <div className={`w-2 h-2 rounded-full ${paused ? 'bg-yellow-500 animate-pulse' : 'bg-slate-500'}`} />
          {paused ? 'RESUME AGENTS' : 'PAUSE AGENTS'}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase">Command Input</label>
        <div className="flex gap-2">
            <input 
                value={cmd} 
                onChange={(e) => setCmd(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter instruction protocol..." 
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-cyan-400 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
            />
            <button onClick={handleSend} className="glass-button bg-cyan-600/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-600/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                SEND
            </button>
        </div>
      </div>
      
      {lastSent && (
        <div className="text-[10px] font-mono text-slate-600 text-right">
            LAST SIGNAL: {lastSent}
        </div>
      )}
    </div>
  );
}
