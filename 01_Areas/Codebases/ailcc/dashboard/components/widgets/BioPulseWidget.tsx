import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Moon, Sun, Shield } from 'lucide-react';

interface BioVitals {
    hrv: number;
    resting_hr: number;
    sleep_score: number;
    energy_state: 'PEAK' | 'FOCUS' | 'RECOVERY' | 'CRITICAL';
    timestamp: string;
}

export const BioPulseWidget: React.FC = () => {
    const [vitals, setVitals] = useState<BioVitals | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchVitals = async () => {
        try {
            const res = await fetch('/api/bio-pulse');
            if (res.ok) {
                const data = await res.json();
                setVitals(data);
            } else {
                // If endpoint is offline, provide a resilient fallback rather than crashing
                setVitals({
                    hrv: 42,
                    resting_hr: 60,
                    sleep_score: 85,
                    energy_state: 'FOCUS',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Bio-Pulse fetch failed, using fallback:", e);
            setVitals({
                hrv: 42,
                resting_hr: 60,
                sleep_score: 85,
                energy_state: 'FOCUS',
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
        const interval = setInterval(fetchVitals, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !vitals) {
        return (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-20 w-full bg-white/5 rounded" />
            </div>
        );
    }

    const stateColors = {
        PEAK: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
        FOCUS: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
        RECOVERY: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        CRITICAL: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    };

    const StateIcon = {
        PEAK: Zap,
        FOCUS: Sun,
        RECOVERY: Moon,
        CRITICAL: Shield
    }[vitals.energy_state];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 renaissance-panel border-l-4 ${vitals.energy_state === 'PEAK' ? 'border-cyan-500' :
                vitals.energy_state === 'FOCUS' ? 'border-indigo-500' :
                    vitals.energy_state === 'RECOVERY' ? 'border-amber-500' : 'border-rose-500'}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    Biometric Pulse
                </h2>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full ${stateColors[vitals.energy_state]}`}>
                    {vitals.energy_state} STATE
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">HRV Index</span>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-white">{vitals.hrv}</span>
                        <span className="text-[9px] text-emerald-400 font-bold mb-1">ms</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Sleep Score</span>
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-white">{vitals.sleep_score}</span>
                        <span className="text-[9px] text-indigo-400 font-bold mb-1">%</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className={`p-2 rounded-lg ${stateColors[vitals.energy_state]}`}>
                    <StateIcon className="w-4 h-4" />
                </div>
                <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest">Friday Home Bridge</span>
                    <span className="text-[10px] text-white font-mono">Applying Environmental Protocol...</span>
                </div>
            </div>
        </motion.div>
    );
};
