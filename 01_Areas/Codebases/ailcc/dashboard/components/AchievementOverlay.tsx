import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Target, Brain, Trophy } from 'lucide-react';
import { Achievement } from '../lib/achievement-engine';

const iconMap: Record<string, any> = { Zap, Target, Brain, Award };

export const AchievementOverlay: React.FC<{ achievement: Achievement | null }> = ({ achievement }) => {
    if (!achievement) return null;

    const Icon = iconMap[achievement.icon] || Trophy;
    const rarityColor = {
        COMMON: 'text-slate-400 border-slate-700/50 bg-slate-800/80',
        RARE: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/80',
        EPIC: 'text-purple-400 border-purple-500/30 bg-purple-950/80',
        LEGENDARY: 'text-amber-400 border-amber-500/30 bg-amber-950/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    }[achievement.rarity];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[320px] ${rarityColor}`}
            >
                <div className={`p-3 rounded-xl bg-white/5`}>
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60 mb-1">Achievement Unlocked</div>
                    <div className="text-lg font-bold tracking-tight">{achievement.title}</div>
                    <div className="text-xs opacity-70 mt-0.5">{achievement.description}</div>
                </div>

                {/* Rarity Tag */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-mono tracking-widest border border-white/5 uppercase">
                    {achievement.rarity}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
