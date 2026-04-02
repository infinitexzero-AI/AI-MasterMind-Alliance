import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NexusLayout from '../../components/NexusLayout';
import { Bot, TerminalSquare, Activity, ShieldCheck, Play, CheckCircle2 } from 'lucide-react';
import { useSwarmTelemetry } from '../../hooks/useSwarmTelemetry';

export default function AgentDynamicRoute() {
  const router = useRouter();
  const { id } = router.query;
  const agentId = typeof id === 'string' ? id.toUpperCase() : 'UNKNOWN';
  
  const { isConnected, dispatchTask } = useSwarmTelemetry();
  const [payloadText, setPayloadText] = useState(`{\n  "directive": "Enter task description here...",\n  "priority": "HIGH"\n}`);
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  // Mock schema configuration based on ID
  const agentSchema = {
    COMET: { role: 'Scout', endpoint: '/api/swarm/comet' },
    GROK: { role: 'Architect', endpoint: '/api/swarm/grok' },
    VALENTINE: { role: 'Visionary', endpoint: '/api/swarm/valentine' },
    ANTIGRAVITY: { role: 'Execution Daemon', endpoint: '/api/swarm/antigravity' },
    SYSTEM: { role: 'Orchestrator', endpoint: '/api/swarm/system' }
  }[agentId] || { role: 'Agent Node', endpoint: `/api/swarm/${id}` };

  const handleDispatch = () => {
      try {
          setIsDispatching(true);
          const parsedCommand = JSON.parse(payloadText);
          const formattedTask = {
              id: `cli-${Date.now()}`,
              agent: agentId,
              ...parsedCommand,
              timestamp: new Date().toISOString()
          };
          
          const success = dispatchTask(formattedTask);
          if (success) {
              setLastDispatched(formattedTask.directive || 'Command Executed');
              setTimeout(() => setLastDispatched(null), 4000);
          }
      } catch (err) {
          alert("Invalid JSON Payload format.");
      } finally {
          setIsDispatching(false);
      }
  };

  return (
    <NexusLayout>
      <Head>
        <title>{agentId} | Swarm Identity</title>
      </Head>
      
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        {/* Header Ribbon */}
        <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
          <div className="w-16 h-16 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
             <h1 className="text-3xl font-bold tracking-tighter text-white">{agentId}</h1>
             <p className="font-mono text-[10px] text-cyan-400 tracking-widest uppercase">
                {agentSchema.role} / Authorized Node
             </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
             <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">
                 {isConnected ? 'Connection Stable' : 'Node Offline'}
             </span>
          </div>
        </div>

        {/* Console / Executor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-slate-400 border-b border-slate-700/50 pb-2">
                <TerminalSquare className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-widest uppercase">Payload Builder</h2>
             </div>
             <div>
                <label className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1 block">Contract Endpoint</label>
                <div className="bg-black/50 p-3 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                   POST {agentSchema.endpoint}
                </div>
             </div>
              <div className="flex-1 flex flex-col">
                 <label className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1 block">Input Schema (JSON)</label>
                 <textarea 
                    value={payloadText}
                    title="Agent Schema Input Payload"
                    placeholder={`{\n  "directive": "Enter task description here...",\n  "priority": "HIGH"\n}`}
                    onChange={(e) => setPayloadText(e.target.value)}
                    className="flex-1 w-full bg-black/50 border border-slate-700/50 rounded p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-500 resize-none min-h-[200px]"
                 />
              </div>
              
              {lastDispatched && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded flex items-center gap-2 text-emerald-400 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Redis Queue Dispatched!
                  </div>
              )}

              <button 
                 onClick={handleDispatch}
                 disabled={!isConnected || isDispatching}
                 className={`w-full py-3 font-bold uppercase tracking-widest text-[10px] rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]
                 ${!isConnected ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-black'}`}>
                 <Play className="w-3 h-3" /> {isDispatching ? 'Transmitting...' : 'Execute Sequence'}
              </button>
           </div>

          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-slate-400 border-b border-slate-700/50 pb-2">
                <Activity className="w-4 h-4" />
                <h2 className="text-xs font-mono tracking-widest uppercase">Agent Run Log</h2>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                 {/* Mock Run History */}
                 <div className="bg-black/30 p-4 border-l-2 border-emerald-500 rounded">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-500 font-mono">11:42:05 AM</span>
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-300 font-mono">Synthesize recent syllabus objectives.</p>
                 </div>
                 <div className="bg-black/30 p-4 border-l-2 border-emerald-500 rounded">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-500 font-mono">09:15:22 AM</span>
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-300 font-mono">Process transcript handshakes for Winter 2026.</p>
                 </div>
             </div>
          </div>
        </div>

      </div>
    </NexusLayout>
  );
}
