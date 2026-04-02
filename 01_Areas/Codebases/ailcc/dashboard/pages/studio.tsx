import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import StudioModeSelector, { STUDIO_MODES, StudioMode } from '../components/StudioModeSelector';
import StudioOutputCanvas from '../components/StudioOutputCanvas';
import IdeaStack from '../components/IdeaStack';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

const PROACTIVE_SUGGESTIONS: Record<StudioMode, string[]> = {
    document: [
        'Technical spec for the Neural Error Relay system',
        'SOC-2 security policy document using current dashboard data',
        'API documentation for the Mode6Orchestrator endpoints',
    ],
    image_prompt: [
        'Dashboard screenshot rendered in a cyberpunk galaxy aesthetic',
        'Abstract visualization of AI agent swarm collaboration',
        'Dark futuristic command center with holographic data overlays',
    ],
    research: [
        'State of AI agent memory systems and vector DBs in 2025',
        'Best practices for multi-agent orchestration architecture',
        'Emerging patterns in autonomous self-healing software systems',
    ],
    plan: [
        'Migrating the dashboard queue system to BullMQ v5',
        'Scaling the swarm to handle 50+ concurrent agents',
        'Implementing end-to-end encryption across all API routes',
    ],
    automate: [
        'Auto-relay critical errors to Grok and post fix suggestions to Slack',
        'Sync agent cost metrics to a daily Notion report every morning',
        'Trigger OpenClaw audit when system health drops below 80%',
    ],
    connect: [
        'Notion, GitHub, Slack, Stripe, OpenClaw, XAI API',
        'Linear, Vercel, Supabase, xAI, AWS CloudWatch',
        'Next.js dashboard, Redis, BullMQ, OpenAI, Discord webhook',
    ],
};

export default function StudioPage() {
    const [activeMode, setActiveMode] = useState<StudioMode>('research');
    const [input, setInput] = useState('');
    const [context, setContext] = useState('');
    const [showContext, setShowContext] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<{ mode: StudioMode; content: string; agentUsed?: string; timestamp?: string } | null>(null);

    const modeConfig = STUDIO_MODES.find(m => m.id === activeMode)!;
    const suggestions = PROACTIVE_SUGGESTIONS[activeMode];

    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isLoading) return;
        setIsLoading(true);
        setOutput(null);
        try {
            const res = await fetch('/api/studio/grok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: activeMode, input: input.trim(), context: context.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setOutput({ mode: activeMode, content: data.output, agentUsed: data.agentUsed, timestamp: data.timestamp });
            } else {
                setOutput({ mode: activeMode, content: `⚠️ Studio Error: ${data.error}`, timestamp: new Date().toISOString() });
            }
        } catch (err) {
            setOutput({ mode: activeMode, content: '⚠️ Network Error: Could not reach Grok Studio API.', timestamp: new Date().toISOString() });
        } finally {
            setIsLoading(false);
        }
    }, [activeMode, input, context, isLoading]);

    const handleModeChange = (mode: StudioMode) => {
        setActiveMode(mode);
        setInput('');
        setContext('');
        setOutput(null);
    };

    return (
        <NexusLayout>
            <Head>
                <title>Grok AI Studio | AILCC</title>
            </Head>

            <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">

                {/* Studio Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-gradient-to-r from-slate-950 to-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white">GROK AI STUDIO</h1>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">
                                Intelligence Workspace · Grok-2 · Mode 6 Orchestrator
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">Grok-2 Online</span>
                    </div>
                </div>

                {/* Studio Body */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* Left Rail - Mode Selector */}
                    <div className="w-64 flex-none border-r border-white/10 bg-slate-950/40 overflow-y-auto py-4">
                        <div className="px-4 mb-4">
                            <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Studio Modes</h3>
                        </div>
                        <StudioModeSelector activeMode={activeMode} onSelect={handleModeChange} />
                    </div>

                    {/* Center - Input & Output */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Input Zone */}
                        <div className={`border-b border-white/10 bg-gradient-to-r ${modeConfig.gradient} bg-black/30 p-6 space-y-4`}>
                            {/* Mode Title */}
                            <div className="flex items-center gap-3">
                                <modeConfig.icon className={`w-5 h-5 ${modeConfig.color}`} />
                                <h2 className={`text-base font-bold ${modeConfig.color}`}>{modeConfig.label} Mode</h2>
                                <span className="text-[10px] font-mono text-slate-400">— {modeConfig.tagline}</span>
                            </div>

                            {/* Main Textarea */}
                            <div className="relative">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                                    placeholder={modeConfig.placeholder}
                                    rows={3}
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 pr-14 text-slate-100 placeholder-slate-600 resize-none focus:ring-2 focus:ring-emerald-500/30 outline-none text-sm leading-relaxed transition-all"
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all ${isLoading || !input.trim()
                                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                                        }`}
                                    title="Submit (Cmd+Enter)"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Context Toggle */}
                            {modeConfig.contextLabel && (
                                <div>
                                    <button
                                        onClick={() => setShowContext(v => !v)}
                                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors font-mono"
                                    >
                                        {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        {modeConfig.contextLabel} (optional)
                                    </button>
                                    <AnimatePresence>
                                        {showContext && (
                                            <motion.textarea
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                value={context}
                                                onChange={e => setContext(e.target.value)}
                                                placeholder={`Add ${modeConfig.contextLabel?.toLowerCase()}...`}
                                                rows={2}
                                                className="mt-3 w-full bg-slate-900/40 border border-white/5 rounded-xl p-3 text-slate-300 placeholder-slate-600 resize-none focus:ring-1 focus:ring-white/10 outline-none text-xs leading-relaxed transition-all"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Proactive Suggestions */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <Lightbulb className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Try:</span>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(s)}
                                        className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all font-mono truncate max-w-[280px]"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Output Canvas */}
                        <StudioOutputCanvas
                            output={output}
                            isLoading={isLoading}
                            onRegenerate={output ? handleSubmit : undefined}
                        />

                        {/* Concept Idea Stacks */}
                        <div className="border-t border-white/5 bg-slate-900/20 py-8">
                            <div className="px-8 mb-6 text-center">
                                <h2 className="text-xl font-bold text-white tracking-widest uppercase italic">The Vault Stacks</h2>
                                <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-[0.4em]">Visualizing System Interoperability & Concept Clusters</p>
                            </div>
                            <IdeaStack />
                        </div>
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}
