'use client';
import React from 'react';
import { Bot, Activity, Brain } from 'lucide-react';

export default function ValentinePage() {
  return (
    <div className="p-8 text-cyan-100 font-mono h-full overflow-y-auto">
      <header className="mb-8 border-b border-cyan-900/50 pb-4">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
          <Bot className="w-10 h-10 text-fuchsia-400" />
          VALENTINE <span className="text-sm font-normal text-cyan-600 self-end mb-2">/ ORCHESTRATOR_NODE</span>
        </h1>
        <p className="text-cyan-400/60 max-w-2xl">
          The central executive agent responsible for task delegation, system monitoring, and maintaining the &quot;Big Picture&quot; context.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-cyan-900/30 bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-fuchsia-300">
             <Activity className="w-5 h-5" />
             ACTIVE DIRECTIVES
           </h2>
           <ul className="space-y-3 text-sm text-cyan-200/80">
             <li className="flex items-start gap-2">
                <span className="text-fuchsia-500">▶</span>
                <span>Coordinate &quot;Project Genesis&quot; UI rollout.</span>
             </li>
             <li className="flex items-start gap-2">
                <span className="text-fuchsia-500">▶</span>
                <span>Monitor &quot;Decision Trail&quot; logs for anomalies.</span>
             </li>
           </ul>
        </div>
        
        <div className="border border-cyan-900/30 bg-slate-900/50 p-6 rounded-lg">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-300">
             <Brain className="w-5 h-5" />
             KNOWN PROTOCOLS
           </h2>
           <div className="font-mono text-xs text-cyan-500 bg-black/40 p-4 rounded border border-cyan-900/30">
             CORE_LOOP: INITIALIZED<br/>
             DELEGATION_MODE: ASYNC<br/>
             LAST_SYNC: T-MINUS 00:04:00
           </div>
        </div>
      </div>
    </div>
  );
}
