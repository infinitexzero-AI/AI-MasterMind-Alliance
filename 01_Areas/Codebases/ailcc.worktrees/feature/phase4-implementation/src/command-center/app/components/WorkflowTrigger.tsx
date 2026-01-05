'use client';

import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Loader2, Workflow, Terminal } from 'lucide-react';
// Removed unused N8N_WEBHOOK_URL

export default function WorkflowTrigger() {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const executeWorkflow = async () => {
    setStatus('RUNNING');
    try {
      const { launchTeam } = await import('../actions/orchestrator');
      const result = await launchTeam();
      
      if (result.success) {
          console.log("Delegation Plan:", result.plan);
          // In a real app, we'd dispatch this plan to a global store or context
          setStatus('SUCCESS');
      } else {
          console.error("Launch Failed:", result.error);
          setStatus('ERROR');
      }

      setTimeout(() => setStatus('IDLE'), 3000);
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-purple-500/30 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-3 border-b border-purple-500/30 flex justify-between items-center bg-slate-900/80">
        <h3 className="text-purple-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          TEAM_ORCHESTRATOR
        </h3>
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between items-center gap-4">
        <div className="text-center space-y-2">
            <h4 className="text-purple-100 font-bold font-mono">AICC Blueprint</h4>
            <p className="text-xs text-purple-300/70 font-mono">Linear Tasks ↔ Google Drive</p>
        </div>

        <button
          onClick={executeWorkflow}
          disabled={status === 'RUNNING'}
          className={`
            w-full py-3 px-4 rounded-lg font-mono font-bold transition-all flex items-center justify-center gap-2
            ${status === 'IDLE' ? 'bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 text-purple-400' : ''}
            ${status === 'RUNNING' ? 'bg-purple-900/50 border border-purple-500/50 text-purple-300' : ''}
            ${status === 'SUCCESS' ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-400' : ''}
            ${status === 'ERROR' ? 'bg-red-900/50 border border-red-500 text-red-400' : ''}
          `}
        >
          {status === 'IDLE' && <><Play className="w-4 h-4" /> EXECUTE PROTOCOL</>}
          {status === 'RUNNING' && <><Loader2 className="w-4 h-4 animate-spin" /> EXECUTING...</>}
          {status === 'SUCCESS' && <><CheckCircle className="w-4 h-4" /> COMPLETED</>}
          {status === 'ERROR' && <><AlertCircle className="w-4 h-4" /> FAILED</>}
        </button>
        
        {/* Plan Visualization */}
        {status === 'SUCCESS' && (
            <div className="w-full max-h-40 overflow-y-auto bg-slate-950 p-2 rounded border border-purple-500/30 text-[10px] font-mono text-purple-300">
                <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold">
                    <Terminal className="w-3 h-3" /> Delegation Plan Active
                </div>
                <div>Check console for full plan details.</div>
            </div>
        )}
        
        <div className="text-[10px] text-purple-500/50 font-mono">
            ID: nqjbQoNQeiu3kpGB
        </div>
      </div>
    </div>
  );
}
