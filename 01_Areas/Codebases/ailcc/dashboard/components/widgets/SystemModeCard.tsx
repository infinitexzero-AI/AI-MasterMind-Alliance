import React, { useEffect, useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { Clock, Zap, Book, Shield, Moon } from 'lucide-react';

interface ContextData {
    active_mode: string;
    mode_info: {
        name: string;
        description: string;
        apps: string[];
        color: string;
    };
    last_update: string;
}

export const SystemModeCard: React.FC = () => {
    const [context, setContext] = useState<ContextData | null>(null);

    useEffect(() => {
        const fetchContext = async () => {
            const res = await fetch('/api/context');
            if (res.ok) setContext(await res.json());
        };
        fetchContext();
        const interval = setInterval(fetchContext, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    if (!context) return null;

    const getIcon = () => {
        switch (context.active_mode) {
            case 'SCHOLAR': return <Book size={18} className="text-cyan-400" />;
            case 'CODE': return <Zap size={18} className="text-purple-400" />;
            case 'STRATEGY': return <Shield size={18} className="text-emerald-400" />;
            default: return <Moon size={18} className="text-slate-400" />;
        }
    };

    return (
        <DashboardCard
            title="Active Environment"
            subtitle="Autonomous Context Control"
            headerAction={
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Clock size={10} />
                    {context.last_update ? context.last_update.split(' ')[1] : 'SYNCING'}
                </div>
            }
        >
            <div className="space-y-4">
                <div className={`p-4 rounded-xl border-l-4 bg-slate-900/50 flex items-start gap-4 transition-all
                    ${context.active_mode === 'SCHOLAR' ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' :
                        context.active_mode === 'CODE' ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]' :
                            context.active_mode === 'STRATEGY' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                                'border-slate-700'}`}
                >
                    <div className="p-2 rounded-lg bg-white/5">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{context.mode_info.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {context.mode_info.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest pl-1">Active Artifacts</div>
                    <div className="flex flex-wrap gap-2">
                        {context.mode_info.apps?.map((app, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono">
                                {app}
                            </span>
                        ))}
                        {(!context.mode_info.apps || context.mode_info.apps.length === 0) && <span className="text-[10px] text-slate-400 font-mono">Standby Mode</span>}
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};
