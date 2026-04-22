import { Activity, Zap, Clock, ShieldCheck, Search, Database } from 'lucide-react';
import Head from 'next/head';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import NexusLayout from '../components/NexusLayout';
import { CometInput } from '../components/CometInput';


export default function CometDashboard() {
  const { actionPlan, signals, isConnected, dispatchTask } = useSwarmTelemetry();

  return (
    <NexusLayout>
      <Head>
        <title>Comet | Antigravity AI</title>
      </Head>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              Comet Orchestrator
            </h1>
            <div className="flex items-center space-x-4">
              <p className="text-slate-400 font-mono text-sm">COMET ORCHESTRATOR // WEB SYNTHESIS</p>
              {actionPlan && (
                <span className="text-[10px] font-mono bg-slate-800/50 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400">
                  ACTIVE: {actionPlan.id || 'PLAN_X'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className={`${isConnected ? 'text-emerald-400' : 'text-amber-400'} text-xs font-bold tracking-wider`}>
              {isConnected ? 'RELAY ONLINE' : 'UPLINK PENDING'}
            </span>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="renaissance-panel p-6">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Zap className="w-4 h-4 mr-2 text-purple-400" /> Web Actions
            </div>
            <div className="text-5xl font-bold text-slate-100 mb-2">
              {actionPlan ? (actionPlan.steps || []).filter((s:any) => s.status === 'completed').length : 0}
            </div>
            <div className="text-xs text-slate-400">Successful steps in current plan</div>
          </div>

          <div className="renaissance-panel p-6">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Activity className="w-4 h-4 mr-2 text-cyan-400" /> Active Plan
            </div>
            <div className="text-xl font-bold text-slate-100 mb-2 max-w-full truncate">
              {actionPlan ? actionPlan.title : 'Idle'}
            </div>
            <div className="text-xs text-cyan-400 font-mono">
              STATUS: {actionPlan ? actionPlan.status : 'AWAITING'}
            </div>
          </div>

          <div className="renaissance-panel p-6">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Clock className="w-4 h-4 mr-2 text-amber-400" /> Synapse Count
            </div>
            <div className="text-4xl font-bold text-slate-100 mb-2">
               {signals.length}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Event Bus Streams
            </div>
          </div>
        </div>

        {/* Comet Input Section */}
        <div className="mb-12">
          <CometInput onSubmit={async (commandData) => {
             console.log("Dispatching Comet Research Task:", commandData);
             dispatchTask({ 
                 intent: 'WEB_RESEARCH', 
                 payload: commandData,
                 target: 'comet_browser_daemon',
                 timestamp: new Date().toISOString()
             });
          }} />
        </div>

        {/* Neural Synapse Log Section */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <div className="renaissance-panel p-6 max-h-[400px] overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
              <Database className="w-4 h-4 mr-2 text-emerald-400" /> Comet Extraction Log
            </h3>
            <div className="space-y-3">
              {signals
                .filter(sig => sig.source === 'SYSTEM' || sig.type === 'LOG' || sig.message.includes('Chrome'))
                .slice(0, 10)
                .map((sig, i) => (
                  <div key={sig.signal_id || i} className="flex items-start p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="mr-3 mt-1">
                      {sig.severity === 'CRITICAL' ? (
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      ) : (
                         <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium text-slate-200">{sig.message}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">
                        {new Date(sig.timestamp).toLocaleTimeString()} // {sig.source || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
              ))}
              {signals.length === 0 && (
                  <div className="text-sm text-slate-500 italic">No extraction data mapped.</div>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Table */}
        <div className="renaissance-panel p-8">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-3 text-cyan-400" />
            Live Execution Plan
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 font-mono uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 pl-4">Step Target</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {actionPlan ? actionPlan.steps.map((step: any, i: number) => (
                    <tr key={step.id || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-4 font-bold text-slate-200 flex flex-col gap-1">
                        <span>{step.title}</span>
                        {step.paraBucket && (
                           <span className="text-[9px] w-max px-2 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-slate-400">
                             {step.paraBucket}
                           </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          step.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {step.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 font-mono text-xs">
                        {actionPlan.id} // PLAN ID
                      </td>
                    </tr>
                )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500 italic text-sm">
                        No active Mastermind execution plan detected...
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* LONG-TERM DELEGATION SIDEBAR (Interface Integration) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 renaissance-panel p-8 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-slate-100 mb-4 tracking-tight">
              UI Interoperability Delegation
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Delegating recursive UI optimization and cross-system functionality to Comet (Perplexity Scout).
              Comet will maintain adaptive responsiveness and bridge storage hooks across the ecosystem.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.perplexity.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-lg text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center"
              >
                <Search className="w-4 h-4 mr-2" /> Open Perplexity Browser
              </a>
              <button 
                onClick={async () => {
                    await fetch('/api/execute-proposal', { method: 'POST', body: JSON.stringify({ command: 'node scripts/launch_comet.js' }) });
                    // Also dispatch initialization task to swarm memory
                    dispatchTask({
                        intent: 'INITIALIZE_ASSISTANT',
                        payload: { command: 'Launch Perplexity Sidebar and attach Comet Observer' },
                        target: 'comet_browser_daemon',
                        timestamp: new Date().toISOString()
                    });
                }}
                className="px-6 py-2 bg-slate-800 border border-white/10 rounded-lg text-cyan-400 hover:text-cyan-300 font-bold text-sm hover:bg-slate-700 hover:border-cyan-500/50 transition-all shadow-lg flex items-center group"
              >
                <Activity className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" /> Initialize Sidebar Assistant
              </button>
            </div>
          </div>
          <div className="renaissance-panel p-6 bg-purple-900/10 border-purple-500/20">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Delegation Queue</h3>
            <ul className="space-y-4 text-xs font-mono">
              <li className="flex justify-between items-center text-slate-300">
                <span>Memory Mesh Sync</span>
                <span className="text-emerald-400 text-[10px]">ACTIVE</span>
              </li>
              <li className="flex justify-between items-center text-slate-400">
                <span>UI Adaptive Layout</span>
                <span className="text-cyan-400 text-[10px]">RECURSIVE</span>
              </li>
              <li className="flex justify-between items-center text-slate-400">
                <span>XDrive Migration</span>
                <span className="text-amber-400 text-[10px]">PENDING</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </NexusLayout>
  );
}
