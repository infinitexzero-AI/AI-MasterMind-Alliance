import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, RotateCcw, X } from 'lucide-react';

interface ErrorRecord {
    stepId: string;
    agent: string;
    error: string;
    timestamp: string;
    retryCount: number;
    maxRetries: number;
    details?: string;
}

interface ErrorAggregationPanelProps {
    errors?: ErrorRecord[];
    // eslint-disable-next-line no-unused-vars
    onRetry?: (stepId: string) => void;
    // eslint-disable-next-line no-unused-vars
    onDismiss?: (stepId: string) => void;
    onRetryAll?: () => void;
    onDismissAll?: () => void;
}

export default function ErrorAggregationPanel({
    errors = [],
    onRetry = () => { },
    onDismiss = () => { },
    onRetryAll = () => { },
    onDismissAll = () => { }
}: ErrorAggregationPanelProps) {
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

    const toggleExpanded = (stepId: string) => {
        const newSet = new Set(expandedSteps);
        if (newSet.has(stepId)) {
            newSet.delete(stepId);
        } else {
            newSet.add(stepId);
        }
        setExpandedSteps(newSet);
    };

    if (errors.length === 0) {
        return (
            <div className="p-6 rounded-3xl border border-green-500/20 bg-green-950/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-sm font-medium">No errors detected — system healthy</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-3xl border border-red-500/30 bg-red-950/20 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-red-300">
                    Errors ({errors.length})
                </h3>
            </div>

            {/* Error List */}
            <div className="space-y-3">
                {errors.map((error) => (
                    <div
                        key={error.stepId}
                        className="border border-red-500/30 rounded-lg bg-red-900/10 overflow-hidden"
                    >
                        {/* Header Row */}
                        <button
                            onClick={() => toggleExpanded(error.stepId)}
                            className="w-full p-4 flex items-center justify-between hover:bg-red-900/20 transition-all text-left"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-mono text-red-400">{error.stepId}</span>
                                    <span className="text-xs font-semibold text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded">
                                        {error.agent}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-red-300">{error.error}</p>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-slate-400 transition-transform ${expandedSteps.has(error.stepId) ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Expanded Details */}
                        {expandedSteps.has(error.stepId) && (
                            <div className="border-t border-red-500/20 px-4 py-3 bg-red-900/5 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                                    <p className="text-sm font-mono text-slate-300">{error.timestamp}</p>
                                </div>
                                {error.details && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Details</p>
                                        <p className="text-sm text-slate-300 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                                            {error.details}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
                                    <div className="text-xs text-slate-400">
                                        Retries: {error.retryCount} / {error.maxRetries}
                                    </div>
                                    <div className="flex gap-2">
                                        {error.retryCount < error.maxRetries && (
                                            <button
                                                onClick={() => onRetry(error.stepId)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Retry
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDismiss(error.stepId)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/30 border border-slate-600/50 rounded text-slate-300 text-xs font-semibold hover:bg-slate-700/50 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            {errors.length > 1 && (
                <div className="mt-6 pt-6 border-t border-red-500/20 flex gap-2">
                    <button
                        onClick={onRetryAll}
                        className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-all"
                    >
                        Retry All
                    </button>
                    <button
                        onClick={onDismissAll}
                        className="flex-1 px-4 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-semibold hover:bg-slate-700/50 transition-all"
                    >
                        Dismiss All
                    </button>
                </div>
            )}
        </div>
    );
}
