import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Zap, Server, Cloud, GitBranch } from 'lucide-react';
import styles from '../styles/SystemStatusDashboard.module.css';

import { useNeuralSync } from './NeuralSyncProvider';

export default function SystemStatusDashboard() {
  // Hydrate state from active swarm
  const { agents, telemetry, isConnected } = useNeuralSync();
  const [refreshTime, setRefreshTime] = useState<string>('');

  React.useEffect(() => {
    setRefreshTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setRefreshTime(new Date().toLocaleTimeString());
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

  const services = [
    {
      name: 'Valentine Core',
      type: 'API Gateway',
      status: 'offline',
      health: 0,
      message: 'Not deployed - critical blocker',
      priority: 'critical'
    },
    {
      name: 'GitHub Integration',
      type: 'Code Repository',
      status: 'healthy',
      health: 100,
      message: 'Connected via webhook',
      priority: 'normal',
      metrics: { requests: 1247, errors: 3 }
    },
    {
      name: 'Linear Integration',
      type: 'Task Management',
      status: 'healthy',
      health: 98,
      message: 'API connected',
      priority: 'normal',
      metrics: { requests: 856, errors: 12 }
    },
    {
      name: 'Notion Integration',
      type: 'Knowledge Base',
      status: 'healthy',
      health: 95,
      message: 'Synced 2 hours ago',
      priority: 'normal',
      metrics: { requests: 423, errors: 8 }
    },
    {
      name: 'n8n Workflows',
      type: 'Automation',
      status: 'healthy',
      health: 92,
      message: '28 workflows active',
      priority: 'normal',
      metrics: { executions: 2341, failures: 47 }
    },
    {
      name: 'Shared Memory (Redis)',
      type: 'Cache',
      status: 'offline',
      health: 0,
      message: 'Not configured',
      priority: 'high'
    },
    {
      name: 'Message Queue',
      type: 'Task Queue',
      status: 'offline',
      health: 0,
      message: 'Awaiting Valentine Core',
      priority: 'high'
    },
    {
      name: 'PostgreSQL',
      type: 'Database',
      status: 'degraded',
      health: 60,
      message: 'Planned but not deployed',
      priority: 'medium'
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'idle':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
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

  const totalHealth = Math.round(
    services.reduce((sum, s) => sum + s.health, 0) / services.length
  );


  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-6 mb-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Activity className={`w-12 h-12 ${isConnected ? 'text-blue-400 animate-pulse' : 'text-red-500'}`} />
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 mb-1">System Status Dashboard</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                <p className="text-blue-300/80 text-sm font-mono">
                  {isConnected ? 'AI Mastermind Alliance // Real-Time Monitoring' : 'SYSTEM DISCONNECTED // RECONNECTING...'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-300/60 mb-1 font-mono">LAST UPDATE: {refreshTime}</div>
            <div className="text-4xl font-bold text-white tracking-tighter">
              {isConnected ? Math.round((telemetry.memory + telemetry.network + telemetry.cpu) / 3) : 0}%
            </div>
          </div>
        </div>

        {/* Overall Health Bar */}
        <div className="mt-6">
          <div className="w-full bg-black/40 rounded-full h-3 backdrop-blur-md border border-white/5">
            <div
              className={`bg-gradient-to-r ${getHealthColor(totalHealth)} h-3 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] ${styles['w' + totalHealth]}`}
            />
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
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
                <button
                  onClick={() => { /* TODO: implement task reassignment */ }}
                  className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 text-blue-300 rounded text-xs font-bold tracking-wider transition-colors"
                >
                  REASSIGN
                </button>
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded text-xs font-bold tracking-wider">
                  BLOCKED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="bg-slate-900/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Zap className="w-5 h-5 text-purple-400" />
          AI Agent Fleet Status
        </h2>
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
                  <div className="bg-black/20 rounded p-2 flex justify-between items-center">
                    <span className="text-slate-400">REQ:</span>
                    <span className="font-bold text-slate-300 font-mono">{service.metrics.requests?.toLocaleString()}</span>
                    {service.metrics.executions && (
                      <>
                        <span className="text-slate-400 ml-2">EXEC:</span>
                        <span className="font-bold text-slate-300 font-mono">{service.metrics.executions.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                  <div className="bg-black/20 rounded p-2 flex justify-between items-center">
                    <span className="text-slate-400">ERR:</span>
                    <span className="font-bold text-red-400 font-mono">{service.metrics.errors || service.metrics.failures}</span>
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
