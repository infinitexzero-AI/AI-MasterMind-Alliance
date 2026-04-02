import React from 'react';
import { motion } from 'framer-motion';

const layers = [
  {
    id: 'layer1',
    name: 'LAYER 1: FOUNDATION',
    nodes: [
      { id: 'hippocampus', label: 'Hippocampus (Storage)', type: 'storage' },
      { id: 'xdrive', label: 'XDriveAlpha', type: 'hardware' },
      { id: 'icloud', label: 'iCloud Bridge', type: 'cloud' }
    ]
  },
  {
    id: 'layer2',
    name: 'LAYER 2: SWARM (AGENTS)',
    nodes: [
      { id: 'antigravity', label: 'Antigravity (Master)', type: 'agent' },
      { id: 'grok', label: 'Grok (Architect)', type: 'agent' },
      { id: 'database', label: 'Vector DB', type: 'system' },
      { id: 'api', label: 'Omni API', type: 'system' }
    ],
    links: [
      { source: 'nexus', target: 'comet', active: true },
      { source: 'nexus', target: 'grok', active: false },
      { source: 'comet', target: 'database', active: true },
      { source: 'grok', target: 'api', active: false }
    ]
  },
  {
    id: 'layer3',
    name: 'LAYER 3: CONNECTIVE TISSUE',
    nodes: [
      { id: 'shared_brain', label: 'Shared Brain (~/AI_Mastermind)', type: 'protocol' },
      { id: 'omni', label: 'OMNI-Protocol', type: 'protocol' }
    ]
  },
  {
    id: 'layer4',
    name: 'LAYER 4: MISSION CONTROL',
    nodes: [
      { id: 'nexus', label: 'Nexus Dashboard', type: 'interface' },
      { id: 'roadmap', label: '100-Step Roadmap', type: 'interface' }
    ]
  }
];

const NetworkMap = () => {
  return (
    <div className="w-full h-full bg-slate-950 p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
      
      <div className="relative z-10 flex flex-col gap-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                SYSTEM CARTOGRAPHY // 2026
            </h2>
            <div className="text-xs font-mono text-slate-400">
                STATUS: <span className="text-emerald-500">CONSOLIDATED</span>
            </div>
        </div>

        {layers.map((layer, i) => (
          <motion.div 
            key={layer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="relative"
          >
            <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-slate-700" />
            <div className="pl-6 border-l border-slate-700/50 pb-8 last:pb-0">
                <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4 uppercase">{layer.name}</h3>
                <div className="flex flex-wrap gap-4">
                    {layer.nodes.map((node) => (
                        <NodeBadge key={node.id} node={node} />
                    ))}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Decorative Connection Lines (Abstract) */}
      <svg className="absolute inset-0 pointer-events-none opacity-20">
        <path d="M100,100 C200,100 200,300 300,300" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        <path d="M300,300 C400,300 400,500 500,500" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5,5" />
      </svg>
    </div>
  );
};

const NodeBadge = ({ node }: { node: any }) => {
    let colors = "bg-slate-800 text-slate-300 border-slate-700";
    if (node.type === 'agent') colors = "bg-cyan-950/30 text-cyan-300 border-cyan-800";
    if (node.type === 'storage') colors = "bg-blue-950/30 text-blue-300 border-blue-800";
    if (node.type === 'interface') colors = "bg-purple-950/30 text-purple-300 border-purple-800";

    return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-2 rounded-lg border text-sm font-mono flex items-center gap-2 ${colors} shadow-lg`}
        >
            <div className={`w-2 h-2 rounded-full ${node.type === 'agent' ? 'bf-cyan-400 animate-pulse' : 'bg-white/20'}`} />
            {node.label}
        </motion.div>
    );
}

export default NetworkMap;
