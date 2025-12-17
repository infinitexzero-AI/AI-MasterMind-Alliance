import React from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Hammer, Smartphone, Terminal } from 'lucide-react';

interface VirtualTouchBarProps {
  onAction: (action: string) => void;
}

export const VirtualTouchBar: React.FC<VirtualTouchBarProps> = ({ onAction }) => {
  const buttons = [
    { id: 'launch', label: 'LAUNCH', icon: <Play size={16} fill="currentColor" />, color: 'bg-green-500/20 text-green-400 border-green-500/50' },
    { id: 'update', label: 'UPDATE', icon: <RefreshCw size={16} />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    { id: 'design', label: 'DESIGN UX', icon: <Hammer size={16} />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
    { id: 'exam', label: 'EXAM PREP', icon: <Play size={16} fill="currentColor" />, color: 'bg-red-500/20 text-red-400 border-red-500/50' },
    { id: 'mobile', label: 'VALENTINE', icon: <Smartphone size={16} />, color: 'bg-pink-500/20 text-pink-400 border-pink-500/50' },
    { id: 'ping', label: 'PING', icon: <RefreshCw size={16} />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' },
    { id: 'debug', label: 'DEBUG', icon: <Terminal size={16} />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl">
            {buttons.map((btn) => (
                <motion.button
                    key={btn.id}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(btn.id)}
                    className={`
                        relative flex flex-col items-center justify-center w-20 h-10 rounded
                        border border-transparent hover:border-white/20 transition-all
                        ${btn.color}
                    `}
                >
                    <div className="mb-[2px]">{btn.icon}</div>
                    <span className="text-[8px] font-bold tracking-wider">{btn.label}</span>
                    
                    {/* Scanline effect for "Touch Bar" feel */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none" />
                </motion.button>
            ))}
        </div>
        {/* Glow Reflection */}
        <div className="absolute -bottom-4 left-4 right-4 h-4 bg-gradient-to-b from-white/10 to-transparent blur-md opacity-30 pointer-events-none" />
    </div>
  );
};
