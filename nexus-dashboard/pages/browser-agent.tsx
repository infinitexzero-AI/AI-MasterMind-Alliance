import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import BrowserViewport from '../components/BrowserViewport';
import ActionLog, { ActionLogEntry } from '../components/ActionLog';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, StopCircle, Zap, Lightbulb,
    ChevronDown, ChevronUp, TerminalSquare, ChevronRight, Database
} from 'lucide-react';

type AgentStatus = 'IDLE' | 'PLANNING' | 'EXECUTING' | 'COMPLETE' | 'ERROR';

const QUICK_TASKS = [
    'Go to google.com and search for "Playwright browser automation"',
    'Navigate to github.com and take a screenshot of trending repositories',
    'Go to news.ycombinator.com and extract the top 5 headlines',
    'Navigate to the AILCC dashboard at localhost:3000 and screenshot the agents page',
    'Go to perplexity.ai and search for "AI agent orchestration 2025"',
];

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; pulse: boolean }> = {
    IDLE: { label: 'IDLE — Ready', color: 'text-slate-400', pulse: false },
    PLANNING: { label: 'PLANNING — Grok thinking...', color: 'text-amber-400', pulse: true },
    EXECUTING: { label: 'EXECUTING — Browser active', color: 'text-emerald-400', pulse: true },
    COMPLETE: { label: 'COMPLETE', color: 'text-cyan-400', pulse: false },
    ERROR: { label: 'ERROR', color: 'text-rose-400', pulse: false },
};

export default function BrowserAgentPage() {
    const [task, setTask] = useState('');
    const [context, setContext] = useState('');
    const [showContext, setShowContext] = useState(false);
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE');
    const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
    const [actionPlan, setActionPlan] = useState<any[] | null>(null);
    const [history, setHistory] = useState<{ task: string; steps: number; status: string }[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [currentUrl, setCurrentUrl] = useState('about:blank');
    const [extractedItems, setExtractedItems] = useState<{ label: string; text: string }[]>([]);
    const [showExtracted, setShowExtracted] = useState(false);
    const [browserHealth, setBrowserHealth] = useState<{
        status: string; uptime: number; browserConnected: boolean; pageActive: boolean; idleSeconds: number;
    } | null>(null);

    const esRef = useRef<EventSource | null>(null);
    const urlPollRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = agentStatus === 'EXECUTING' || agentStatus === 'PLANNING' || agentStatus === 'COMPLETE';

    // Poll Playwright health
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('http://localhost:3333/health');
                if (res.ok) setBrowserHealth(await res.json());
            } catch { setBrowserHealth(null); }
        };
        fetchHealth();
        const healthInterval = setInterval(fetchHealth, 10000);
        return () => clearInterval(healthInterval);
    }, []);

    // Poll current URL while executing
    useEffect(() => {
        if (agentStatus === 'EXECUTING') {
            urlPollRef.current = setInterval(async () => {
                try {
                    const data = await fetch('/api/browser-agent/status').then(r => r.json());
                    if (data?.url) setCurrentUrl(data.url);
                } catch { /* silent */ }
            }, 2000);
        } else {
            if (urlPollRef.current) clearInterval(urlPollRef.current);
        }
        return () => { if (urlPollRef.current) clearInterval(urlPollRef.current); };
    }, [agentStatus]);

    const openStream = useCallback(() => {
        if (esRef.current) esRef.current.close();
        const es = new EventSource('/api/browser-agent/stream');
        esRef.current = es;

        es.addEventListener('action', (e) => {
            const entry: ActionLogEntry = JSON.parse(e.data);
            setActionLog(prev => {
                // Update existing entry if same action+timestamp already tracked, else append
                const idx = prev.findIndex(p => p.timestamp === entry.timestamp && p.action === entry.action);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = entry;
                    return next;
                }
                return [...prev, entry];
            });
            if (entry.extracted) {
                setExtractedItems(prev => [...prev, { label: entry.action, text: entry.extracted! }]);
                setShowExtracted(true);
            }
        });

        es.addEventListener('status', (e) => {
            const { status } = JSON.parse(e.data);
            if (status === 'COMPLETE') {
                setAgentStatus('COMPLETE');
                es.close();
            } else if (status === 'ERROR') {
                setAgentStatus('ERROR');
                es.close();
            } else if (status === 'IDLE') {
                setAgentStatus('IDLE');
                es.close();
            }
        });

        es.onerror = () => { es.close(); };
    }, []);

    const executeTask = useCallback(async () => {
        if (!task.trim() || agentStatus === 'EXECUTING' || agentStatus === 'PLANNING') return;

        setActionLog([]);
        setActionPlan(null);
        setErrorMsg('');
        setExtractedItems([]);
        setShowExtracted(false);
        setAgentStatus('PLANNING');

        try {
            // Open SSE stream first so we don't miss early events
            openStream();

            const res = await fetch('/api/browser-agent/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: task.trim(), context: context.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Unknown error');
                setAgentStatus('ERROR');
                esRef.current?.close();
                return;
            }

            setActionPlan(data.actionPlan || []);
            setAgentStatus('EXECUTING');
            setHistory(prev => [{ task: task.trim(), steps: data.actionPlan?.length || 0, status: 'EXECUTING' }, ...prev.slice(0, 9)]);

        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'An unknown error occurred');
            setAgentStatus('ERROR');
            esRef.current?.close();
        }
    }, [task, context, agentStatus, openStream]);

    const stopAgent = useCallback(async () => {
        esRef.current?.close();
        try { await fetch('/api/browser-agent/stop', { method: 'POST' }); } catch { /* silent */ }
        setAgentStatus('IDLE');
        setHistory(prev => prev.map((h, i) => i === 0 ? { ...h, status: 'STOPPED' } : h));
    }, []);

    const reset = useCallback(() => {
        stopAgent();
        setActionLog([]);
        setActionPlan(null);
        setErrorMsg('');
        setExtractedItems([]);
        setShowExtracted(false);
    }, [stopAgent]);

    const sc = STATUS_CONFIG[agentStatus];

    return (
        <NexusLayout>
            <Head><title>Browser Agent | AILCC</title></Head>

            <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-gradient-to-r from-slate-950 to-slate-900 flex-none">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white">BROWSER AGENT</h1>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">
                                Autonomous Execution · Grok-2 · Playwright · Real-Time
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-white/10 rounded-full ${sc.color}`}>
                            {sc.pulse && <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                            <span className="text-[10px] font-mono uppercase tracking-wider">{sc.label}</span>
                        </div>
                        {actionPlan && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                                <Zap className="w-2.5 h-2.5 text-violet-400" />
                                <span className="text-[9px] font-mono text-violet-400">{actionPlan.length} steps planned</span>
                            </div>
                        )}
                        {agentStatus !== 'IDLE' && (
                            <button
                                onClick={reset}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-mono text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                                <StopCircle className="w-3 h-3" /> Stop & Reset
                            </button>
                        )}
                        {/* Playwright Health Badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-mono ${browserHealth?.status === 'HEALTHY'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : browserHealth
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-slate-800 border-white/10 text-slate-500'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${browserHealth?.status === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                                }`} />
                            {browserHealth ? (
                                <span>{browserHealth.status} · {Math.floor(browserHealth.uptime / 60)}m up · idle {browserHealth.idleSeconds}s</span>
                            ) : (
                                <span>BROWSER OFFLINE</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main 3-Panel Layout */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* Left Panel */}
                    <div className="w-72 flex-none border-r border-white/10 flex flex-col bg-slate-950/30">

                        {/* Task Input */}
                        <div className="p-4 border-b border-white/10 space-y-3">
                            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <TerminalSquare className="w-3 h-3" /> Natural Language Task
                            </label>
                            <textarea
                                value={task}
                                onChange={e => setTask(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) executeTask(); }}
                                placeholder="Tell the agent what to do..."
                                rows={4}
                                className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-slate-100 placeholder-slate-600 text-xs leading-relaxed resize-none focus:ring-2 focus:ring-cyan-500/30 outline-none"
                            />
                            <button
                                onClick={() => setShowContext(v => !v)}
                                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-400 font-mono transition-colors"
                            >
                                {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                Additional context (optional)
                            </button>
                            <AnimatePresence>
                                {showContext && (
                                    <motion.textarea
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        value={context}
                                        onChange={e => setContext(e.target.value)}
                                        placeholder="Credentials, URLs, constraints..."
                                        rows={2}
                                        className="w-full bg-slate-900/40 border border-white/5 rounded-lg p-2 text-slate-400 placeholder-slate-600 text-[10px] resize-none focus:ring-1 focus:ring-white/10 outline-none"
                                    />
                                )}
                            </AnimatePresence>
                            <button
                                onClick={executeTask}
                                disabled={!task.trim() || agentStatus === 'PLANNING' || agentStatus === 'EXECUTING'}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${!task.trim() || agentStatus === 'PLANNING' || agentStatus === 'EXECUTING'
                                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                                    }`}
                            >
                                <Send className="w-3.5 h-3.5" />
                                {agentStatus === 'PLANNING' ? 'Grok Planning...' : agentStatus === 'EXECUTING' ? 'Executing...' : 'Execute Task'}
                            </button>
                            {errorMsg && (
                                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[9px] font-mono text-rose-400 leading-relaxed">
                                    {errorMsg}
                                </div>
                            )}
                        </div>

                        {/* Quick Tasks */}
                        <div className="p-4 border-b border-white/10 flex-none">
                            <h4 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Quick Tasks
                            </h4>
                            <div className="space-y-1">
                                {QUICK_TASKS.map((qt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTask(qt)}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-start gap-1.5"
                                    >
                                        <ChevronRight className="w-2.5 h-2.5 flex-none mt-0.5 text-slate-700" />
                                        <span className="truncate">{qt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* History */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <h4 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> History
                            </h4>
                            {history.length === 0 ? (
                                <p className="text-[9px] text-slate-700 font-mono">No executions yet</p>
                            ) : (
                                <div className="space-y-1">
                                    {history.map((h, i) => (
                                        <div key={i} className="px-2 py-1.5 rounded-lg bg-white/3 border border-white/5">
                                            <p className="text-[9px] font-mono text-slate-400 truncate">{h.task}</p>
                                            <p className="text-[8px] font-mono text-slate-400 mt-0.5">{h.steps} steps · {h.status}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center — Viewport + Extracted Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                        {/* Browser Viewport */}
                        <div className="flex-1 p-4 min-h-0">
                            <BrowserViewport isActive={isActive} currentUrl={currentUrl} />
                        </div>

                        {/* Extracted Content Drawer */}
                        <AnimatePresence>
                            {showExtracted && extractedItems.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 200, opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex-none border-t border-emerald-500/20 bg-emerald-950/20 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Extracted Content</span>
                                            <span className="text-[8px] font-mono text-emerald-600">{extractedItems.length} item{extractedItems.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <button onClick={() => setShowExtracted(false)} className="text-[9px] text-slate-400 hover:text-slate-400 font-mono">hide</button>
                                    </div>
                                    <div className="h-[calc(100%-2rem)] overflow-y-auto p-3 space-y-2">
                                        {extractedItems.map((item, i) => (
                                            <div key={i} className="rounded-lg bg-black/30 border border-emerald-500/10 p-2">
                                                <p className="text-[8px] font-mono text-emerald-600 uppercase mb-1">{item.label}</p>
                                                <p className="text-[10px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Panel — Action Log */}
                    <div className="w-64 flex-none border-l border-white/10 bg-slate-950/30 flex flex-col">
                        <ActionLog
                            entries={actionLog}
                            planPreview={actionPlan && actionLog.length === 0 ? actionPlan : undefined}
                        />
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}
