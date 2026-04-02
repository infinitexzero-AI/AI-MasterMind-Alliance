import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, User, Terminal, Database, Cloud } from 'lucide-react';
import { HolographicTexture } from '../HolographicTexture';

export const AntigravityWindow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock agents/nodes to float
  const nodes = [
    { id: 'agent-1', icon: User, label: 'Observer', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'agent-2', icon: Terminal, label: 'Coder', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'agent-3', icon: Database, label: 'Memory', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'agent-4', icon: Cloud, label: 'Nexus', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'box-1', icon: Box, label: 'Task', color: 'text-white', bg: 'bg-slate-700/50' },
  ];

  return (
    <div className="renaissance-panel glass-layer-1 w-full h-96 relative overflow-hidden ring-1 ring-blue-500/20">
        <div className="absolute top-0 left-0 p-4 text-blue-400 font-mono text-xs font-bold tracking-widest z-10 pointer-events-none">
            ANTIGRAVITY // ZERO-G
        </div>
        <HolographicTexture type="grid" opacity={0.1} />
        
        <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
            {nodes.map((node, i) => (
                <motion.div
                    key={node.id}
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.2}
                    whileHover={{ scale: 1.1, cursor: 'grab' }}
                    whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
                    initial={{ 
                        x: Math.random() * 200, 
                        y: Math.random() * 200 
                    }}
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        y: {
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        rotate: {
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    className={`absolute flex flex-col items-center justify-center w-24 h-24 rounded-2xl glass-layer-3 shadow-xl ${node.bg} will-change-transform`}
                >
                    <node.icon className={`w-8 h-8 mb-2 ${node.color}`} />
                    <span className="text-[10px] font-mono uppercase text-slate-300">{node.label}</span>
                </motion.div>
            ))}
        </div>
    </div>
  );
};
