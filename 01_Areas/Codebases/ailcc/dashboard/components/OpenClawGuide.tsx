import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

interface PageContext {
    greeting: string;
    tips: { title: string; content: string }[];
    proactiveTrigger?: string;
}

const PAGE_CONTEXT_MAP: Record<string, PageContext> = {
    '/': {
        greeting: 'Welcome to The Nexus',
        tips: [
            { title: 'Executive Overview', content: 'The Nexus displays your unified priority queue, top 3 moves, and live Neural Stream. Toggle between TECH and LIFE domains.' },
            { title: 'Next Three Moves', content: 'These are your highest-priority actions across the Vanguard Swarm. Click any card to expand its strategic rationale.' },
            { title: 'Manual Sync', content: 'Hit the signal icon near the task queue to force a data refresh from Linear, Airtable, and the Intelligence Vault.' },
        ]
    },
    '/central-command': {
        greeting: 'Central Command Online',
        tips: [
            { title: 'Swarm Orchestration', content: 'Review and approve multi-agent task chains. Each step requires human approval before the next agent fires.' },
            { title: 'Auto-Delegation', content: 'Tasks with autoRoute enabled are automatically assigned to the best agent based on routing rules in alliance_config.json.' },
            { title: 'Performance Boost', content: 'Use the boost button to trigger parallel agent execution when you need maximum throughput.' },
        ]
    },
    '/observability': {
        greeting: 'System Observability Active',
        tips: [
            { title: 'Health Dashboard', content: 'Monitor CPU, RAM, swap, and process health in real-time. The sparklines show 60-second trends.' },
            { title: 'Log Analysis', content: 'Color-coded logs: 🔵 Info, 🟡 Warn, 🔴 Error. Click any log entry to relay it to the Neural Stream for agent attention.' },
            { title: 'OpenClaw Skills', content: 'View my skill inventory here — total capabilities, eligible vs blocked, and missing requirements.' },
        ]
    },
    '/studio': {
        greeting: 'Grok Studio Ready',
        tips: [
            { title: 'Creative Deep Work', content: 'Use the Studio for long-form generation, document drafting, and complex reasoning tasks that benefit from context.' },
            { title: 'Output Modes', content: 'Switch between Markdown, Code, and Canvas modes for different output formats.' },
            { title: 'Session Memory', content: 'Your conversation history persists within the session. Use "New Thread" to start fresh.' },
        ]
    },
    '/comet': {
        greeting: 'Comet Research Station',
        tips: [
            { title: 'Web Research', content: 'Comet is your Sensory Cortex — it navigates, extracts, and synthesizes web content into the Intelligence Vault.' },
            { title: 'Chrome Side-Cart', content: 'Dispatch research tasks via the Side-Cart relay. Results are auto-saved to the Vault and broadcast to the Neural Stream.' },
            { title: 'Input Formats', content: 'Paste URLs, keywords, or full research briefs. Comet adapts its extraction strategy accordingly.' },
        ]
    },
    '/interoperability': {
        greeting: 'Device Mesh Status',
        tips: [
            { title: 'Clipboard Sync', content: 'Your MacBook, iPhone, and iPad share a persistent clipboard through the Interop layer.' },
            { title: 'Hardware Audit', content: 'The audit panel shows real-time connectivity status for all devices in your Apple ecosystem.' },
            { title: 'Connectivity Health', content: 'Green = active, Yellow = intermittent, Red = offline. Check network settings if any device shows red.' },
        ]
    },
    '/memory': {
        greeting: 'Hippocampus Memory Core',
        tips: [
            { title: 'Knowledge Graph', content: 'Navigate the connected knowledge nodes from your Intelligence Vault. Each node links to source documents.' },
            { title: 'Vault Search', content: 'Type a query to search across all vault documents. Results are ranked by relevance and recency.' },
            { title: 'Memory Tiers', content: 'Hot = actively referenced, Warm = recent, Cold = archived. The system auto-promotes frequently accessed knowledge.' },
        ]
    },
    '/scholar': {
        greeting: 'Scholar Mode Active',
        tips: [
            { title: 'Study Environment', content: 'Scholar Mode creates a distraction-free study zone with Pomodoro timers and focus blocks.' },
            { title: 'Intelligence Sync', content: 'All study notes are automatically synced to the Intelligence Vault for cross-agent access.' },
            { title: 'Research Dispatch', content: 'Highlight any concept to dispatch a research task to Comet for immediate deep-dive.' },
        ]
    },
    '/browser-agent': {
        greeting: 'Browser Automation Control',
        tips: [
            { title: 'Self-Healing', content: 'The browser agent retries up to 5 times with exponential backoff if the connection drops.' },
            { title: 'Health Check', content: 'The /health endpoint shows uptime, connection state, and idle watchdog status in real-time.' },
            { title: 'Action Commands', content: 'Navigate, click, type, extract, scroll — all actions are logged and broadcast to the Neural Stream.' },
        ]
    },
    '/settings': {
        greeting: 'System Configuration',
        tips: [
            { title: 'API Keys', content: 'Configure your Linear, Airtable, and OpenAI keys here. They are stored securely in .env.local.' },
            { title: 'Agent Routing', content: 'Edit alliance_config.json to customize which agent handles which task category.' },
            { title: 'Theme & Display', content: 'Night mode is default. Adjust density, animation speed, and sidebar behavior here.' },
        ]
    },
    '/board': {
        greeting: 'Project Board',
        tips: [
            { title: 'Kanban View', content: 'Drag tasks between columns to update their status. Changes sync to the relay in real-time.' },
        ]
    },
    '/queues': {
        greeting: 'Task Queues',
        tips: [
            { title: 'Queue Management', content: 'View and prioritize all queued tasks across agents. Drag to reorder, click to assign.' },
        ]
    },
};

const FALLBACK_CONTEXT: PageContext = {
    greeting: 'OpenClaw Standing By',
    tips: [
        { title: 'Navigation', content: 'Use the sidebar or press ⌘K to quickly jump to any page in The Nexus.' },
    ]
};

interface OpenClawGuideProps {
    currentPage?: string;
}

export const OpenClawGuide: React.FC<OpenClawGuideProps> = ({ currentPage = '/' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isThinking, setIsThinking] = useState(false);
    const [proactiveAlert, setProactiveAlert] = useState<string | null>(null);

    const context = PAGE_CONTEXT_MAP[currentPage] || FALLBACK_CONTEXT;
    const steps = context.tips;

    // Reset step when page changes
    useEffect(() => {
        setCurrentStep(0);
        // Quick pulse when navigating to a new page
        setIsThinking(true);
        const t = setTimeout(() => setIsThinking(false), 1500);
        return () => clearTimeout(t);
    }, [currentPage]);

    // Initial entrance
    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Proactive thinking cycle
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                setIsThinking(true);
                setTimeout(() => setIsThinking(false), 2000);
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Proactive health check
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('http://localhost:5005/api/system/health');
                if (!res.ok) {
                    setProactiveAlert('⚠️ Relay health check returned non-OK status');
                }
            } catch {
                setProactiveAlert('Neural Uplink may be offline. Check relay server.');
            }
        };
        const interval = setInterval(checkHealth, 30000);
        checkHealth();
        return () => clearInterval(interval);
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsOpen(false);
            setIsMinimized(true);
        }
    }, [currentStep, steps.length]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    }, [currentStep]);

    return (
        <div className={`fixed bottom-8 z-[100] flex flex-col gap-4 pointer-events-none transition-all duration-500 ${isOpen ? 'right-8 items-end' : 'right-4 items-end'}`}>
            {/* Proactive Alert Bubble */}
            <AnimatePresence>
                {proactiveAlert && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="pointer-events-auto bg-amber-500/90 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 max-w-[280px] shadow-2xl cursor-pointer"
                        onClick={() => { setProactiveAlert(null); setIsOpen(true); }}
                    >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{proactiveAlert}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mascot Avatar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{
                    opacity: isOpen ? 1 : 0.4,
                    scale: 1,
                    y: 0,
                    rotate: isThinking ? [0, 5, -5, 0] : 0
                }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    rotate: { repeat: Infinity, duration: 1, ease: "easeInOut" }
                }}
                onClick={() => {
                    setIsOpen(true);
                    setIsMinimized(false);
                }}
                className="pointer-events-auto cursor-pointer relative group flex justify-end"
            >
                {/* Breathing Glow */}
                {isOpen && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl -z-10"
                    />
                )}

                <div className={`
                    overflow-hidden border-2 transition-all duration-500
                    ${isOpen ? 'w-20 h-20 rounded-2xl border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'w-10 h-10 rounded-full border-white/10 hover:border-cyan-500/50 shadow-md bg-slate-900/60 backdrop-blur-md'}
                `}>
                    <img
                        src="/assets/openclaw_mascot.png"
                        alt="OpenClaw Mascot"
                        className={`w-full h-full object-cover transition-transform duration-500 ${isThinking ? 'scale-110' : 'group-hover:scale-110'}`}
                    />
                </div>

                {/* Thinking Indicator */}
                {isThinking && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-10 right-0 bg-cyan-500/90 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
                    >
                        Analyzing...
                    </motion.div>
                )}
            </motion.div>

            {/* Guide Dialog */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                        className="pointer-events-auto w-80 renaissance-panel bg-slate-900/95 border border-cyan-500/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <span className="text-xs font-bold text-slate-100 uppercase tracking-widest">OpenClaw</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                                    {currentPage === '/' ? 'HUB' : currentPage.slice(1).toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); setIsMinimized(true); }}
                                aria-label="Close guide"
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Greeting */}
                        <div className="px-6 pt-4 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{context.greeting}</span>
                            </div>
                        </div>

                        {/* Tip Content */}
                        <div className="px-6 pb-4">
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                {steps[currentStep]?.title}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed min-h-[60px]">
                                {steps[currentStep]?.content}
                            </p>
                        </div>

                        {/* Footer / Controls */}
                        <div className="p-4 bg-slate-950/50 flex items-center justify-between">
                            <div className="flex gap-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-cyan-500 w-4' : 'bg-slate-700'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handleBack}
                                        aria-label="Previous step"
                                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                >
                                    {currentStep === steps.length - 1 ? 'Got It' : 'Next'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Visual Accent */}
                        <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-shimmer" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OpenClawGuide;
