import React from 'react';

/**
 * Skeleton Loader Components
 * 
 * Reusable loading placeholders that match actual component layouts
 */

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-800/50 rounded ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-900/50 border border-slate-800 rounded-lg p-4 ${className}`}>
        <div className="space-y-3">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
            <SkeletonLine className="h-3 w-5/6" />
        </div>
    </div>
);

export const SkeletonMetric: React.FC = () => (
    <div className="animate-pulse flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-800/50 rounded" />
        <div className="flex-1 space-y-2">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-4 w-24" />
        </div>
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 p-2">
                <SkeletonLine className="h-4 w-20" />
                <SkeletonLine className="h-4 flex-1" />
                <SkeletonLine className="h-4 w-24" />
            </div>
        ))}
    </div>
);

export const SkeletonTacticsHUD: React.FC = () => (
    <div className="flex gap-6 p-4 bg-slate-950/50 border-b border-slate-800">
        <SkeletonMetric />
        <SkeletonMetric />
        <SkeletonMetric />
        <SkeletonMetric />
        <SkeletonMetric />
    </div>
);

export const SkeletonLogViewer: React.FC = () => (
    <div className="space-y-1 p-2">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-2 animate-pulse">
                <SkeletonLine className="h-4 w-16" />
                <SkeletonLine className="h-4 w-24" />
                <SkeletonLine className="h-4 flex-1" />
            </div>
        ))}
    </div>
);

export const SkeletonAgentCard: React.FC = () => (
    <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-[200px] flex flex-col justify-between overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800/40 rounded-xl" />
            <div className="flex-1 space-y-2">
                <SkeletonLine className="h-5 w-32 bg-slate-800/40" />
                <SkeletonLine className="h-3 w-20 bg-slate-800/30" />
            </div>
        </div>
        <div className="space-y-3 mb-4">
            <SkeletonLine className="h-4 w-full bg-slate-800/30" />
            <SkeletonLine className="h-4 w-5/6 bg-slate-800/30" />
        </div>
        <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-800/40 rounded-full" />
            <div className="h-6 w-24 bg-slate-800/40 rounded-full" />
        </div>
    </div>
);

