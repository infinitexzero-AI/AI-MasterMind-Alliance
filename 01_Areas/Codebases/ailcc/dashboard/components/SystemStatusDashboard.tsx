import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap, Server, Cloud, GitBranch } from 'lucide-react';
import styles from '../styles/SystemStatusDashboard.module.css';

import { useNeuralSync } from './NeuralSyncProvider';
import LobsterCLI from './LobsterCLI';

export default function SystemStatusDashboard() {
  // Hydrate state from active swarm
  const { agents, telemetry, pm2Status } = useNeuralSync();

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Periodic refresh trigger if needed
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Agents are now sourced directly from NeuralSyncProvider context
  // Fallback if no agents connected
  const displayAgents = agents.length > 0 ? agents.map((n: any) => ({
    name: n.name,
    role: n.role || 'Agent',
    status: n.status.toLowerCase(),
    access: n.role === 'PRIME' ? 'ADMIN' : n.role === 'CORE' ? 'WRITE' : 'READ',
    lastActive: n.status === 'EXECUTING' ? 'Working...' : 'Standby',
    tasksCompleted: 0, // Telemetry TODO
    tasksActive: n.status === 'EXECUTING' ? 1 : 0,
    uptime: '100%'
  })) : [
    {
      name: 'System Offline',
      role: 'Disconnected',
      status: 'offline',
      access: 'NONE',
      lastActive: '--',
      tasksCompleted: 0,
      tasksActive: 0,
      uptime: '0%'
    }
  ];

  // Map PM2 processes to the services view
  const services = pm2Status.length > 0 ? pm2Status.map(p => ({
    name: p.name,
    type: p.id === 0 ? 'Next.js Frontend' : p.id === 1 ? 'Socket Relay' : p.id === 2 ? 'AI Core' : 'Vanguard Peer',
    status: p.status === 'online' ? 'healthy' : 'offline',
    health: p.status === 'online' ? 100 : 0,
    message: p.status === 'online' ? `Running in ${p.mode} mode` : 'Process down',
    priority: p.id <= 1 ? 'critical' : 'high',
    metrics: { cpu: p.cpu, memory: p.memory }
  })) : [
    {
      name: 'Neural Relay',
      type: 'Socket Service',
      status: 'offline',
      health: 0,
      message: 'Awaiting connection to Port 3001...',
      priority: 'critical',
      metrics: { cpu: 0, memory: '0mb' }
    }
  ];

  const integrations = [
    { name: 'Google Drive', status: 'healthy', synced: '15 min ago', files: 1247 },
    { name: 'OneDrive', status: 'healthy', synced: '22 min ago', files: 834 },
    { name: 'iCloud', status: 'healthy', synced: '18 min ago', files: 567 },
    { name: 'Gmail/Outlook', status: 'healthy', synced: '5 min ago', emails: 2341 }
  ];

  const criticalTasks = [
    { id: 'T-UI-01', name: 'Deploy Valentine Core', agent: 'ChatGPT', priority: 'critical', status: 'blocked' },
    { id: 'T-UI-02', name: 'Design Shared Memory', agent: 'Grok', priority: 'critical', status: 'in-progress' },
    { id: 'T-UI-03', name: 'Create Message Queue', agent: 'ChatGPT', priority: 'high', status: 'not-started' }
  ];



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'PEAK':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'idle':
      case 'degraded':
      case 'BALANCED':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'offline':
      case 'blocked':
      case 'SUPPRESSED':
        return <Zap className="w-5 h-5 text-orange-400 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'from-green-500 to-emerald-600';
    if (health >= 70) return 'from-yellow-500 to-orange-600';
    if (health >= 40) return 'from-orange-500 to-red-600';
    return 'from-red-500 to-red-800';
  };


  return (
    <div className="space-y-6">
      {/* Distributed Node Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node: MacBook Command */}
        <div className="bg-slate-900/40 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="font-bold text-lg text-white">COMMAND CENTER</h3>
                <p className="text-xs text-blue-300/60 font-mono">MacBook Pro M-Series</p>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/40`}>
              ORCHESTRATOR
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">CPU</div>
                <div className="text-lg font-bold text-blue-300 font-mono">{Math.round(telemetry.cpu)}%</div>
             </div>
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">RAM</div>
                <div className="text-lg font-bold text-blue-300 font-mono">{Math.round(telemetry.memory)}%</div>
             </div>
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">TEMP</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">42°C</div>
             </div>
          </div>
        </div>

        {/* Node: ThinkPad Vanguard */}
        <div className="bg-slate-900/40 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="font-bold text-lg text-white">VANGUARD COMPUTE</h3>
                <p className="text-xs text-purple-300/60 font-mono">ThinkPad Windows 11</p>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${telemetry.status === 'PEAK' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'}`}>
              {telemetry.status || 'BALANCED'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">CPU</div>
                <div className="text-lg font-bold text-purple-300 font-mono">12%</div>
             </div>
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">GPU</div>
                <div className="text-lg font-bold text-purple-300 font-mono">Active</div>
             </div>
             <div className="bg-black/20 p-2 rounded border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase mb-1">DISK</div>
                <div className="text-lg font-bold text-blue-300 font-mono">NVMe</div>
             </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts - Filtered for real blockers */}
      {criticalTasks.filter(t => t.status === 'blocked').length > 0 && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 animate-pulse text-red-500" />
            CRITICAL BLOCKERS
          </h2>
          <div className="space-y-3">
            {criticalTasks.filter(t => t.status === 'blocked').map(task => (
              <div key={task.id} className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-100">{task.name}</div>
                  <div className="text-sm text-red-300/70 font-mono">Assigned to: {task.agent}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded text-xs font-bold tracking-wider">
                    BLOCKED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Deployment: Lobster CLI */}
      <div className="bg-slate-900/40 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.05)]">
        <h2 className="text-xl font-bold text-emerald-200 mb-6 flex items-center gap-3 uppercase tracking-wider">
          <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
          Neural Link: Strategic Command
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <LobsterCLI />
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAgents.map((agent: any, idx: number) => (
            <div key={idx} className="bg-slate-800/40 border border-white/5 rounded-lg p-4 hover:border-purple-500/30 hover:bg-slate-800/60 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-200 group-hover:text-purple-300 transition-colors">{agent.name}</h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{agent.role}</p>
                </div>
                {getStatusIcon(agent.status)}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">ACCESS:</span>
                  <span className={`font-bold ${agent.access === 'ADMIN' ? 'text-red-400' :
                      agent.access === 'WRITE' ? 'text-emerald-400' :
                        agent.access === 'SYSTEM' ? 'text-purple-400' :
                          'text-blue-400'
                    }`}>
                    {agent.access}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">ACTIVE:</span>
                  <span className="text-slate-400">{agent.lastActive}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-black/20 rounded p-2 border border-white/5">
                  <div className="text-lg font-bold text-blue-400 font-mono">{agent.tasksCompleted}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Done</div>
                </div>
                <div className="bg-black/20 rounded p-2 border border-white/5">
                  <div className="text-lg font-bold text-emerald-400 font-mono">{agent.tasksActive}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Active</div>
                </div>
              </div>

              <div className="mt-3 text-center border-t border-white/5 pt-2">
                <span className="text-[10px] text-slate-400 uppercase mr-2">Uptime</span>
                <span className="text-xs font-bold text-slate-400 font-mono">{agent.uptime}</span>
              </div>
            </div>
          ))}
        </div>

      {/* Services Status */}
      <div className="bg-slate-900/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Server className="w-5 h-5 text-blue-400" />
          Core Services
        </h2>
        <div className="space-y-3">
          {services.map((service, idx) => (
            <div key={idx} className={`border-l-2 rounded-r-lg p-4 bg-slate-800/30 ${service.status === 'offline' ? 'border-red-500/50' :
                service.status === 'degraded' ? 'border-yellow-500/50' :
                  'border-emerald-500/50'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-bold text-slate-300">{service.name}</h3>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">{service.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-200 font-mono">{service.health}%</div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${service.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      service.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        service.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                    {service.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3 font-mono border-b border-white/5 pb-2">{service.message}</p>

              {service.metrics && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/20 rounded p-2 flex justify-between items-center text-emerald-400">
                    <span className="text-slate-400">CPU:</span>
                    <span className="font-bold font-mono">{service.metrics.cpu}%</span>
                  </div>
                  <div className="bg-black/20 rounded p-2 flex justify-between items-center text-blue-400">
                    <span className="text-slate-400">MEM:</span>
                    <span className="font-bold font-mono">{service.metrics.memory}</span>
                  </div>
                </div>
              )}

              {service.health > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div
                      className={`bg-gradient-to-r ${getHealthColor(service.health)} h-1.5 rounded-full ${styles['w' + service.health]}`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            CLOUD MESH
          </h2>
          <div className="space-y-3">
            {integrations.map((int, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-white/5">
                <div>
                  <div className="font-semibold text-slate-300 text-sm">{int.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Synced: {int.synced}</div>
                </div>
                <div className="text-right">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mb-1 ml-auto" />
                  <div className="text-[10px] text-slate-400 font-mono">
                    {int.files && `${int.files} files`}
                    {int.emails && `${int.emails} emails`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-orange-400" />
            ACTIVE DIRECTIVES
          </h2>
          <div className="space-y-3">
            {criticalTasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-white/5">
                <div className="flex-1">
                  <div className="font-semibold text-slate-300 text-sm">{task.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Assigned: {task.agent}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${task.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                    task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                  }`}>
                  {task.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
