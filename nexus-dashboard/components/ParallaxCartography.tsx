import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Database, Zap, Shield, Terminal, AlertTriangle } from 'lucide-react';

export default function ParallaxCartography() {
  const [activeLayer, setActiveLayer] = useState(2);

  const layers = [
    {
      id: 0,
      name: 'Mission Control',
      depth: 0,
      color: 'from-red-600 to-orange-600',
      icon: Shield,
      components: [
        { name: 'LOCKSTEP_PROTOCOL_V1', status: 'active', health: 100 },
        { name: 'Strategic Command', status: 'online', health: 95 },
        { name: 'Grok Commander', status: 'standby', health: 85 }
      ]
    },
    {
      id: 1,
      name: 'Connective Tissue',
      depth: 200,
      color: 'from-purple-600 to-pink-600',
      icon: Zap,
      components: [
        { name: 'Valentine Core', status: 'offline', health: 0, critical: true },
        { name: 'Message Queue', status: 'offline', health: 0, blocked: true },
        { name: 'n8n Workflows', status: 'active', health: 92 }
      ]
    },
    {
      id: 2,
      name: 'Swarm',
      depth: 400,
      color: 'from-blue-600 to-cyan-600',
      icon: Layers,
      components: [
        { name: 'Agent Fleet', status: 'standby', health: 88 },
        { name: 'Comet Scout', status: 'standby', health: 90 },
        { name: 'Grok Architect', status: 'offline', health: 0 },
        { name: 'Gemini Antigravity', status: 'synced', health: 100 },
        { name: 'ChatGPT Coder', status: 'standby', health: 85 }
      ]
    },
    {
      id: 3,
      name: 'Foundation',
      depth: 600,
      color: 'from-green-600 to-emerald-600',
      icon: Database,
      components: [
        { name: 'Hippocampus Storage', status: 'restoring', health: 65 },
        { name: 'XDriveAlpha', status: 'syncing', health: 70 },
        { name: 'PostgreSQL', status: 'planned', health: 0 },
        { name: 'Redis Cache', status: 'offline', health: 0 }
      ]
    }
  ];

  const handleDive = (layerId: number) => {
    setActiveLayer(layerId);
  };

  const currentLayer = layers[activeLayer];
  const Icon = currentLayer.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* LOCKSTEP Protocol Header */}
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <div className="text-red-400 font-mono text-sm">LOCKSTEP_PROTOCOL_V1</div>
                <div className="text-red-300/60 text-xs">System Cartography // 2026</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-green-400 font-mono text-lg font-bold">OPTIMAL</div>
                <div className="text-green-300/60 text-xs">Live Sync: Active</div>
              </div>
              <div className="w-16 h-8 bg-green-500/20 rounded-full border border-green-500/50 flex items-center px-1">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Layer Navigator */}
        <div className="flex justify-center gap-2 mb-6">
          {layers.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => handleDive(layer.id)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                activeLayer === layer.id
                  ? `bg-gradient-to-r ${layer.color} text-white shadow-lg`
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              L{idx}: {layer.name}
            </button>
          ))}
        </div>

        {/* Parallax Container */}
        <div className="relative [perspective:1000px]">
          {/* Background Layers (Depth Effect) */}
          <div className="absolute inset-0 pointer-events-none">
            {layers.map((layer, idx) => {
              const opacity = idx === activeLayer ? 0.8 : 0.2;
              const scale = idx === activeLayer ? 1 : 0.85 - (Math.abs(idx - activeLayer) * 0.1);
              const translateZ = (idx - activeLayer) * -200;
              
              return (
                <div
                  key={layer.id}
                  className={`absolute inset-0 bg-gradient-to-br ${layer.color} rounded-lg transition-all duration-700`}
                  ref={(el) => {
                    if (el) {
                      el.style.opacity = String(opacity);
                      el.style.transform = `translateZ(${translateZ}px) scale(${scale})`;
                      el.style.filter = idx === activeLayer ? 'blur(0px)' : 'blur(4px)';
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Active Layer Content */}
          <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-lg p-8 border border-white/10 min-h-[600px]">
            {/* Layer Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentLayer.color} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentLayer.name}</h2>
                  <p className="text-white/60 font-mono text-sm">Depth: {currentLayer.depth}m</p>
                </div>
              </div>
              
              {/* Depth Controls */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => activeLayer > 0 && handleDive(activeLayer - 1)}
                  disabled={activeLayer === 0}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-white flex items-center gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Surface
                </button>
                <button
                  onClick={() => activeLayer < layers.length - 1 && handleDive(activeLayer + 1)}
                  disabled={activeLayer === layers.length - 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-white flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Dive Deeper
                </button>
              </div>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLayer.components.map((component, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 backdrop-blur-sm transition-all hover:scale-105 ${
                    //@ts-ignore
                    component.critical
                      ? 'border-red-500 bg-red-900/20'
                       //@ts-ignore
                      : component.health === 0
                      ? 'border-gray-500 bg-gray-900/20'
                      : component.health >= 90
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-yellow-500 bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-mono text-white font-semibold">{component.name}</h3>
                      <div className="text-xs text-white/60 mt-1">{component.status}</div>
                    </div>
                     {/* @ts-ignore */}
                    {component.critical && (
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    )}
                  </div>

                  {/* Health Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Health</span>
                      <span className="text-white font-mono">{component.health}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          component.health === 0
                            ? 'bg-gray-500'
                            : component.health >= 90
                            ? 'bg-green-500'
                            : component.health >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        ref={(el) => { if (el) el.style.width = `${component.health}%`; }}
                      />
                    </div>
                  </div>
                   {/* @ts-ignore */}
                  {component.blocked && (
                    <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded p-2 text-xs text-red-300">
                      🔒 Blocked by Valentine Core
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Layer Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {currentLayer.components.length}
                </div>
                <div className="text-xs text-white/60">Components</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {currentLayer.components.filter(c => c.health > 0).length}
                </div>
                <div className="text-xs text-white/60">Online</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {currentLayer.components.filter(c => c.health === 0).length}
                </div>
                <div className="text-xs text-white/60">Offline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Depth Indicator */}
        <div className="mt-6 flex justify-center">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 flex items-center gap-3">
            <div className="text-white/60 text-sm font-mono">Current Depth:</div>
            <div className="text-white font-mono font-bold">{currentLayer.depth}m</div>
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
