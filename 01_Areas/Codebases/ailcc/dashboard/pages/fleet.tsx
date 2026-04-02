import { Activity, Server, Cpu, Layers, HardDrive, ShieldCheck } from 'lucide-react';
import Head from 'next/head';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import NexusLayout from '../components/NexusLayout';

export default function FleetDashboard() {
  const { hardwareStats, tasks, isConnected, signals } = useSwarmTelemetry();

  // Parse Docker containers from hardwareStats if available
  const activeNodes = hardwareStats?.docker_containers || [];
  const systemCpu = hardwareStats?.cpu_percent || 0;
  const systemRam = hardwareStats?.ram_percent || 0;

  return (
    <NexusLayout>
      <Head>
        <title>Fleet Radar | AILCC Mastermind</title>
      </Head>

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
              Legion Fleet Operations
            </h1>
            <div className="flex items-center space-x-4">
              <p className="text-slate-400 font-mono text-sm">CROSS-SWARM DELEGATION // TOPOGRAPHICAL RADAR</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-indigo-500' : 'bg-red-500'}`}></div>
            <span className={`${isConnected ? 'text-indigo-400' : 'text-red-400'} text-xs font-bold tracking-wider`}>
              {isConnected ? 'FLEET UPLINK ESTABLISHED' : 'SENSOR ARRAY OFFLINE'}
            </span>
          </div>
        </header>

        {/* Global Cluster Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="renaissance-panel p-6 border-l-4 border-indigo-500">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Server className="w-4 h-4 mr-2 text-indigo-400" /> Active Nodes
            </div>
            <div className="text-4xl font-bold text-slate-100 mb-2">
              {activeNodes.length || 0}
            </div>
            <div className="text-xs text-indigo-400 font-mono">
              Docker Containers
            </div>
          </div>

          <div className="renaissance-panel p-6 border-l-4 border-cyan-500">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Cpu className="w-4 h-4 mr-2 text-cyan-400" /> Host Compute
            </div>
            <div className="text-4xl font-bold text-slate-100 mb-2">
              {systemCpu.toFixed(1)}%
            </div>
            <div className="text-xs text-cyan-400 font-mono">
              Aggregate CPU Load
            </div>
          </div>

          <div className="renaissance-panel p-6 border-l-4 border-amber-500">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <HardDrive className="w-4 h-4 mr-2 text-amber-400" /> Host Memory
            </div>
            <div className="text-4xl font-bold text-slate-100 mb-2">
              {systemRam.toFixed(1)}%
            </div>
            <div className="text-xs text-amber-400 font-mono">
              RAM Saturation
            </div>
          </div>

          <div className="renaissance-panel p-6 border-l-4 border-emerald-500">
            <div className="flex items-center text-slate-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Layers className="w-4 h-4 mr-2 text-emerald-400" /> Active SubTasks
            </div>
            <div className="text-4xl font-bold text-slate-100 mb-2">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              Across Execution Network
            </div>
          </div>
        </div>

        {/* Node Topology */}
        <div className="renaissance-panel p-8 mb-12">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-3 text-indigo-400" />
            Topographical Container Radar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeNodes.length > 0 ? activeNodes.map((node: any, idx: number) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{node.name || 'Unknown_Node'}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${node.state === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {node.state?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>CPU Saturation</span>
                      <span>{node.cpu_percent || '0.00'}%</span>
                    </div>
                    <progress 
                      max="100" 
                      value={Math.min(parseFloat(node.cpu_percent || '0'), 100)}
                      className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-cyan-500 [&::-moz-progress-bar]:bg-cyan-500 bg-slate-700" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Memory Alloy</span>
                      <span>{node.mem_usage || 'Unknown'}</span>
                    </div>
                    <progress 
                      max="100" 
                      value={Math.min(parseFloat(node.mem_percent || '0'), 100)}
                      className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-purple-500 [&::-moz-progress-bar]:bg-purple-500 bg-slate-700" 
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-1 md:col-span-3 py-12 text-center text-slate-500 font-mono text-sm border-2 border-dashed border-white/5 rounded-xl">
                No Docker node telemetry detected.<br/>
                <span className="text-xs text-slate-600 mt-2 block">Ensure the orchestrator has socket mapping (-v /var/run/docker.sock:/var/run/docker.sock)</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Fleet Synapses */}
        <div className="renaissance-panel p-8">
           <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
            <Layers className="w-5 h-5 mr-3 text-cyan-400" />
            Live Routing Comm-Link
          </h2>
          <div className="space-y-4">
              {signals
                .slice(0, 8)
                .map((sig, i) => (
                  <div key={sig.signal_id || i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/5">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-4 ${sig.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}></div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{sig.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(sig.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono px-3 py-1 bg-slate-800 rounded border border-white/10 text-slate-300">
                      {sig.source || 'ORCHESTRATOR'}
                    </div>
                  </div>
              ))}
              {signals.length === 0 && (
                  <div className="text-sm text-slate-500 italic text-center py-4">Awaiting fleet transmissions...</div>
              )}
          </div>
        </div>

      </div>
    </NexusLayout>
  );
}
