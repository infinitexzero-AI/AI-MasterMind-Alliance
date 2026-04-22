import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface HeatmapProps {
    data: number[]; // 24 values representing activity per hour
    label: string;
    agent?: 'comet' | 'antigravity' | 'grok' | 'none';
}

export const ActivityHeatmap: React.FC<HeatmapProps> = ({ data, label, agent = 'none' }) => {
    // Calculate 24-hour activity grid
    // data is expected to be 24 indices (one per hour)

    return (
        <div className="renaissance-panel p-4 flex flex-col gap-3" data-agent={agent}>
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label} Activity (24H)</h3>
                <div className="flex items-center gap-1 group relative">
                    <Info className="w-3 h-3 text-slate-500 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-32 p-2 bg-slate-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[8px] text-slate-400 z-50">
                        Visualizing hourly agent cycles and task throughput.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5">
                {data.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="heatmap-cell aspect-square rounded-sm relative group cursor-crosshair"
                        data-intensity={Math.floor(val / 10) * 10}
                    >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-[7px] text-white whitespace-nowrap z-50">
                            {i}:00 — {val}% Intensity
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between items-center text-[7px] text-slate-600 font-mono mt-1">
                <span>24H AGO</span>
                <div className="flex gap-1 items-center">
                    <span>LOW</span>
                    <div className="heatmap-cell w-2 h-2 rounded-sm" data-intensity="10" />
                    <div className="heatmap-cell w-2 h-2 rounded-sm" data-intensity="50" />
                    <div className="heatmap-cell w-2 h-2 rounded-sm" data-intensity="100" />
                    <span>HIGH</span>
                </div>
                <span>NOW</span>
            </div>
        </div>
    );
};
