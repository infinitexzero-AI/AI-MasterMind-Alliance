import React from 'react';
import { Trophy, Shield, Cpu, Zap, Target, Brain, Award } from 'lucide-react';
import { ACHIEVEMENT_REGISTRY } from '../lib/achievement-engine';
import { useAchievements } from '../hooks/useAchievements';

const iconMap: Record<string, any> = { Zap, Target, Brain, Award };

export const AchievementStats: React.FC = () => {
    const { unlockedAchievements } = useAchievements();
    const allAchievements = Object.values(ACHIEVEMENT_REGISTRY);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-medium text-slate-100">Mastery Cortex</h3>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {unlockedAchievements.length} / {allAchievements.length} Unlocked
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allAchievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                    const Icon = iconMap[achievement.icon] || Trophy;

                    return (
                        <div
                            key={achievement.id}
                            className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center gap-3 text-center ${isUnlocked
                                    ? 'bg-slate-900/60 border-white/10 shadow-lg'
                                    : 'bg-black/20 border-white/5 opacity-40 grayscale'
                                }`}
                        >
                            <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-800 text-slate-500'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                                    {achievement.title}
                                </div>
                                <div className="text-[8px] font-mono text-slate-500 leading-tight uppercase opacity-60">
                                    {achievement.rarity}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
