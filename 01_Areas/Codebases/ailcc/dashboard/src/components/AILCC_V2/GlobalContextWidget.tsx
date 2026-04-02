import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwarmTelemetry } from '../../../hooks/useSwarmTelemetry';
import { BrainCircuit, Cpu, Zap, Activity, Battery, Music } from 'lucide-react';

export const GlobalContextWidget = () => {
    const { globalContext } = useSwarmTelemetry();

    if (!globalContext) return null;

    const media = globalContext.media_context;
    const thermal = globalContext.system_thermal;
    const omni = globalContext.omnitracker_status;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2 mt-4 px-4 py-3 bg-black/60 border border-purple-500/30 rounded-xl flex flex-col md:flex-row md:items-center gap-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-xl"
        >
            <div className="flex items-center gap-2 text-purple-400 min-w-[150px]">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase shadow-purple-500/50 drop-shadow-md">Global Vector Array</span>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-3">
                {media && media.title && (
                    <div className="flex items-center gap-2 bg-purple-900/40 px-3 py-1 rounded-md border border-purple-500/40 shadow-inner">
                        <Music className="w-3 h-3 text-purple-300" />
                        <span className="text-xs font-mono text-purple-200 truncate max-w-[200px]">
                            {media.title}
                        </span>
                    </div>
                )}

                {thermal && (
                    <div className="flex items-center gap-3 bg-cyan-900/30 px-3 py-1 rounded-md border border-cyan-500/40 shadow-inner">
                        <div className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-cyan-300" />
                            <span className="text-xs font-mono text-cyan-200">{thermal.cpu_percent || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-300" />
                            <span className="text-xs font-mono text-emerald-200">{thermal.ram_percent || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Battery className="w-3 h-3 text-amber-300" />
                            <span className="text-xs font-mono text-amber-200">{thermal.battery_percent || 100}%</span>
                        </div>
                    </div>
                )}

                {omni && (
                    <div className="flex items-center gap-2 bg-indigo-900/40 px-3 py-1 rounded-md border border-indigo-500/40 shadow-inner">
                        <Zap className="w-3 h-3 text-indigo-300" />
                        <span className="text-xs font-mono text-indigo-200 truncate max-w-[200px]">
                            {omni.active_goal || 'Standby'}
                        </span>
                    </div>
                )}
            </div>

            <div className="text-[9px] font-mono text-purple-500/60 ml-auto whitespace-nowrap hidden md:block">
                SYNC: {new Date(globalContext.last_synthesis).toLocaleTimeString([], { hour12: false })}
            </div>
        </motion.div>
    );
};
