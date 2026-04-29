import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Maximize2 } from 'lucide-react';
import { SkillMapFrame } from './antigravity/SkillMapFrame';
import SystemGraph from './SystemGraph';
import Link from 'next/link';

export const StrategicMap = ({ telemetry }: { telemetry?: any }) => {
    const [view, setView] = useState<'SYSTEM' | 'SKILLS'>('SYSTEM');

    return (
        <div className="renaissance-panel h-full flex flex-col p-4 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl relative overflow-hidden">
            <header className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <MapIcon className="text-purple-400" size={16} />
                    <h2 className="text-xs font-bold text-white uppercase tracking-widest">Strategic Radar</h2>
                </div>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setView('SYSTEM')}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${view === 'SYSTEM' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                    >
                        System
                    </button>
                    <button 
                        onClick={() => setView('SKILLS')}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${view === 'SKILLS' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`}
                    >
                        Skills
                    </button>
                </div>
            </header>

            <div className="flex-1 relative min-h-0">
                <AnimatePresence mode="wait">
                    {view === 'SYSTEM' ? (
                        <motion.div 
                            key="system"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            <SystemGraph />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="skills"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full overflow-hidden rounded-xl border border-white/5"
                        >
                            <div className="scale-[0.35] origin-top-left w-[285%] h-[285%] absolute top-0 left-0">
                                <SkillMapFrame telemetry={telemetry} />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none group hover:bg-transparent transition-all">
                                <div className="bg-black/80 px-3 py-2 rounded-full border border-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Skill Map Active</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-2 flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                <span className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    Mapping: Joel's Mission Control
                </span>
                <Link href="/skills" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
                    <Maximize2 size={10} /> Full Matrix
                </Link>
            </div>
        </div>
    );
};
