import React, { useState } from 'react';
import { Zap, Shield, Search, Code, Brain, Satellite } from 'lucide-react';

export default function FleetHangar() {
  const [agents, setAgents] = useState([
    {
      id: 'comet',
      name: 'Comet',
      role: 'Scout',
      status: 'standby',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      engine: 0,
      activeTask: null,
      capabilities: ['Research', 'Browser Automation', 'Email'],
      syncStatus: 'ready'
    },
    {
      id: 'gemini',
      name: 'Gemini (Antigravity)',
      role: 'Craftsman',
      status: 'synced',
      icon: Brain,
      color: 'from-yellow-500 to-orange-500',
      engine: 100,
      activeTask: 'UI Analysis',
      capabilities: ['Local Control', 'Multi-modal', 'Google Suite'],
      syncStatus: 'active'
    },
    {
      id: 'grok-arch',
      name: 'Grok',
      role: 'Architect',
      status: 'offline',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      engine: 0,
      activeTask: null,
      capabilities: ['Architecture', 'Analysis', 'Documentation'],
      syncStatus: 'disconnected'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      role: 'Multi-Tool',
      status: 'standby',
      icon: Code,
      color: 'from-green-500 to-emerald-500',
      engine: 0,
      activeTask: null,
      capabilities: ['Coding', 'Integration', 'Automation'],
      syncStatus: 'ready'
    },
    {
      id: 'grok',
      name: 'Grok',
      role: 'Judge',
      status: 'standby',
      icon: Satellite,
      color: 'from-purple-500 to-pink-500',
      engine: 0,
      activeTask: null,
      capabilities: ['Strategy', 'Analysis', 'X Integration'],
      syncStatus: 'ready'
    }
  ]);

  const assignTask = (agentId: string, task: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId
        //@ts-ignore
        ? { ...agent, status: 'active', engine: 100, activeTask: task }
        : agent
    ));
  };

  const releaseAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId
        //@ts-ignore
        ? { ...agent, status: 'standby', engine: 0, activeTask: null }
        : agent
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Fleet Readiness Hangar</h1>
              <p className="text-purple-300/80 font-mono text-sm">Agent Status Monitor // LOCKSTEP_PROTOCOL_V1</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {agents.filter(a => a.status === 'active' || a.status === 'synced').length}/{agents.length}
              </div>
              <div className="text-green-300/60 text-sm">Agents Online</div>
            </div>
          </div>
        </div>

        {/* Fleet Status Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400">
              {agents.filter(a => a.status === 'active' || a.status === 'synced').length}
            </div>
            <div className="text-green-300/60 text-sm">Active Missions</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-yellow-400">
              {agents.filter(a => a.status === 'standby').length}
            </div>
            <div className="text-yellow-300/60 text-sm">Ready to Deploy</div>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-red-400">
              {agents.filter(a => a.status === 'offline').length}
            </div>
            <div className="text-red-300/60 text-sm">Offline</div>
          </div>
        </div>

        {/* Hangar Bays */}
        <div className="space-y-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = agent.status === 'active' || agent.status === 'synced';
            
            return (
              <div
                key={agent.id}
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-500 ${
                  isActive
                    ? 'border-green-500 bg-gradient-to-r from-green-900/30 to-cyan-900/30'
                    : agent.status === 'offline'
                    ? 'border-gray-700 bg-gray-900/20'
                    : 'border-blue-500/30 bg-blue-900/10'
                }`}
              >
                {/* Animated Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse" />
                )}

                <div className="relative p-6">
                  <div className="flex items-center gap-6">
                    {/* Agent Icon/Avatar */}
                    <div className="relative">
                      <div
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center relative ${
                          isActive ? 'animate-pulse shadow-[0_0_40px_rgba(34,197,94,0.5)]' : 'opacity-50'
                        }`}
                      >
                        <Icon className="w-12 h-12 text-white" />
                        
                        {/* Engine Status Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke={isActive ? '#22c55e' : '#374151'}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="276.46"
                            strokeDashoffset={276.46 - (276.46 * agent.engine) / 100}
                            className="transition-all duration-1000"
                          />
                        </svg>
                      </div>

                      {/* Sync Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center ${
                        agent.syncStatus === 'active' ? 'bg-green-500' :
                        agent.syncStatus === 'ready' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full bg-white ${
                          agent.syncStatus === 'active' ? 'animate-pulse' : ''
                        }`} />
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{agent.name}</h3>
                          <p className="text-white/60 font-mono text-sm">{agent.role}</p>
                        </div>
                        <div className="text-right">
                          <div className={`px-4 py-2 rounded-full font-mono text-sm font-bold ${
                            isActive ? 'bg-green-500 text-white' :
                            agent.status === 'offline' ? 'bg-gray-700 text-gray-400' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {agent.status.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Engine Power */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/60 font-mono">Engine Power</span>
                          <span className="text-white font-mono">{agent.engine}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              agent.engine > 0 ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-gray-700'
                            }`}
                            ref={(el) => { if (el) el.style.width = `${agent.engine}%`; }}
                          />
                        </div>
                      </div>

                      {/* Active Task */}
                      {agent.activeTask && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-3">
                          <div className="text-xs text-green-300 font-mono mb-1">ACTIVE MISSION</div>
                          <div className="text-white font-semibold">{agent.activeTask}</div>
                        </div>
                      )}

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {agent.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/10 rounded text-xs text-white/80 font-mono"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      {/* Neural Sync Connection */}
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.syncStatus === 'active' ? 'bg-green-500 animate-pulse' :
                          agent.syncStatus === 'ready' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`} />
                        <span className="text-white/60 font-mono">
                          Neural Sync: {agent.syncStatus === 'active' ? 'CONNECTED' : 
                                       agent.syncStatus === 'ready' ? 'READY' : 
                                       'DISCONNECTED'}
                        </span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-col gap-2">
                      {agent.status === 'standby' && (
                        <>
                          <button
                            onClick={() => assignTask(agent.id, 'Deploy Valentine Core')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-mono text-sm transition-all flex items-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Deploy
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded font-mono text-sm transition-all"
                          >
                            Configure
                          </button>
                        </>
                      )}
                      {isActive && (
                        <>
                          <button
                            onClick={() => releaseAgent(agent.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-mono text-sm transition-all"
                          >
                            Recall
                          </button>
                          <button
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded font-mono text-sm transition-all"
                          >
                            Monitor
                          </button>
                        </>
                      )}
                      {agent.status === 'offline' && (
                        <button
                          className="px-4 py-2 bg-gray-700 text-gray-400 rounded font-mono text-sm cursor-not-allowed"
                          disabled
                        >
                          Offline
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Engine Start Animation */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
