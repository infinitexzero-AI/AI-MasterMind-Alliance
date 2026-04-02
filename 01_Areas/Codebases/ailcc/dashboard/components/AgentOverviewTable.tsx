import React from 'react';

interface AgentMetrics {
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  latency: number;
  tokens: number;
  successRate: number;
}

const SuccessBar: React.FC<{ rate: number }> = ({ rate }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.style.width = `${rate}%`;
  }, [rate]);
  return (
    <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
      <div ref={ref} className="h-full bg-emerald-500 transition-all duration-500" />
    </div>
  );
};

const AgentRow: React.FC<{ agent: AgentMetrics }> = ({ agent }) => (
  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
        <span className="font-mono text-xs text-slate-200">{agent.name}</span>
      </div>
    </td>
    <td className="py-3 px-4 text-[10px] font-mono text-slate-400 uppercase">{agent.role}</td>
    <td className="py-3 px-4 text-xs font-mono text-cyan-400">{agent.latency}ms</td>
    <td className="py-3 px-4 text-xs font-mono text-purple-400">{agent.tokens.toLocaleString()}</td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <SuccessBar rate={agent.successRate} />
        <span className="text-[10px] font-mono text-slate-400">{agent.successRate}%</span>
      </div>
    </td>
  </tr>
);

export const AgentOverviewTable: React.FC<{ agents: AgentMetrics[] }> = ({ agents }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">Active Agent Roster</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950/50">
              <th className="py-3 px-4 font-semibold">Agent Name</th>
              <th className="py-3 px-4 font-semibold">Mission Role</th>
              <th className="py-3 px-4 font-semibold">Latency</th>
              <th className="py-3 px-4 font-semibold">Tokens</th>
              <th className="py-3 px-4 font-semibold">Health</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(a => <AgentRow key={a.name} agent={a} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
