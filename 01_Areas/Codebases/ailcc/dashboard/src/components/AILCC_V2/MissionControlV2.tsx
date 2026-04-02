import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Activity, Zap } from 'lucide-react';

interface MissionControlV2Props {
    phases: Array<{
        id: string;
        label: string;
        status: 'completed' | 'active' | 'pending';
        progress: number;
    }>;
}

const MissionControlV2: React.FC<MissionControlV2Props> = ({ phases }) => {
    return (
        <div className="flex flex-col gap-6 p-6 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white/90">Strategic Mission Control</h2>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Agg. Progress</span>
                        <span className="text-2xl font-mono font-black italic text-blue-400">75%</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {phases.map((phase, idx) => (
                    <motion.div
                        key={phase.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className={`relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${phase.status === 'active'
                            ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                            : phase.status === 'completed'
                                ? 'bg-green-500/5 border-green-500/10 opacity-70'
                                : 'bg-white/5 border-white/5 opacity-40'
                            }`}
                    >
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center border ${phase.status === 'active' ? 'border-blue-400 text-blue-400' :
                                    phase.status === 'completed' ? 'border-green-400 text-green-400' :
                                        'border-white/20 text-white/20'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <span className="font-semibold text-white/90">{phase.label}</span>
                            </div>
                            <span className="text-xs font-mono text-white/40 italic">
                                {phase.status === 'active' ? 'IN_PROGRESS' : phase.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5" />

                        {/* Active Progress Bar */}
                        {phase.status !== 'pending' && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${phase.progress}%` }}
                                className={`absolute bottom-0 left-0 h-[2px] ${phase.status === 'active' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        )}

                        {/* Scanline Effect for Active */}
                        {phase.status === 'active' && (
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent skew-x-12"
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-widest text-white/60">
                    <Terminal className="w-3 h-3" /> System Logs
                </button>
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/20 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/30 transition-colors uppercase tracking-widest text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Activity className="w-3 h-3" /> Neural Feed
                </button>
            </div>
        </div>
    );
};

export default MissionControlV2;
