import React, { useEffect, useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';

interface YieldMetrics {
    last_updated: string;
    current_month: {
        income: number;
        total_spent: number;
        net: number;
        savings_rate_pct: number;
        burn_rate: number;
        breakdown: Record<string, number>;
    };
    nslsc?: {
        balance: string;
        next_payment: string;
        payment_date: string;
        status: string;
        last_checked: string;
    };
}

export const TycoonYieldTracker: React.FC = () => {
    const [metrics, setMetrics] = useState<YieldMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/tycoon/metrics');
                if (res.ok) {
                    setMetrics(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch Tycoon metrics:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <div className="h-48 animate-pulse bg-slate-900/50 rounded-2xl border border-white/5" />;
    if (!metrics) return null;

    const { current_month } = metrics;
    const isHealthy = current_month.savings_rate_pct >= 20;

    return (
        <DashboardCard
            title="Tycoon Yield & Burn"
            subtitle="Sovereign Capital Telemetry"
            headerAction={
                <div className={`text-[9px] font-black px-2 py-0.5 rounded border ${isHealthy ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`}>
                    {isHealthy ? 'YIELD_POSITIVE' : 'BURN_CRITICAL'}
                </div>
            }
        >
            <div className="space-y-4">
                {/* Burn Rate Gauge */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Monthly Burn</div>
                        <div className="text-xl font-black text-white italic">${current_month.burn_rate.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Savings Rate</div>
                        <div className={`text-xl font-black italic ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {current_month.savings_rate_pct}%
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="relative h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(current_month.savings_rate_pct, 100)}%` }}
                        className={`absolute top-0 left-0 h-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    />
                </div>

                {/* Yield Nodes / Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Deployment SR</span>
                        </div>
                        <div className="text-xs font-black text-white">94.2% <span className="text-[8px] text-emerald-500 italic">+2.1%</span></div>
                    </div>
                    <div className="p-3 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Nodes</span>
                        </div>
                        <div className="text-xs font-black text-white">3 Nodes <span className="text-[8px] text-slate-500 font-mono">(VOO, BTC, FC)</span></div>
                    </div>
                </div>

                {/* Student Loan Persistence (Phase 18 Integration) */}
                {metrics.nslsc && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-amber-300 font-black uppercase">Student Loan Persistence</span>
                            <span className="text-[8px] font-mono text-slate-500">Synced: {new Date(metrics.nslsc.last_checked).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-sm font-black text-white italic">{metrics.nslsc.balance}</div>
                            <div className="text-right">
                                <div className="text-[8px] text-slate-500 uppercase font-mono">Next Payment</div>
                                <div className="text-[10px] text-amber-400 font-bold">{metrics.nslsc.next_payment}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};
