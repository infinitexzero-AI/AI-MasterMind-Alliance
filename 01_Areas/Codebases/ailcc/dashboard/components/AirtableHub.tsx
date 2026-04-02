import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface AirtableStat {
    label: string;
    value: string;
    color: string;
}

export const AirtableHub = () => {
    // Mock Data - In a real implementation this would fetch from /api/integrations/airtable
    const [apiUsage, setApiUsage] = useState(124); // Calls this month
    const [bases, setBases] = useState([
        { name: 'Strategic Masterplan', records: 42, lastSync: '10m ago', status: 'SYNCED' },
        { name: 'Agent Task Queue', records: 156, lastSync: '2m ago', status: 'SYNCED' },
        { name: 'Knowledge Graph', records: 890, lastSync: '1h ago', status: 'PENDING' }
    ]);

    const apiLimit = 1000;
    const usagePercent = (apiUsage / apiLimit) * 100;

    return (
        <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-amber-500/20 border border-amber-500/50">
                        <Database className="text-amber-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Airtable Strategic Hub</h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Knowledge & Task Persistence
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-200">{apiUsage} / {apiLimit}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Monthly API Calls</div>
                </div>
            </header>

            {/* API Usage Bar */}
            <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    className={`h-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
            </div>

            {/* Bases List */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Connected Bases</h3>
                {bases.map((base, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/5 hover:border-amber-500/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {base.status === 'SYNCED' ? (
                                <CheckCircle size={14} className="text-emerald-400" />
                            ) : (
                                <Activity size={14} className="text-amber-400 animate-pulse" />
                            )}
                            <div>
                                <div className="text-xs font-bold text-slate-200">{base.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">{base.records} records • {base.lastSync}</div>
                            </div>
                        </div>
                        <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            <span className={`text-[10px] font-bold ${base.status === 'SYNCED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {base.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Zap size={14} className="text-yellow-400" />
                    <span>Next scheduled sync: <strong>14:00:00</strong></span>
                </div>
            </div>
        </div>
    );
};
