import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Habit {
  id: string;
  label: string;
  progress: number; // 0 to 100
  trend: 'up' | 'stable' | 'down';
}

const initialHabits: Habit[] = [
  { id: '1', label: 'Neural Sync', progress: 85, trend: 'up' },
  { id: '2', label: 'Vault Integrity', progress: 92, trend: 'stable' },
  { id: '3', label: 'Agent Coordination', progress: 78, trend: 'up' },
  { id: '4', label: 'System Uptime', progress: 99, trend: 'stable' },
];

export const HabitGrid: React.FC = () => {
  const [habits] = useState<Habit[]>(initialHabits);

  return (
    <div className="p-6 renaissance-panel">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Atomic Habits: 1% Improvement Tracker
      </h3>
      <div className="space-y-4">
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-tighter text-slate-400 group-hover:text-slate-200 transition-colors">
              <span>{habit.label}</span>
              <span className="font-mono">{habit.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${habit.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="progress-bar-fill"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <div className="flex-1 p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-center text-cyan-400">
          DAILY GAIN: +1.2%
        </div>
        <div className="flex-1 p-2 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] text-center text-purple-400">
          MONTHLY PROJECTED: +37.8%
        </div>
      </div>
    </div>
  );
};
