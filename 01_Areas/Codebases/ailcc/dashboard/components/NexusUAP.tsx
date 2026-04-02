import { useState, useEffect } from 'react';
import { Activity, Terminal, Globe, Shield, Cpu, Zap, DollarSign, CheckCircle } from 'lucide-react';
import { useNeuralSync } from './NeuralSyncProvider';

// --- Types ---

interface AgentManifest {
  id: string;
  name: string;
  type: 'STRATEGIST' | 'BUILDER' | 'PROTOTYPER' | 'VERIFIER' | 'INTERFACE';
  location: string;
  manifest: {
    specialty: string;
    services: string[];
    cost_tier: 'low' | 'medium' | 'high';
  };
  status: 'online' | 'offline' | 'busy';
}

interface ProtocolEvent {
  id: string;
  timestamp: string;
  type: 'BID' | 'DEAL' | 'RECEIPT';
  agentId: string;
  details: string;
  amount?: string;
  status: 'pending' | 'verified' | 'disputed';
}

// --- NexusAgentRegistry Component ---


export function NexusAgentRegistry() {
  const { agents: liveAgents } = useNeuralSync();

  // Combine live agents with static manifest data
  const [agents, setAgents] = useState<AgentManifest[]>([]);

  useEffect(() => {
    const staticManifests: Record<string, Partial<AgentManifest>> = {
      supergrok: { type: 'STRATEGIST', location: 'web/cloud', manifest: { specialty: 'Deep Reasoning', services: ['strategy_audit'], cost_tier: 'high' } },
      antigravity: { type: 'BUILDER', location: 'local/macbook', manifest: { specialty: 'Full-Stack Implementation', services: ['git_ops', 'ui_refine'], cost_tier: 'medium' } },
      comet: { type: 'VERIFIER', location: 'web/browser', manifest: { specialty: 'Research', services: ['web_search'], cost_tier: 'low' } },
      gemini: { type: 'STRATEGIST', location: 'cloud/google', manifest: { specialty: 'Primary Logic', services: ['orchestration'], cost_tier: 'high' } }
    };

    const combined = liveAgents.map(a => {
      const id = a.id || a.name?.toLowerCase();
      const manifest = staticManifests[id] || { type: 'INTERFACE', location: 'remote', manifest: { specialty: 'Unknown', services: ['standard'], cost_tier: 'low' } };
      return {
        id: a.id || id,
        name: a.name,
        type: manifest.type as any,
        location: manifest.location as string,
        manifest: manifest.manifest as any,
        status: (a.status === 'IDLE' ? 'online' : a.status === 'OFFLINE' ? 'offline' : 'busy') as any
      };
    });

    setAgents(combined);
  }, [liveAgents]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'STRATEGIST': return <Activity className="w-5 h-5 text-purple-400" />;
      case 'BUILDER': return <Terminal className="w-5 h-5 text-blue-400" />;
      case 'PROTOTYPER': return <Globe className="w-5 h-5 text-orange-400" />;
      case 'VERIFIER': return <Shield className="w-5 h-5 text-cyan-400" />;
      default: return <Cpu className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          ACTIVE AGENT REGISTRY
        </h2>
        <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/20 font-mono">
          UAP v1.0 ONLINE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-gradient-to-br from-gray-900/50 to-black border border-white/5 hover:border-cyan-500/30 rounded-lg p-4 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <h3 className="font-bold text-white">{agent.name}</h3>
              </div>
              {getIcon(agent.type)}
            </div>

            <div className="text-xs text-white/60 font-mono mb-3 flex items-center gap-2">
              <span>[{agent.location}]</span>
              <span className="text-white/40">|</span>
              <span className={agent.manifest.cost_tier === 'high' ? 'text-red-400' : 'text-green-400'}>
                {agent.manifest.cost_tier.toUpperCase()} COST
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {agent.manifest.services.map((service) => (
                <span key={service} className="text-xs text-cyan-300 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/20">
                  {service}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- NexusProtocolStream Component ---

export function NexusProtocolStream() {
  const { logs } = useNeuralSync();
  const [events, setEvents] = useState<ProtocolEvent[]>([]);

  useEffect(() => {
    // Map logs to protocol events
    const newEvents: ProtocolEvent[] = logs.map((log, i) => ({
      id: `evt-${i}-${Date.now()}`,
      timestamp: log.timestamp,
      type: (log.source === 'ANTIGRAVITY' ? 'BID' : log.source === 'COMET' ? 'RECEIPT' : 'DEAL') as ProtocolEvent['type'],
      agentId: log.source.toLowerCase(),
      details: log.message,
      status: 'verified' as const
    })).reverse();
    setEvents(newEvents);
  }, [logs]);

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full">
      <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-400" />
        PROTOCOL STREAM (LIVE)
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {events.map((evt) => (
          <div key={evt.id} className="relative pl-6 border-l-2 border-white/10 hover:border-cyan-500/50 transition-colors pb-4 last:pb-0">
            <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${evt.type === 'BID' ? 'bg-blue-500' :
              evt.type === 'DEAL' ? 'bg-green-500' : 'bg-purple-500'
              }`} />

            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${evt.type === 'BID' ? 'bg-blue-900/50 text-blue-300' :
                    evt.type === 'DEAL' ? 'bg-green-900/50 text-green-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                    {evt.type}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-white/90">{evt.details}</p>
                <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  {evt.agentId}
                </div>
              </div>

              {evt.amount && (
                <div className="text-right">
                  <div className="text-xs font-mono text-white/60 flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    {evt.amount}
                  </div>
                  {evt.status === 'verified' && (
                    <CheckCircle className="w-3 h-3 text-green-500 ml-auto mt-1" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
