import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, Loader2, Clock,
    MousePointer, Globe, Type, Camera,
    ArrowDownUp, ListChecks, ArrowRight
} from 'lucide-react';

export interface ActionLogEntry {
    action: string;
    status: 'running' | 'done' | 'error' | 'skipped';
    result?: string;
    timestamp?: string;
    extracted?: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
    navigate: Globe,
    click: MousePointer,
    type: Type,
    screenshot: Camera,
    extract: ArrowRight,
    wait: Clock,
    press: Type,
    scroll: ArrowDownUp,
    hover: MousePointer,
    select: ListChecks,
};

const STATUS_COLORS = {
    running: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    done: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    error: 'text-rose-400 border-rose-400/30 bg-rose-400/5',
    skipped: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
};

function elapsed(ts?: string): string {
    if (!ts) return '';
    const ms = Date.now() - new Date(ts).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

export default function ActionLog({ entries, planPreview }: { entries: ActionLogEntry[]; planPreview?: any[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">Action Log</h3>
                <span className="ml-auto text-[9px] font-mono text-slate-400">{entries.length} steps</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Plan preview (before execution) */}
                {planPreview && entries.length === 0 && (
                    <AnimatePresence>
                        {planPreview.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/50 border border-white/5"
                            >
                                <span className="text-[9px] font-mono text-slate-400 w-4 flex-none mt-0.5">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase">{step.action}</span>
                                    {step.url && <p className="text-[9px] text-slate-400 truncate">{step.url}</p>}
                                    {step.selector && <p className="text-[9px] text-slate-400 truncate">{step.selector}</p>}
                                    {step.text && <p className="text-[9px] text-cyan-600 truncate">"{step.text}"</p>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Execution log */}
                <AnimatePresence>
                    {entries.map((entry, i) => {
                        const Icon = ACTION_ICONS[entry.action] || ArrowRight;
                        const ts = entry.status === 'running' ? '' : elapsed(entry.timestamp);
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${STATUS_COLORS[entry.status]}`}
                            >
                                <div className="flex-none mt-0.5">
                                    {entry.status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {entry.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {entry.status === 'error' && <XCircle className="w-3.5 h-3.5" />}
                                    {entry.status === 'skipped' && <Clock className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <Icon className="w-3 h-3 flex-none opacity-60" />
                                        <span className="text-[10px] font-mono font-bold uppercase flex-1">{entry.action}</span>
                                        {ts && <span className="text-[8px] font-mono opacity-40 flex-none">{ts}</span>}
                                    </div>
                                    {entry.result && (
                                        <p className="text-[9px] opacity-70 mt-0.5 leading-relaxed truncate">{entry.result}</p>
                                    )}
                                    {entry.extracted && (
                                        <div className="mt-1 p-1.5 rounded bg-black/30 border border-current/10">
                                            <p className="text-[8px] font-mono opacity-80 leading-relaxed line-clamp-3">{entry.extracted}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {entries.length === 0 && !planPreview && (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-700">
                        <Clock className="w-6 h-6 opacity-30" />
                        <span className="text-[9px] font-mono uppercase tracking-widest">Awaiting execution</span>
                    </div>
                )}
            </div>
        </div>
    );
}
