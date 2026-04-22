import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, AlertTriangle, Activity, BarChart3, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForecastData {
    equilibrium: 'optimizing' | 'stable' | 'degrading';
    confidence: number;
    bottleneck: string | null;
    estimatedSurge: number;
    ghostActive: boolean;
    predictedQueries: string[];
}

const PredictiveTelemetry: React.FC = () => {
    const [forecast, setForecast] = useState<ForecastData>({
        equilibrium: 'stable',
        confidence: 94,
        bottleneck: null,
        estimatedSurge: 5,
        ghostActive: true,
        predictedQueries: []
    });

    // Handle Ghost Agent sync events
    useEffect(() => {
        const handleGhostEvent = (e: any) => {
            const detail = e.detail;
            if (detail?.question) {
                setForecast(prev => ({
                    ...prev,
                    predictedQueries: [detail.question, ...(prev.predictedQueries || [])].slice(0, 3)
                }));
            }
        };
        window.addEventListener('ghost_sync', handleGhostEvent);
        return () => window.removeEventListener('ghost_sync', handleGhostEvent);
    }, []);

    // Simulated prediction logic based on standard variance
    useEffect(() => {
        const interval = setInterval(() => {
            const rand = Math.random();
            let eq: 'optimizing' | 'stable' | 'degrading' = 'stable';
            if (rand > 0.85) eq = 'degrading';
            else if (rand < 0.15) eq = 'optimizing';

            setForecast(prev => ({
                ...prev,
                equilibrium: eq,
                confidence: 85 + Math.random() * 10,
                bottleneck: eq === 'degrading' ? 'CPU Spike (Inference Queue)' : null,
                estimatedSurge: eq === 'degrading' ? 15 + Math.random() * 20 : 2 + Math.random() * 5
            }));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (forecast.equilibrium === 'optimizing') return 'text-emerald-400 border-emerald-500/30';
        if (forecast.equilibrium === 'degrading') return 'text-amber-400 border-amber-500/30';
        return 'text-cyan-400 border-cyan-500/30';
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity flex justify-end w-full">
                <BarChart3 className="w-12 h-12 text-white" />
            </div>

            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 relative z-10">
                <h3 className="font-mono text-slate-200 uppercase text-sm flex items-center gap-3 font-bold tracking-[0.2em]">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Predictive Equilibrium
                </h3>
                {forecast.ghostActive && (
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse relative" />
                        Ghost Active
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Legacy Stats Left Side */}
                <div className="space-y-4">
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">State Forecast</span>
                        <div className={`text-sm font-bold flex items-center gap-2 ${getStatusColor()}`}>
                            <TrendingUp className="w-3.5 h-3.5" />
                            {forecast.equilibrium.toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Forecast Confidence</span>
                        <div className="text-xl font-mono text-white flex items-baseline gap-1">
                            {forecast.confidence.toFixed(1)}<span className="text-[10px] text-slate-500">%</span>
                        </div>
                    </div>
                </div>

                {/* Legacy Stats Right Side */}
                <div className="space-y-4">
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Projected Surge</span>
                        <div className="text-sm font-mono text-white">
                            +{forecast.estimatedSurge.toFixed(1)}% <span className="text-slate-500">load</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Neural Pressure</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full ${i <= (forecast.estimatedSurge / 8) ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Ghost Agent Predictions Module */}
            <div className="mt-6 pt-5 border-t border-white/5 relative z-10 space-y-3">
                <div className="text-[10px] text-slate-500 tracking-widest uppercase flex items-center gap-2 font-mono">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                    Cached Zero-Latency Hits (Ghost)
                </div>
                <div className="space-y-2">
                    {forecast.predictedQueries.length > 0 ? (
                        forecast.predictedQueries.map((q, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i}
                                className="text-xs text-slate-300 font-mono tracking-wide bg-slate-900/50 p-2 rounded border border-white/5 shadow-inner"
                            >
                                <span className="text-emerald-500 mr-2">›</span> {q}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-xs text-slate-600 font-mono tracking-widest italic bg-slate-900/30 p-2 rounded border border-white/5 text-center">
                            Awaiting Contextual Vectorization...
                        </div>
                    )}
                </div>
            </div>

            {forecast.bottleneck && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3 relative z-10"
                >
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-mono text-amber-200 uppercase tracking-tighter">
                        Potential Bottleneck: {forecast.bottleneck}
                    </span>
                </motion.div>
            )}

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <Activity className="w-3 h-3 animate-pulse" />
                    MODEL: FORECAST-v2
                </div>
                <div className="text-[9px] font-mono text-cyan-500/50 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                    LEVEL 16 ACTIVE
                </div>
            </div>
        </div>
    );
};

export default PredictiveTelemetry;
