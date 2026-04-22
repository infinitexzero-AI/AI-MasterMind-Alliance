import React, { useEffect, useState } from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface FinanceData {
    metrics: {
        net_worth: number;
        income_projected_monthly: number;
        burn_rate_daily: number;
        savings_rate_percent: number;
    };
    abundance_score: number;
    accounts: { name: string; balance: number; trend: string }[];
}

export const FinanceHUD: React.FC = () => {
    const [data, setData] = useState<FinanceData | null>(null);

    useEffect(() => {
        const fetchFinance = async () => {
            const res = await fetch('/api/finance');
            if (res.ok) setData(await res.json());
        };
        fetchFinance();
    }, []);

    if (!data) return null;

    return (
        <DashboardCard
            title="Sustainable Abundance"
            subtitle="Mode 4 Financial Pulse"
            headerAction={<div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">SCORE: {data.abundance_score}%</div>}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Net Worth</div>
                        <div className="text-lg font-bold text-white">${data.metrics.net_worth.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-400 font-mono uppercase mb-1">Savings Rate</div>
                        <div className="text-lg font-bold text-cyan-400">{data.metrics.savings_rate_percent}%</div>
                    </div>
                </div>

                <div className="space-y-2">
                    {data.accounts.map((acc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-white/5 group hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <Wallet size={14} className="text-slate-400" />
                                <span className="text-xs text-slate-300 font-medium">{acc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-white">${acc.balance.toLocaleString()}</span>
                                {acc.trend === 'up' ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>BURN RATE (DAILY)</span>
                        <span className="text-rose-400 font-bold">${data.metrics.burn_rate_daily}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 mt-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.abundance_score}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};
