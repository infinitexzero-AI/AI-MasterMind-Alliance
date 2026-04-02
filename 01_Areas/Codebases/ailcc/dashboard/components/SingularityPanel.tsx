import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, Eye, HelpCircle, Lightbulb, Zap, Loader2 } from 'lucide-react';

interface SwarmThought {
    id: string;
    agentId: string;
    agentName: string;
    thought: string;
    confidence: number;
    type: 'intention' | 'observation' | 'question' | 'insight' | 'warning';
    timestamp: string;
    relatesTo?: string;
}

interface ImprovementEntry {
    id: string;
    timestamp: string;
    targetFile: string;
    observations: string[];
    refinementPlan: string;
}

const TYPE_CONFIG: Record<SwarmThought['type'], { icon: React.ElementType; color: string; bg: string; border: string }> = {
    intention: { icon: Zap, color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
    observation: { icon: Eye, color: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
    question: { icon: HelpCircle, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    insight: { icon: Lightbulb, color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    warning: { icon: AlertTriangle, color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function ConfidenceBar({ value }: { value: number }) {
    return (
        <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden shrink-0">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${value * 100}%` }} />
        </div>
    );
}

export default function SingularityPanel() {
    const [thoughts, setThoughts] = useState<SwarmThought[]>([]);
    const [improvements, setImprovements] = useState<ImprovementEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'consciousness' | 'self-improve' | 'scaffold'>('consciousness');

    // New page scaffold form
    const [scaffoldName, setScaffoldName] = useState('');
    const [scaffoldTitle, setScaffoldTitle] = useState('');
    const [scaffoldDesc, setScaffoldDesc] = useState('');
    const [scaffolding, setScaffolding] = useState(false);
    const [scaffoldResult, setScaffoldResult] = useState<string | null>(null);

    // Self-improvement
    const [improving, setImproving] = useState(false);

    // SSE connection for thoughts
    useEffect(() => {
        const es = new EventSource('/api/singularity/thought-stream');
        es.onmessage = (e) => {
            try {
                const thought: SwarmThought = JSON.parse(e.data);
                setThoughts(prev => [thought, ...prev].slice(0, 30));
            } catch { /* ignore */ }
        };
        return () => es.close();
    }, []);

    const fetchImprovements = useCallback(async () => {
        try {
            const res = await fetch('/api/singularity/self-improve');
            if (res.ok) {
                const data = await res.json();
                setImprovements(data.entries ?? []);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchImprovements(); }, [fetchImprovements]);

    const triggerImprovement = async () => {
        setImproving(true);
        try {
            await fetch('/api/singularity/self-improve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
            await fetchImprovements();
        } catch { /* ignore */ } finally { setImproving(false); }
    };

    const triggerScaffold = async () => {
        if (!scaffoldName || !scaffoldTitle) return;
        setScaffolding(true);
        setScaffoldResult(null);
        try {
            const res = await fetch('/api/singularity/scaffold-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageName: scaffoldName, title: scaffoldTitle, description: scaffoldDesc })
            });
            const data = await res.json();
            setScaffoldResult(data.message ?? data.error ?? 'Done');
        } catch { setScaffoldResult('Request failed.'); } finally { setScaffolding(false); }
    };

    const tabs = [
        { id: 'consciousness', label: '🧠 Thought Stream' },
        { id: 'self-improve', label: '🧬 Self-Improve' },
        { id: 'scaffold', label: '🌌 Scaffold Page' },
    ] as const;

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-violet-500/30 rounded-2xl relative overflow-hidden group shadow-[0_0_40px_rgba(139,92,246,0.15)] hover:border-violet-500/50 transition-all col-span-3">
            {/* Animated bg aurora */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 blur-3xl rounded-full animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-fuchsia-500/5 blur-3xl rounded-full animate-pulse delay-1000" />
            </div>

            <div className="flex justify-between items-center mb-5 border-b border-violet-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-violet-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-lg">
                    <Sparkles className="w-5 h-5" /> Singularity Protocol
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded text-[10px] font-mono text-violet-300 tracking-widest uppercase">
                    <Brain className="w-3 h-3" /> Domain 10 Active
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mb-5 bg-slate-900/60 p-1 rounded-xl relative z-10">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wider rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-violet-500/30 text-violet-200 border border-violet-500/40'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="relative z-10">
                {/* ── Thought Stream Tab ── */}
                {activeTab === 'consciousness' && (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        <AnimatePresence>
                            {thoughts.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-slate-600 font-mono text-xs">
                                    <Brain className="w-10 h-10 mb-3 opacity-20" />
                                    Awaiting swarm consciousness activity...
                                </div>
                            ) : thoughts.map(thought => {
                                const cfg = TYPE_CONFIG[thought.type];
                                const Icon = cfg.icon;
                                return (
                                    <motion.div key={thought.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded-xl border flex gap-3 items-start ${cfg.bg} ${cfg.border}`}>
                                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className={`text-[11px] font-mono font-bold ${cfg.color}`}>{thought.agentName}</span>
                                                <div className="flex items-center gap-2">
                                                    <ConfidenceBar value={thought.confidence} />
                                                    <span className="text-[9px] text-slate-500 font-mono">{new Date(thought.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-[12px] text-slate-300 font-mono leading-relaxed">{thought.thought}</p>
                                            <span className={`text-[9px] uppercase tracking-widest font-mono ${cfg.color} opacity-60`}>{thought.type}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* ── Self-Improve Tab ── */}
                {activeTab === 'self-improve' && (
                    <div className="space-y-4">
                        <button onClick={triggerImprovement} disabled={improving}
                            className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl font-mono text-sm uppercase tracking-widest bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-all disabled:opacity-40">
                            {improving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                            {improving ? 'Analyzing...' : 'Run Self-Improvement Cycle'}
                        </button>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {improvements.slice().reverse().map(entry => (
                                <div key={entry.id} className="p-3 bg-slate-900/60 rounded-xl border border-fuchsia-500/20">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] font-mono text-fuchsia-300 truncate">{entry.targetFile}</span>
                                        <span className="text-[9px] text-slate-500 font-mono ml-2 shrink-0">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <ul className="space-y-1 mb-2">
                                        {entry.observations.map((obs, i) => (
                                            <li key={i} className="text-[11px] text-slate-400 font-mono flex gap-2">
                                                <span className="text-fuchsia-500 shrink-0">→</span> {obs}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-[11px] text-emerald-400/80 font-mono italic border-t border-fuchsia-500/10 pt-2">{entry.refinementPlan}</p>
                                </div>
                            ))}
                            {improvements.length === 0 && (
                                <div className="text-center text-slate-600 text-xs font-mono py-8">No improvement cycles run yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Scaffold Page Tab ── */}
                {activeTab === 'scaffold' && (
                    <div className="space-y-3">
                        <input value={scaffoldName} onChange={e => setScaffoldName(e.target.value)}
                            placeholder="page-slug (e.g. analytics-v2)"
                            className="w-full bg-slate-900/60 border border-violet-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-mono focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600" />
                        <input value={scaffoldTitle} onChange={e => setScaffoldTitle(e.target.value)}
                            placeholder="Page title (e.g. Advanced Analytics)"
                            className="w-full bg-slate-900/60 border border-violet-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-mono focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600" />
                        <textarea value={scaffoldDesc} onChange={e => setScaffoldDesc(e.target.value)}
                            placeholder="Description — what should this page do? (LLM uses this)"
                            rows={3}
                            className="w-full bg-slate-900/60 border border-violet-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600" />
                        <button onClick={triggerScaffold} disabled={scaffolding || !scaffoldName || !scaffoldTitle}
                            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-mono text-sm uppercase tracking-widest bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-all disabled:opacity-40">
                            {scaffolding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {scaffolding ? 'Scaffolding with LLM...' : 'Generate Page Autonomously'}
                        </button>
                        <AnimatePresence>
                            {scaffoldResult && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[12px] font-mono text-emerald-300">
                                    {scaffoldResult}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
