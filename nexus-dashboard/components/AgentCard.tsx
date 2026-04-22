import React from 'react';
import { Agent } from '../types/DashboardInterfaces';

interface AgentCardProps {
  agent: Agent;
}

function AgentCardComponent({ agent }: AgentCardProps) {
  // Map standard status to color scheme
  const statusColor: Record<string, string> = {
    IDLE: 'border-slate-500/30',
    THINKING: 'border-yellow-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    EXECUTING: 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    OFFLINE: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
  };

  const currentColor = statusColor[agent.status] || 'border-slate-500/30';

  const dotColorMap: Record<string, string> = {
    IDLE: 'bg-slate-500',
    THINKING: 'bg-yellow-500',
    EXECUTING: 'bg-blue-500',
    OFFLINE: 'bg-red-500'
  };

  const currentDotColor = dotColorMap[agent.status] || 'bg-slate-500';

  return (
    <div className={`glass-card p-5 rounded-xl border ${currentColor} relative overflow-hidden group`}>
      {/* Background Pulse Effect on Status */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${currentDotColor.replace('bg-', 'bg-opacity-10 bg-')} blur-[40px] rounded-full -mr-16 -mt-16 transition-all`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-lg capitalize text-white tracking-wide">{agent.name}</h3>
          <p className="text-xs text-blue-300 font-medium">{agent.role}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${currentDotColor} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2 font-medium text-sm text-slate-200">
            {agent.status === 'EXECUTING' || agent.status === 'THINKING' ? (
              <span className="flex items-center gap-2 text-blue-400">
                <IconSpinner /> {agent.status}
              </span>
            ) : (
              <span className="text-slate-400 capitalize">{agent.status}</span>
            )}
          </div>
        </div>

        {agent.currentTask && (
          <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Active Task</p>
            <p className="font-mono text-xs text-emerald-400 truncate" title={agent.currentTask}>
              {agent.currentTask}
            </p>
          </div>
        )}

        {agent.neuromorphic && (
          <div className="bg-blue-950/20 p-3 rounded-lg border border-blue-500/10">
            <p className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">Neuromorphic Context</p>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-white font-medium">
                {agent.neuromorphic.archetype}
              </span>
              <span className="text-[10px] text-blue-300/70 italic">
                {agent.neuromorphic.cellType} • {agent.neuromorphic.heritage}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/5">
          <div>
            <span className="block font-bold text-white text-lg">${(agent.costSession ?? 0).toFixed(4)}</span>
            <span className="text-slate-400">Session Cost</span>
          </div>
          <div className="text-right">
            <span className="block font-bold text-white text-lg">{agent.id?.slice(0, 4) ?? '—'}</span>
            <span className="text-slate-400">ID</span>
          </div>
        </div>

        {/* Control Surface */}
        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => sendSignal('stop_agent')}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded py-1 text-xs font-mono uppercase transition-colors"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );

  async function sendSignal(signal: string) {
    try {
      await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'antigravity_dev_key'
        },
        body: JSON.stringify({
          title: `${signal} ${agent.name}`,
          targetAgent: agent.name,
          priority: 'critical'
        })
      });
    } catch (e) {
      console.error("Signal Failed", e);
    }
  }
}

function IconSpinner() {
  return (
    <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// Memoized export to prevent unnecessary re-renders
const AgentCard = React.memo(AgentCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.agent.id === nextProps.agent.id &&
    prevProps.agent.status === nextProps.agent.status &&
    prevProps.agent.currentTask === nextProps.agent.currentTask &&
    prevProps.agent.costSession === nextProps.agent.costSession
  );
});

export default AgentCard;
