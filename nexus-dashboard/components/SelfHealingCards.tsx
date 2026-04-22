import React, { useState, useEffect } from 'react';
import { RefreshCw, Terminal, AlertTriangle, CheckCircle, Activity, Loader } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3002';

export default function SelfHealingCards() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [healingStates, setHealingStates] = useState<Record<string, string | null>>({});

  const [services, setServices] = useState([
    { 
      id: 'valentine', 
      name: 'Valentine Core', 
      status: 'healthy', 
      uptime: '99.9%', 
      latency: '24ms',
      health: 100,
      healActions: ['Deploy Container', 'Check Config'],
      errorLogs: []
    },
    { 
      id: 'redis', 
      name: 'Redis Cache', 
      status: 'healthy', 
      uptime: '99.9%', 
      latency: '12ms',
      health: 98,
      healActions: ['Restart Container', 'View Logs'],
      errorLogs: []
    },
    { 
      id: 'agents', 
      name: 'Agent Swarm', 
      status: 'degraded', 
      uptime: '98.5%', 
      latency: '145ms',
      health: 85,
      healActions: ['Reroute Traffic', 'Scale Up'],
      errorLogs: ["[WARN] High latency detected"]
    }
  ]);



  useEffect(() => {
    const socket = io(SOCKET_URL);
    
    socket.on('log', () => {
       // Log received
    });

    socket.on('state:update', (payload: any) => {
        if (payload.type === 'services' && Array.isArray(payload.data)) {
            setServices(payload.data);
        }
    });

    return () => { socket.disconnect(); };
  }, []);

  const toggleCard = (serviceId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const healService = async (serviceId: string, action: string) => {
    setHealingStates(prev => ({ ...prev, [serviceId]: 'healing' }));
    
    // Simulate healing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (action === 'Restart Container' || action === 'Deploy Container') {
      setServices(prev => prev.map(s => 
        s.id === serviceId 
          ? { 
              ...s, 
              status: 'healthy', 
              health: 95,
              errorLogs: [
                ...s.errorLogs,
                `[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] INFO: ${action} initiated`,
                `[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] INFO: Service starting...`,
                `[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] SUCCESS: Service healthy`
              ]
            }
          : s
      ));
    }
    
    setHealingStates(prev => ({ ...prev, [serviceId]: 'success' }));
    setTimeout(() => {
      setFlippedCards(prev => ({ ...prev, [serviceId]: false }));
      setHealingStates(prev => ({ ...prev, [serviceId]: null }));
    }, 1000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6 rounded-xl border border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="w-12 h-12 text-orange-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Self-Healing Infrastructure</h1>
                <p className="text-orange-300/80 font-mono text-sm">Automated Recovery System // Click cards to diagnose</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-red-400">
                {(services || []).filter(s => s.status === 'error').length}
              </div>
              <div className="text-red-300/60 text-sm">Services Down</div>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(services || []).map((service, idx) => {
            const isFlipped = flippedCards[service.id];
            const healingState = healingStates[service.id];
            const cardTransform = `rotateY(${idx * 120}deg) translateZ(100px)`;

            return (
              <div
                key={service.id}
                className="relative h-[400px] cursor-pointer [perspective:1000px]"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{ '--card-transform': cardTransform } as React.CSSProperties}
                  onClick={() => !healingState && toggleCard(service.id)}
                >
                  {/* Front of Card - Status View */}
                  <div
                    className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-2xl"
                  >
                    <div className={`h-full rounded-lg border-4 p-6 ${
                      service.status === 'error'
                        ? 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500'
                        : 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500'
                    }`}>
                      {/* Status Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            service.status === 'error'
                              ? 'bg-red-600 text-white'
                              : 'bg-green-600 text-white'
                          }`}>
                            {service.status.toUpperCase()}
                          </span>
                        </div>
                        {service.status === 'error' ? (
                          <AlertTriangle className="w-10 h-10 text-red-400 animate-pulse" />
                        ) : (
                          <CheckCircle className="w-10 h-10 text-green-400" />
                        )}
                      </div>

                      {/* Health Meter */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-white/80 mb-2">
                          <span>Service Health</span>
                          <span className="font-mono font-bold">{service.health}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-6">
                          <div
                            className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 ${
                              service.health === 0 ? 'bg-red-600' :
                              service.health < 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ '--health-width': `${service.health}%` } as React.CSSProperties}
                          >
                            {service.health > 10 && (
                              <span className="text-white text-xs font-bold">{service.health}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Last Error Preview */}
                      {service.status === 'error' && (
                        <div className="bg-black/50 rounded-lg p-4 mb-4 border border-red-500/30">
                          <div className="text-red-400 text-xs font-mono mb-2">LAST ERROR:</div>
                          <div className="text-red-300 text-sm font-mono">
                            {service.errorLogs[service.errorLogs.length - 1]}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                          <Terminal className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                          <div className="text-white font-bold mb-1">Click to Diagnose</div>
                          <div className="text-white/60 text-xs">View logs & recovery options</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of Card - Terminal View */}
                  <div
                    className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-2xl [transform:rotateY(180deg)]"
                  >
                    <div className="h-full bg-gradient-to-br from-gray-900 to-black rounded-lg border-4 border-cyan-500">
                      {/* Terminal Header */}
                      <div className="bg-black/80 border-b border-cyan-500/50 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Terminal className="w-5 h-5 text-cyan-400" />
                          <span className="text-cyan-400 font-mono font-bold">System Diagnostics</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCard(service.id);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          ✕ Close
                        </button>
                      </div>

                      {/* Terminal Body */}
                      <div className="p-4 h-[240px] overflow-y-auto font-mono text-sm">
                        {(service.errorLogs || []).map((log, idx) => {
                          const isError = log.includes('ERROR') || log.includes('CRITICAL');
                          const isWarn = log.includes('WARN');
                          const isSuccess = log.includes('SUCCESS');
                          
                          return (
                            <div
                              key={idx}
                              className={`mb-1 ${
                                isError ? 'text-red-400' :
                                isWarn ? 'text-yellow-400' :
                                isSuccess ? 'text-green-400' :
                                'text-cyan-300'
                              }`}
                            >
                              {log}
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/50 p-4">
                        {healingState === 'healing' ? (
                          <div className="flex items-center justify-center gap-3 text-cyan-400">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="font-mono">Healing service...</span>
                          </div>
                        ) : healingState === 'success' ? (
                          <div className="flex items-center justify-center gap-3 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-mono">Service recovered!</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {(service.healActions || []).map((action, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  healService(service.id, action);
                                }}
                                className={`py-2 px-3 rounded font-mono text-sm transition-all ${
                                  idx === 0 && service.status === 'error'
                                    ? 'bg-green-600 hover:bg-green-700 text-white font-bold'
                                    : 'bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/50'
                                }`}
                              >
                                {idx === 0 && service.status === 'error' && (
                                  <RefreshCw className="w-4 h-4 inline mr-1" />
                                )}
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Recovery Status */}
        <div className="mt-6 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Automated Recovery Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-green-400">
                {(services || []).filter(s => s.status === 'healthy').length}
              </div>
              <div className="text-green-300/60 text-sm">Services Healthy</div>
            </div>
            <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-red-400">
                {(services || []).filter(s => s.status === 'error').length}
              </div>
              <div className="text-red-300/60 text-sm">Requires Attention</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
              <Activity className="w-8 h-8 text-cyan-400 mb-2" />
              <div 
                className="absolute inset-0 z-0 bg-center bg-no-repeat opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, #6366f1 0%, transparent 70%)',
                  transform: 'translateZ(-100px) scale(1.5)'
                }} // eslint-disable-line
              ></div>
              <div className="text-2xl font-bold text-cyan-400">
                {Math.round((services || []).reduce((sum, s) => sum + (s.health || 0), 0) / (services?.length || 1))}%
              </div>
              <div className="text-cyan-300/60 text-sm">Overall Health</div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
