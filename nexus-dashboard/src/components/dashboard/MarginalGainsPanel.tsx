import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export interface GainSpell {
    id: string;
    label: string;
    gain: number;
    status: string;
}

interface MarginalGainsPanelProps {
    aggregate: number;
    spells: GainSpell[];
}

export const MarginalGainsPanel: React.FC<MarginalGainsPanelProps> = ({ aggregate, spells }) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">1% Aggregate Gain</span>
                </div>
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[10px] text-emerald-400 font-mono font-bold"
                >
                    +{aggregate.toFixed(1)}% TODAY
                </motion.div>
            </div>

            <div className="space-y-2">
                {spells.map((spell) => (
                    <div
                        key={spell.id}
                        className="bg-black/20 border border-white/5 rounded-lg p-2 flex items-center justify-between group hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                                {spell.id === 'acad' && <ShieldCheck size={12} className="text-blue-400" />}
                                {spell.id === 'auto' && <Sparkles size={12} className="text-purple-400" />}
                                {spell.id === 'link' && <Zap size={12} className="text-cyan-400" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-200 font-medium">{spell.label}</span>
                                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-tighter">{spell.status}</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-500">
                            +{spell.gain.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-1 px-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(aggregate / 10) * 100}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    />
                </div>
            </div>
        </div>
    );
};
