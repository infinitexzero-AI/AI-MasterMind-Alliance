import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, CheckCircle, XCircle, Zap, GitBranch, Database, Server } from 'lucide-react';

export default function DependencyChain() {
  const [deploying, setDeploying] = useState(false);

  const [services, setServices] = useState([
    {
      id: 'valentine',
      name: 'Valentine Core',
      type: 'API Gateway',
      health: 0,
      status: 'critical',
      icon: Server,
      layer: 'Connective Tissue',
      blocksCount: 5,
      dependencies: [] as string[],
      blockedBy: null as string | null,
      deployAction: true
    },
    {
      id: 'redis',
      name: 'Shared Memory (Redis)',
      type: 'Cache',
      health: 0,
      status: 'blocked',
      icon: Database,
      layer: 'Foundation',
      dependencies: ['valentine'] as string[],
      blockedBy: 'Valentine Core' as string | null
    },
    {
      id: 'queue',
      name: 'Message Queue',
      type: 'Task Queue',
      health: 0,
      status: 'blocked',
      icon: GitBranch,
      layer: 'Connective Tissue',
      dependencies: ['valentine'] as string[],
      blockedBy: 'Valentine Core' as string | null
    },
    {
      id: 'router',
      name: 'Central Router',
      type: 'Orchestration',
      health: 0,
      status: 'blocked',
      icon: GitBranch,
      layer: 'Orchestration',
      dependencies: ['valentine', 'queue'] as string[],
      blockedBy: 'Valentine Core' as string | null
    },
    {
      id: 'state',
      name: 'State Management',
      type: 'Transaction Tracking',
      health: 0,
      status: 'blocked',
      icon: Database,
      layer: 'Orchestration',
      dependencies: ['redis', 'queue'] as string[],
      blockedBy: 'Shared Memory' as string | null
    },
    {
      id: 'n8n',
      name: 'n8n Workflows',
      type: 'Automation',
      health: 92,
      status: 'healthy',
      icon: Zap,
      layer: 'Automation',
      dependencies: [] as string[],
      blockedBy: null as string | null
    },
    {
      id: 'github',
      name: 'GitHub Integration',
      type: 'Code Repository',
      health: 100,
      status: 'healthy',
      icon: CheckCircle,
      layer: 'Integration',
      dependencies: [] as string[],
      blockedBy: null as string | null
    },
    {
      id: 'linear',
      name: 'Linear Integration',
      type: 'Task Management',
      health: 98,
      status: 'healthy',
      icon: CheckCircle,
      layer: 'Integration',
      dependencies: [] as string[],
      blockedBy: null as string | null
    }
  ]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('/api/monitor/health');
        const data = await res.json();

        if (data.status === 'ok') {
          setServices(prev => prev.map(s => {
            if (s.id === 'valentine') {
              return {
                ...s,
                status: data.services.valentine.status === 'ONLINE' ? 'healthy' : 'critical',
                health: data.services.valentine.health
              };
            }
            if (s.id === 'redis') {
              return {
                ...s,
                status: data.layers.foundation.blocked ? 'blocked' : 'healthy',
                health: data.services.redis.health,
                blockedBy: data.layers.foundation.blocked ? 'Valentine Core' : null
              };
            }
            if (['queue', 'router', 'state'].includes(s.id)) {
              const isBlocked = data.layers.foundation.blocked || data.services.valentine.status === 'OFFLINE';
              return {
                ...s,
                status: isBlocked ? 'blocked' : 'healthy',
                health: isBlocked ? 0 : 100,
                blockedBy: data.services.valentine.status === 'OFFLINE' ? 'Valentine Core' : (data.layers.foundation.blocked ? 'Shared Memory' : null)
              };
            }
            return s;
          }));
        }
      } catch (e) {
        console.error('Failed to fetch health:', e);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch('http://localhost:5001/api/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'Deploy Valentine Core',
          source: 'System_Dependency_Chain'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Deployment Initiated! Task ID: ${data.taskId}\nAssigned to: ${data.assignedTo}`);
      } else {
        alert('❌ Deployment Failed: API Error');
      }
    } catch (e) {
      console.error(e);
      alert('❌ Connection Error: Valentine Core unreachable on port 5001');
    } finally {
      setDeploying(false);
    }
  };

  const blockedServices = services.filter(s => s.status === 'blocked');
  const healthyServices = services.filter(s => s.status === 'healthy');

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Critical Alert Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-2xl p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-white" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">CRITICAL DEPENDENCY BLOCKER DETECTED</h1>
              <p className="text-red-100">Valentine Core failure is cascading to {blockedServices.length} dependent services</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">40%</div>
              <div className="text-red-100 text-sm">System Health</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Bottleneck Card */}
          <div className="lg:col-span-2">
            <div className="bg-red-900/40 border-4 border-red-500 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <Server className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">Valentine Core</h2>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-red-200 mb-3">API Gateway • Connective Tissue Layer</p>
                  <div className="bg-red-800/50 border border-red-500/50 rounded p-3 mb-4">
                    <div className="text-red-200 text-sm font-mono">
                      STATUS: Not deployed - system cannot route agent requests
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-red-200 mb-2">
                  <span>System Health</span>
                  <span className="font-mono">0%</span>
                </div>
                <div className="w-full bg-red-950 rounded-full h-4">
                  <div className="bg-red-600 h-4 rounded-full w-0" />
                </div>
              </div>

              {/* Deploy Action */}
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    Deploying Valentine Core...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Deploy Valentine Core Now
                  </>
                )}
              </button>

              {/* Cascading Impact */}
              <div className="mt-6 bg-red-950/50 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Cascading Impact: {blockedServices.length} Services Blocked
                </h3>
                <div className="space-y-2">
                  {blockedServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between text-sm bg-red-900/30 rounded p-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span className="text-red-200">{service.name}</span>
                      </div>
                      <span className="text-red-400 font-mono text-xs">{service.layer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="space-y-4">
            {/* Blocked Services */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Blocked Services</h3>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-4xl font-bold text-red-400 mb-2">{blockedServices.length}</div>
              <div className="text-red-300 text-sm">Waiting for Valentine Core</div>
            </div>

            {/* Healthy Services */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Healthy Services</h3>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-4xl font-bold text-green-400 mb-2">{healthyServices.length}</div>
              <div className="text-green-300 text-sm">Operating normally</div>
            </div>

            {/* System Recovery */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">Est. Recovery</h3>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">2-3h</div>
              <div className="text-yellow-300 text-sm">After Valentine deploys</div>
            </div>
          </div>
        </div>

        {/* Dependency Graph */}
        <div className="mt-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Dependency Chain Visualization</h2>

          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              const isBlocked = service.status === 'blocked';
              const isCritical = service.status === 'critical';

              return (
                <div
                  key={service.id}
                  className={`border-l-4 rounded-lg p-4 transition-all ${isCritical
                      ? 'border-red-500 bg-red-900/20 opacity-100'
                      : isBlocked
                        ? 'border-gray-500 bg-gray-900/20 opacity-50'
                        : 'border-green-500 bg-green-900/20 opacity-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Icon className={`w-8 h-8 ${isCritical ? 'text-red-400' :
                          isBlocked ? 'text-gray-400' :
                            'text-green-400'
                        }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-bold">{service.name}</h3>
                          {isBlocked && <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="text-sm text-white/60">{service.type} • {service.layer}</div>
                        {service.blockedBy && (
                          <div className="text-xs text-red-400 mt-1">
                            🔒 Blocked by: {service.blockedBy}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-bold font-mono ${service.health === 0 ? 'text-red-400' :
                          service.health < 70 ? 'text-yellow-400' :
                            'text-green-400'
                        }`}>
                        {service.health}%
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${isCritical ? 'bg-red-600 text-white' :
                          isBlocked ? 'bg-gray-700 text-gray-300' :
                            'bg-green-600 text-white'
                        }`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Dependencies Indicator */}
                  {service.dependencies.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                      <span>Depends on:</span>
                      {service.dependencies.map((dep, idx) => (
                        <span key={idx} className="bg-white/10 px-2 py-1 rounded">
                          {/* @ts-ignore */}
                          {services.find(s => s.id === dep)?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
