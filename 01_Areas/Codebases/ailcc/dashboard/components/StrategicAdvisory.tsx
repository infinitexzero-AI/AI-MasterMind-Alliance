import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Advice {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'CRITICAL';
    verdict: string;
    recommendation: string;
}

export const StrategicAdvisory = ({ logs }: { logs?: Advice[] }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mock advice if none provided
    const displayLogs = logs || [
        {
            id: '1',
            timestamp: new Date().toISOString(),
            level: 'INFO',
            verdict: 'Unified System Handoff stabilized.',
            recommendation: 'Monitor memory load on Swarm Node 4.'
        },
        {
            id: '2',
            timestamp: new Date().toISOString(),
            level: 'WARNING',
            verdict: 'Storage entropy detected in Downloads vault.',
            recommendation: 'Trigger Task #9 (Vault Organizer) to restore order.'
        }
    ];

    return (
        <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl relative overflow-hidden">
            <header className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 rounded bg-orange-500/20 border border-orange-500/50">
                    <Scale className="text-orange-400" size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">The Judge</h2>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Strategic Growth Advisory
                    </p>
                </div>
            </header>

            <div className="space-y-4 relative z-10">
                {displayLogs.map((log) => (
                    <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border flex gap-4 ${
                            log.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' :
                            log.level === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30' :
                            'bg-slate-800/40 border-slate-700/50'
                        }`}
                    >
                        <div className="flex-shrink-0 mt-1">
                            {log.level === 'CRITICAL' && <AlertTriangle className="text-red-400" size={16} />}
                            {log.level === 'WARNING' && <AlertTriangle className="text-amber-400" size={16} />}
                            {log.level === 'INFO' && <ShieldCheck className="text-emerald-400" size={16} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold ${
                                    log.level === 'CRITICAL' ? 'text-red-400' :
                                    log.level === 'WARNING' ? 'text-amber-400' :
                                    'text-emerald-400'
                                }`}>
                                    {log.level} VERDICT
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">
                                    {isMounted ? new Date(log.timestamp).toLocaleTimeString() : '--:--:--'}
                                </span>
                            </div>
                            <p className="text-xs text-white mb-2 leading-relaxed">
                                {log.verdict}
                            </p>
                            <div className="text-[10px] font-mono text-cyan-400/80 bg-cyan-900/10 p-2 rounded border border-cyan-400/20 italic">
                                REC: {log.recommendation}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Decorative Gavel Background */}
            <Scale className="absolute -bottom-8 -right-8 text-white/5 rotate-12" size={160} />
        </div>
    );
};
