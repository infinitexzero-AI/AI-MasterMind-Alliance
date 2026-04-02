import React from 'react';
import Tooltip from './Tooltip';

export interface StatusIndicatorProps {
    label?: string;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    tooltip?: string;
    pulse?: boolean;
}

export default function StatusIndicator({ label, status, tooltip, pulse = true }: StatusIndicatorProps) {
    const getColor = (s: string) => {
        switch (s) {
            case 'healthy': return 'bg-emerald-500 text-emerald-400';
            case 'degraded': return 'bg-amber-500 text-amber-400';
            case 'unhealthy': return 'bg-red-500 text-red-400';
            case 'unknown': return 'bg-slate-500 text-slate-400';
            default: return 'bg-slate-500 text-slate-400';
        }
    };

    const baseColor = getColor(status).split(' ')[0];
    const textColor = getColor(status).split(' ')[1];

    const indicator = (
        <div className="flex items-center gap-2">
            <div className="relative flex w-2 h-2">
                {pulse && status === 'healthy' && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${baseColor}`}></span>
                )}
                <span className={`relative inline-flex rounded-full w-2 h-2 ${baseColor}`}></span>
            </div>
            {label && <span className={`text-xs font-mono font-medium ${textColor}`}>{label}</span>}
        </div>
    );

    if (tooltip) {
        return <Tooltip content={tooltip}>{indicator}</Tooltip>;
    }

    return indicator;
}
