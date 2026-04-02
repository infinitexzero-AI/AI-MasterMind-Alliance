import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, AlertTriangle } from 'lucide-react';

export default function KnowledgeMap() {
    const [data, setData] = useState<{ x: number, y: number, weight: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5005/api/hippocampus/heatmap')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="relative w-full h-[300px] bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <Map className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Semantic Coverage Heat-Map</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-full animate-pulse">
                    <Sparkles className="w-8 h-8 text-cyan-500/20" />
                </div>
            ) : data.length > 0 ? (
                <div className="relative w-full h-full">
                    {data.map((point, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.01 }}
                            style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`,
                                background: `radial-gradient(circle, rgba(6, 182, 212, ${point.weight}) 0%, transparent 70%)`,
                                width: `${point.weight * 100}px`,
                                height: `${point.weight * 100}px`
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
                        />
                    ))}

                    {/* Knowledge Gap Indicators */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span className="text-[9px] font-bold text-rose-400 uppercase">3 Knowledge Gaps Detected</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                    <Map className="w-6 h-6 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-500">Awaiting Coordinate Ingestion...</span>
                </div>
            )}
        </div>
    );
}
