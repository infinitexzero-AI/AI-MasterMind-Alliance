import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { io } from 'socket.io-client';


export default function SynapseNetwork() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pulsePhase, setPulsePhase] = useState(0);
  const [agents, setAgents] = useState([
    {
      id: 'comet',
      name: 'Comet',
      shortName: 'Cm',
      status: 'synced',
      syncStrength: 95,
      position: { x: 20, y: 30 },
      color: '#3b82f6',
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500',
      borderClass: 'border-blue-500'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      shortName: 'Ge',
      status: 'synced',
      syncStrength: 100,
      position: { x: 80, y: 25 },
      color: '#f59e0b',
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500',
      borderClass: 'border-amber-500'
    },
    {
      id: 'grok-arch',
      name: 'Grok',
      shortName: 'Cl',
      status: 'offline',
      syncStrength: 0,
      position: { x: 15, y: 70 },
      color: '#ef4444',
      colorClass: 'text-red-500',
      bgClass: 'bg-red-500',
      borderClass: 'border-red-500'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      shortName: 'Gp',
      status: 'awaiting',
      syncStrength: 45,
      position: { x: 75, y: 75 },
      color: '#22c55e',
      colorClass: 'text-green-500',
      bgClass: 'bg-green-500',
      borderClass: 'border-green-500'
    },
    {
      id: 'grok',
      name: 'Grok',
      shortName: 'Gk',
      status: 'awaiting',
      syncStrength: 60,
      position: { x: 50, y: 85 },
      color: '#a855f7',
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-500',
      borderClass: 'border-purple-500'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      shortName: 'Px',
      status: 'synced',
      syncStrength: 88,
      position: { x: 85, y: 50 },
      color: '#06b6d4',
      colorClass: 'text-cyan-500',
      bgClass: 'bg-cyan-500',
      borderClass: 'border-cyan-500'
    }
  ]);

  // Socket Connection
  useEffect(() => {
    const socket = io('http://localhost:5005');

    socket.on('state:full', (state: any) => {
      if (state.agents) {
        updateAgents(state.agents);
      }
    });

    socket.on('state:update', (payload: any) => {
      if (payload.type === 'agents') {
        updateAgents(payload.data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateAgents = (remoteAgents: any[]) => {
    setAgents(prevAgents => {
      return prevAgents.map(localAgent => {
        const remote = remoteAgents.find((ra: any) => ra.id === localAgent.id);
        if (remote) {
          return {
            ...localAgent,
            status: remote.status,
            syncStrength: Math.round(remote.syncStrength),
            color: remote.color || localAgent.color // Optional: update color if server provides it
          };
        }
        return localAgent;
      });
    });
  };

  // Implement animation loop to use setPulsePhase
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame = (frame + 1) % 100;
      setPulsePhase(frame);
      requestAnimationFrame(animate);
    };
    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);



  const sharedBrain = {
    position: { x: 50, y: 45 },
    status: 'active'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return '#22c55e';
      case 'awaiting': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return CheckCircle;
      case 'awaiting': return AlertCircle;
      case 'offline': return XCircle;
      default: return AlertCircle;
    }
  };

  const calculateDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-xl border border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-12 h-12 text-purple-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Synapse Network</h1>
                <p className="text-purple-300/80 font-mono text-sm">Neural Sync Status // Agent Mesh Topology</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {agents.filter(a => a.status === 'synced').length}/{agents.length}
              </div>
              <div className="text-green-300/60 text-sm">Agents Synced</div>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-6">
          <div className="relative w-full h-[600px] bg-gradient-to-br from-black to-gray-900 rounded-lg overflow-hidden">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-10 grid-bg"
            />

            {/* Animated Scan Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {(() => {
                const scanLineStyle = {
                  transform: `translateY(${(pulsePhase * 6) % 600}px)`,
                  transition: 'transform 0.05s linear'
                };
                return (
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
                    {...{ style: scanLineStyle }}
                  />
                );
              })()}
            </div>

            <svg className="absolute inset-0 w-full h-full">
              <defs>
                {/* Glow filters */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Animated gradient for connections */}
                <linearGradient id="pulseGradient">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
                  <stop offset="50%" stopColor="rgba(6, 182, 212, 0.8)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
                </linearGradient>
              </defs>

              {/* Connection Lines */}
              {agents.map((agent) => {
                const x1 = (agent.position.x / 100) * 800;
                const y1 = (agent.position.y / 100) * 600;
                const x2 = (sharedBrain.position.x / 100) * 800;
                const y2 = (sharedBrain.position.y / 100) * 600;

                const distance = calculateDistance(agent.position, sharedBrain.position);
                const strokeWidth = agent.status === 'offline' ? 1 : 3;
                const opacity = agent.status === 'offline' ? 0.1 :
                  agent.status === 'awaiting' ? 0.4 : 0.8;

                return (
                  <g key={agent.id}>
                    {/* Base connection line */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={agent.status === 'offline' ? '#ef4444' : agent.color}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      strokeDasharray={agent.status === 'offline' ? '5,5' : 'none'}
                    />

                    {/* Pulse animation for synced agents */}
                    {agent.status === 'synced' && (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#pulseGradient)"
                        strokeWidth={strokeWidth + 2}
                        opacity={0.6}
                        strokeLinecap="round"
                        strokeDasharray={distance * 10}
                        strokeDashoffset={distance * 10 - (pulsePhase * distance / 10)}
                        filter="url(#glow)"
                      />
                    )}

                    {/* Data packets for high sync strength */}
                    {agent.syncStrength > 80 && agent.status === 'synced' && (
                      <circle
                        cx={x1 + (x2 - x1) * ((pulsePhase % 100) / 100)}
                        cy={y1 + (y2 - y1) * ((pulsePhase % 100) / 100)}
                        r="3"
                        fill={agent.color}
                        opacity="0.8"
                        filter="url(#glow)"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Shared Brain Hub */}
            {(() => {
              const brainStyle = {
                left: `${sharedBrain.position.x}%`,
                top: `${sharedBrain.position.y}%`
              };
              return (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  {...{ style: brainStyle }}
                >
                  <div className="relative">
                    {/* Outer pulse rings */}
                    {[...Array(3)].map((_, i) => {
                      const ringStyle = {
                        width: `${120 + i * 40}px`,
                        height: `${120 + i * 40}px`,
                        opacity: 0.3 - i * 0.1,
                        animation: `pulse-ring ${2 + i}s infinite ease-out`
                      };
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-500"
                          {...{ style: ringStyle }}
                        />
                      );
                    })}

                    {/* Main hub */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-cyan-400">
                      <Brain className="w-12 h-12 text-white" />

                      {/* Rotating energy ring */}
                      <div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/50 animate-spin"
                        {...{ style: { animationDuration: '3s' } }}
                      />
                    </div>

                    {/* Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center">
                      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-4 py-2">
                        <div className="text-cyan-400 font-bold text-sm whitespace-nowrap">Shared Brain</div>
                        <div className="text-cyan-300/60 text-xs font-mono">/AILCC_PRIME/SharedBrain</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Agent Nodes */}
            {
              agents.map((agent) => {
                const StatusIcon = getStatusIcon(agent.status);

                const agentStyle = {
                  '--agent-left': `${agent.position.x}%`,
                  '--agent-top': `${agent.position.y}%`,
                  '--agent-width': `${agent.syncStrength * 0.8 + 30}px`,
                  '--agent-height': `${agent.syncStrength * 0.8 + 30}px`,
                  '--agent-bg': `radial-gradient(circle, ${agent.color}40 0%, transparent 70%)`
                } as React.CSSProperties;

                const pulseStyle = {
                  backgroundColor: agent.color,
                  opacity: 0.3,
                  animation: 'pulse 2s infinite'
                };
                return (
                  <div
                    key={agent.id}
                    {...{ style: agentStyle }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 left-[var(--agent-left)] top-[var(--agent-top)]"
                  >
                    {/* Node pulse for synced agents */}
                    <div
                      className="absolute inset-0 rounded-full"
                      {...{ style: pulseStyle }}
                    />


                    {/* Main node */}
                    <div
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl cursor-pointer transition-transform hover:scale-110 ${agent.status === 'offline' ? 'bg-gray-800 border-gray-600 opacity-40' : `${agent.bgClass} ${agent.borderClass}`
                        }`}
                    >
                      <div className="text-white font-bold font-mono">{agent.shortName}</div>

                      {/* Status indicator */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/80 flex items-center justify-center">
                        <StatusIcon className={`w-4 h-4 ${agent.status === 'synced' ? 'text-green-500' :
                          agent.status === 'awaiting' ? 'text-amber-500' :
                            'text-red-500'
                          }`} />
                      </div>

                      {/* Sync strength ring */}
                      {agent.status !== 'offline' && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={getStatusColor(agent.status)}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="176"
                            strokeDashoffset={176 - (176 * agent.syncStrength) / 100}
                            opacity="0.5"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Info card on hover */}
                    <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/95 border-2 border-cyan-500/50 rounded-lg p-3 z-50">
                      <div className="text-white font-bold mb-2">{agent.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">Status:</span>
                          <span className={`font-mono ${agent.status === 'synced' ? 'text-green-500' :
                            agent.status === 'awaiting' ? 'text-amber-500' :
                              'text-red-500'
                            }`}>
                            {agent.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Sync:</span>
                          <span className="text-cyan-400 font-mono">{agent.syncStrength}%</span>
                        </div>
                        {agent.status === 'offline' && (
                          <div className="pt-2 border-t border-white/10 text-red-400">
                            Connection severed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="font-bold text-white">Synced Agents</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {agents.filter(a => a.status === 'synced').length}
            </div>
            <p className="text-green-300/60 text-sm">Full neural connectivity</p>
            <div className="mt-3 space-y-1">
              {agents.filter(a => a.status === 'synced').map(agent => (
                <div key={agent.id} className="text-xs text-green-300">
                  • {agent.name} ({agent.syncStrength}%)
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="font-bold text-white">Awaiting Sync</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {agents.filter(a => a.status === 'awaiting').length}
            </div>
            <p className="text-yellow-300/60 text-sm">Partial connectivity</p>
            <div className="mt-3 space-y-1">
              {agents.filter(a => a.status === 'awaiting').map(agent => (
                <div key={agent.id} className="text-xs text-yellow-300">
                  • {agent.name} ({agent.syncStrength}%)
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-6 h-6 text-red-500 animate-pulse" />
              <h3 className="font-bold text-white">Offline Agents</h3>
            </div>
            <div className="text-3xl font-bold text-red-400 mb-1">
              {agents.filter(a => a.status === 'offline').length}
            </div>
            <p className="text-red-300/60 text-sm">Severed connections</p>
            <div className="mt-3 space-y-1">
              {agents.filter(a => a.status === 'offline').map(agent => (
                <div key={agent.id} className="text-xs text-red-300">
                  • {agent.name} (0%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neural Console */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-2 border-b border-green-500/20 pb-2 sticky top-0 bg-black/90 z-10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 font-bold">NEURAL_FEED_ACTIVE</span>
            <span className="ml-auto text-green-500/50">/var/log/swarm_link.log</span>
          </div>
          <div className="space-y-1">
            <NeuralLogFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

function NeuralLogFeed() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/neural_feed');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch (e) {
        console.error("Feed connection lost", e);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000); // 1s refresh rate
    return () => clearInterval(interval);
  }, []);

  const getLogColor = (level: string) => {
    if (level.includes('SUCCESS')) return 'text-green-400';
    if (level.includes('WARN')) return 'text-yellow-400';
    if (level.includes('ERROR')) return 'text-red-400';
    if (level.includes('NETWORK')) return 'text-cyan-400';
    return 'text-gray-400';
  };

  return (
    <>
      {logs.map((log, i) => (
        <div key={i} className="flex gap-3 hover:bg-white/5 px-1 py-0.5 rounded">
          <span className="text-slate-400 shrink-0">[{log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}]</span>
          <span className={`${getLogColor(log.level)} font-bold shrink-0 w-24`}>[{log.level}]</span>
          <span className="text-gray-300 break-all">{log.message}</span>
        </div>
      ))}
      <div id="log-end" />
    </>
  );
}
