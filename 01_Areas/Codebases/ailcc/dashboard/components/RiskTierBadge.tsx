import React from 'react';

type RiskTier = 'low' | 'medium' | 'high';

interface RiskTierBadgeProps {
    riskTier: RiskTier;
    keyRisks?: string[];
}

export default function RiskTierBadge({ riskTier, keyRisks = [] }: RiskTierBadgeProps) {
    const baseClasses = "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border cursor-help";

    // Color mapping
    const styles = {
        low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        high: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="flex items-center gap-2 mt-1" title={keyRisks.join('\n')}>
            <span className={`${baseClasses} ${styles[riskTier] || styles.low}`}>
                {riskTier} RISK
            </span>
            {keyRisks.length > 0 && (
                <span className="text-[9px] text-slate-400 truncate max-w-[200px]">
                    {keyRisks.join(', ')}
                </span>
            )}
        </div>
    );
}
