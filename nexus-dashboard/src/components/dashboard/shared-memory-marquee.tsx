"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Zap } from 'lucide-react';

interface Whisper {
  id: string;
  from: string;
  to: string;
  content: string;
}

export const SharedMemoryMarquee: React.FC = () => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);

  useEffect(() => {
    // Mock incoming whispers for the marquee effect
    const interval = setInterval(() => {
      const agents = ['Comet', 'Valentine', 'Coder', 'Scholar', 'Nexus'];
      const actions = [
        'Relaying portal state...',
        'Syncing context window...',
        'Shared memory chunk updated.',
        'Requesting capability audit...',
        'Optimization protocol initiated.',
        'Handoff successful.'
      ];

      const from = agents[Math.floor(Math.random() * agents.length)];
      let to = agents[Math.floor(Math.random() * agents.length)];
      while (to === from) to = agents[Math.floor(Math.random() * agents.length)];

      const newWhisper: Whisper = {
        id: Math.random().toString(),
        from,
        to,
        content: actions[Math.floor(Math.random() * actions.length)]
      };

      setWhispers(prev => [newWhisper, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-blue-900/10 border-y border-blue-800/30 py-1 overflow-hidden relative h-8 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-gray-900 z-10 flex items-center gap-2 border-r border-blue-800/30">
        <Share2 className="w-3 h-3 text-blue-400 animate-pulse" />
        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-tighter">Shared Memory Bus</span>
      </div>

      <div className="flex-1 flex items-center whitespace-nowrap overflow-hidden pl-40">
        <AnimatePresence mode="popLayout">
          {whispers.map((w) => (
            <motion.div
              key={w.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex items-center gap-2 mr-12"
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-cyan-400">@{w.from.toLowerCase()}</span>
                <Zap className="w-2 h-2 text-gray-600" />
                <span className="text-[10px] font-mono text-pink-400">@{w.to.toLowerCase()}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium italic">"{w.content}"</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {whispers.length === 0 && (
         <div className="ml-40 text-[10px] text-gray-600 animate-pulse">Initializing neural channels...</div>
      )}
    </div>
  );
};
