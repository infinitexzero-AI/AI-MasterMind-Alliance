import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface CostData {
    agent: string;
    cost: number;
    tokens: number;
    percentage: number;
}

interface CostTrackingPanelProps {
    costs?: CostData[];
    totalCost?: number;
    dailyBudget?: number;
    trendDirection?: 'up' | 'down' | 'stable';
}

export default function CostTrackingPanel({
    costs = [
        { agent: 'Comet', cost: 1.23, tokens: 800, percentage: 35 },
        { agent: 'Grok', cost: 1.45, tokens: 920, percentage: 42 },
        { agent: 'Gemini', cost: 0.52, tokens: 340, percentage: 15 },
        { agent: 'n8n', cost: 0.27, tokens: 180, percentage: 8 }
    ],
    totalCost = 3.47,
    dailyBudget = 10.0,
    trendDirection = 'stable'
}: CostTrackingPanelProps) {
    const budgetRemaining = dailyBudget - totalCost;
    const budgetPercentage = (totalCost / dailyBudget) * 100;
    const isOverBudget = budgetPercentage > 100;
    const isWarning = budgetPercentage > 75;

    // Client-side only forecast to avoid hydration mismatch
    const [forecast, setForecast] = useState<string | null>(null);
    useEffect(() => {
        const hours = Math.max(new Date().getHours(), 1);
        setForecast((totalCost * (24 / hours)).toFixed(2));
    }, [totalCost]);

    const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
    const getTrendColor = () => {
        if (trendDirection === 'up') return 'text-red-400';
        if (trendDirection === 'down') return 'text-green-400';
        return 'text-cyan-400';
    };

    return (
        <div className="p-6 rounded-3xl border border-slate-700/20 bg-slate-900/60 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Cost Tracking</h3>
                </div>
                {isOverBudget && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-mono text-red-400">OVER BUDGET</span>
                    </div>
                )}
            </div>

            {/* Budget Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-mono text-slate-300">Daily Budget</span>
                    <span className={`text-sm font-bold ${isOverBudget ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-cyan-400'}`}>
                        ${totalCost.toFixed(2)} / ${dailyBudget.toFixed(2)}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                    <motion.div
                        className={`h-full ${isOverBudget
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : isWarning
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-cyan-500 to-cyan-600'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    ${budgetRemaining.toFixed(2)} remaining ({(100 - budgetPercentage).toFixed(1)}%)
                </p>
            </div>

            {/* Cost by Agent */}
            <div className="space-y-3">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Breakdown by Agent</p>
                {costs.map((item) => (
                    <div key={item.agent} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/20 hover:border-slate-700/50 transition-all">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-200">{item.agent}</p>
                            <p className="text-xs text-slate-400">{item.tokens.toLocaleString()} tokens</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-cyan-400">${item.cost.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">{item.percentage}%</p>
                        </div>
                        <div className="ml-4 w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-500/50"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Forecast */}
            <div className="mt-6 p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center gap-2 mb-1">
                    <TrendIcon className={`w-4 h-4 ${getTrendColor()}`} />
                    <span className="text-xs font-mono text-slate-400">Spend Forecast</span>
                </div>
                <p className="text-sm font-bold text-white">
                    ${forecast ?? '—'} estimated today
                </p>
            </div>
        </div>
    );
}

