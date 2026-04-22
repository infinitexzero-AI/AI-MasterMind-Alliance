import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, BookOpen, Rocket } from 'lucide-react';

import { MarginalGainsPanel, GainSpell } from '../src/components/dashboard/MarginalGainsPanel';

interface Goal {
    id: string;
    label: string;
    progress: number;
    target: string;
    icon: React.ElementType;
    color: string;
    subtext: string;
}

export const GoalTracker: React.FC = () => {
    const [scholarProgress, setScholarProgress] = useState(95);
    const [scholarSubtext, setScholarSubtext] = useState('Graduation Readiness: 95% (114/120)');
    const [marginalGains, setMarginalGains] = useState<{ aggregate: number; spells: GainSpell[] }>({
        aggregate: 0,
        spells: []
    });

    useEffect(() => {
        const fetchTrackerData = async () => {
            try {
                const res = await fetch('/api/monitor/health');
                const data = await res.json();

                // Scholar Data
                if (data.services?.scholar?.degree_progress) {
                    const prog = data.services.scholar.degree_progress;
                    setScholarProgress(prog.graduation_readiness);
                    setScholarSubtext(`Graduation Readiness: ${prog.graduation_readiness}% (${prog.credits_earned}/${prog.total_credits_required})`);
                }

                // Marginal Gains Data
                if (data.services?.marginalGains) {
                    setMarginalGains(data.services.marginalGains);
                }
            } catch (e) {
                console.error('Failed to fetch tracker data for GoalTracker:', e);
            }
        };
        fetchTrackerData();
        const interval = setInterval(fetchTrackerData, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    const GOALS: Goal[] = [
        {
            id: 'scholar',
            label: 'Scholar Protocol',
            progress: scholarProgress,
            target: 'Degree Convergence',
            icon: BookOpen,
            color: 'from-blue-500 to-cyan-400',
            subtext: scholarSubtext
        },
        {
            id: 'ailcc',
            label: 'AILCC Chamber',
            progress: 100,
            target: 'Singularity achieved',
            icon: Rocket,
            color: 'from-purple-500 to-indigo-400',
            subtext: 'Nexus Fully Converged'
        },
        {
            id: 'growth',
            label: 'Strategic Growth',
            progress: 100,
            target: 'Autonomous Feedback',
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-400',
            subtext: 'The Judge: Verifying Singularity'
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Mission Objectives</h3>
            </div>

            {GOALS.map((goal) => (
                <div key={goal.id} className="relative group">
                    <div className="flex justify-between items-end mb-1.5 px-1">
                        <div className="flex items-center gap-2">
                            <goal.icon size={14} className={`text-${goal.color.split(' ')[0].replace('from-', '')}`} />
                            <span className="text-xs font-bold text-slate-200">{goal.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{goal.progress}%</span>
                    </div>

                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                        />
                    </div>

                    <div className="flex justify-between mt-1 px-1">
                        <span className="text-[9px] text-slate-400 font-mono italic uppercase">{goal.subtext}</span>
                        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1 group-hover:text-white transition-colors">
                            TARGET: {goal.target.toUpperCase()}
                        </span>
                    </div>
                </div>
            ))}

            <div className="mt-2 pt-4 border-t border-slate-800/50">
                <MarginalGainsPanel
                    aggregate={marginalGains.aggregate}
                    spells={marginalGains.spells}
                />
            </div>
        </div>
    );
};
