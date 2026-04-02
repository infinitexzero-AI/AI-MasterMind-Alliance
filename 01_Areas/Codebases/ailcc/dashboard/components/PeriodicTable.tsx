import React from 'react';
import { motion } from 'framer-motion';

interface Element {
  symbol: string;
  name: string;
  category: 'PRIMITIVE' | 'LOGIC' | 'ACTION' | 'FRONTIER' | 'CORE';
  description: string;
  status: 'acquired' | 'pending';
  color: string;
}

const elements: Element[] = [
  // GROUND TRUTH (PRIMITIVES)
  { symbol: 'Lg', name: 'LLM Node', category: 'PRIMITIVE', description: 'Large Language Model Core', status: 'acquired', color: 'text-neon-blue' },
  { symbol: 'Em', name: 'Embeddings', category: 'PRIMITIVE', description: 'Semantic Vector Space', status: 'acquired', color: 'text-neon-blue' },
  { symbol: 'Rg', name: 'RAG', category: 'PRIMITIVE', description: 'Retrieval Augmented Generation', status: 'acquired', color: 'text-neon-blue' },
  { symbol: 'Vx', name: 'Vector DB', category: 'PRIMITIVE', description: 'High-speed semantic search', status: 'acquired', color: 'text-neon-blue' },

  // LOGIC LAYER (COMPOSITIONS)
  { symbol: 'Gr', name: 'SuperGrok', category: 'LOGIC', description: 'Strategic Intelligence & Logic', status: 'acquired', color: 'text-neon-amber' },
  { symbol: 'Gk', name: 'Grok', category: 'LOGIC', description: 'Context & Synthesis Engine', status: 'acquired', color: 'text-neon-purple' },
  { symbol: 'Co', name: 'Comet', category: 'LOGIC', description: 'Research & Search (Perplexity)', status: 'acquired', color: 'text-neon-emerald' },
  { symbol: 'Ge', name: 'Gemini', category: 'LOGIC', description: 'Multi-modal Technical Lead', status: 'acquired', color: 'text-neon-blue' },
  { symbol: 'Gp', name: 'ChatGPT', category: 'LOGIC', description: 'Agentic Reasoning & Creative Flow', status: 'acquired', color: 'text-neon-emerald' },

  // ACTION LAYER (DEPLOYMENT)
  { symbol: 'Vc', name: 'Vercel', category: 'ACTION', description: 'Free Tier Deployment Hosting', status: 'acquired', color: 'text-white' },
  { symbol: 'Gh', name: 'GitHub', category: 'ACTION', description: 'Free Tier Version Control', status: 'acquired', color: 'text-white' },
  { symbol: 'Ln', name: 'Linear', category: 'ACTION', description: 'Task & Sprint Management', status: 'acquired', color: 'text-neon-purple' },
  { symbol: 'At', name: 'Airtable', category: 'ACTION', description: 'Cross-System State Sync', status: 'acquired', color: 'text-neon-blue' },

  // THE FRONTIER (EMERGING)
  { symbol: 'Ag', name: 'Agents', category: 'FRONTIER', description: 'Autonomous Multi-agent Swarm', status: 'acquired', color: 'text-neon-rose' },
  { symbol: 'Au', name: 'Autonomy', category: 'FRONTIER', description: 'Self-correcting system loops', status: 'acquired', color: 'text-neon-rose' },
  { symbol: 'Hb', name: 'Heartbeat', category: 'FRONTIER', description: 'Real-time telemetry pulse', status: 'acquired', color: 'text-neon-rose' },
  { symbol: 'Br', name: '2nd Brain', category: 'FRONTIER', description: 'The Knowledge Nexus foundation', status: 'acquired', color: 'text-neon-blue' },

  // AIMmA CORE (NOBLE ELEMENTS)
  { symbol: 'SA', name: 'Sustainable Abundance', category: 'CORE', description: 'Infinite Resource Loop', status: 'acquired', color: 'text-neon-emerald' },
  { symbol: '1%', name: 'Daily Gain', category: 'CORE', description: 'Compounding Improvement', status: 'acquired', color: 'text-neon-amber' },
  { symbol: 'Nv', name: 'Neurology', category: 'CORE', description: 'Biopsych Framework', status: 'acquired', color: 'text-neon-rose' },
  { symbol: 'Ω', name: 'Singularity', category: 'CORE', description: 'Full System Convergence', status: 'acquired', color: 'text-neon-rose' },
];

export default function PeriodicTable() {
  return (
    <div className="p-6 renaissance-panel relative overflow-hidden h-full flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            AIMmA Intelligence Stack
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-70">SYSTEM PERIODIC TABLE | 2026 V.1</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-[10px] text-cyan-400 font-bold">ACQUIRED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-[10px] text-slate-400 font-bold">PENDING</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {elements.map((el, i) => (
          <motion.div
            key={el.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`
              relative p-3 border rounded aspect-square flex flex-col items-center justify-center text-center transition-all group
              ${el.status === 'acquired'
                ? 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                : 'bg-slate-900/50 border-slate-800 opacity-50 gray-scale hover:opacity-80'}
            `}
          >
            <span className={`text-xl font-black mb-0.5 tracking-tighter ${el.status === 'acquired' ? el.color : 'text-slate-400'}`}>
              {el.symbol}
            </span>
            <span className={`text-[8px] uppercase font-bold tracking-widest leading-none ${el.status === 'acquired' ? 'text-slate-300' : 'text-slate-400'}`}>
              {el.name}
            </span>

            {/* TOOLTIP POPUP */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/95 p-2 flex flex-col items-center justify-center rounded transition-opacity z-10 text-[9px] pointer-events-none border border-cyan-500/30">
              <span className="font-bold text-cyan-400 mb-1">{el.category}</span>
              <span className="text-slate-200 leading-tight">{el.description}</span>
              <span className={`mt-1 font-bold ${el.status === 'acquired' ? 'text-green-400' : 'text-amber-500'}`}>
                {el.status.toUpperCase()}
              </span>
            </div>

            {el.status === 'acquired' && (
              <div className="absolute top-1 right-1">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <footer className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-400 italic">
        <p>"1% Daily Gain across the stack → Exponential System Evolution"</p>
        <p className="font-mono">NO NOBLE GASES | ALL ACTION</p>
      </footer>
    </div>
  );
}
