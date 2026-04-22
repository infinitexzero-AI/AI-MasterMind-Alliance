import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    Landmark,
    CheckCircle2,
    Clock,
    BrainCircuit,
    Globe,
    Palette,
    Terminal,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { BiometricConsent } from './BiometricConsent';
import { uiAudio } from '../../lib/audio';

export type OmniDomain = 'ALL' | 'SCHOLAR' | 'TYCOON' | 'SOVEREIGN';

export interface RealWorldTask {
    id: string;
    title: string;
    domain: 'SCHOLAR' | 'TYCOON' | 'SOVEREIGN';
    urgency: 'CRITICAL' | 'HIGH' | 'ROUTINE';
    status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
    requiredAgents: ('Grok' | 'Comet' | 'GrokArch' | 'Gemini' | 'Valentine')[];
    deadline?: string;
    metadata?: any;
    telemetry?: any;
}

interface WealthProposal {
    type: string;
    amount: number;
    suggestion: string;
    reason: string;
    timestamp: string;
}

const DOMAIN_STYLES = {
    SCHOLAR: { icon: GraduationCap, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
    TYCOON: { icon: Landmark, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    SOVEREIGN: { icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' }
};

const AGENT_ICONS: Record<string, React.ReactNode> = {
    'Grok': <span title="Grok (Judge)"><BrainCircuit className="w-3 h-3 text-cyan-400" /></span>,
    'Comet': <span title="Comet (Scout)"><Globe className="w-3 h-3 text-indigo-400" /></span>,
    'GrokArch': <span title="Grok (Architect)"><Terminal className="w-3 h-3 text-purple-400" /></span>,
    'Gemini': <span title="Gemini (Craftsman)"><Terminal className="w-3 h-3 text-emerald-400" /></span>,
    'Valentine': <span title="Valentine (Visionary)"><Palette className="w-3 h-3 text-amber-400" /></span>
};

export const OmniTracker: React.FC = () => {
    const [activeTab, setActiveTab] = useState<OmniDomain>('ALL');
    const [tasks, setTasks] = useState<RealWorldTask[]>([]);
    const [wealthProposal, setWealthProposal] = useState<WealthProposal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [consentOpen, setConsentOpen] = useState(false);
    const [pendingTask, setPendingTask] = useState<RealWorldTask | null>(null);
    const [executing, setExecuting] = useState(false);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/omnitracker');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
            // Check for wealth proposals
            const wealthRes = await fetch('/api/tycoon/proposal');
            if (wealthRes.ok && wealthRes.status !== 204) {
                const wealthData = await wealthRes.json();
                setWealthProposal(wealthData);
            }
        } catch (e) {
            console.error("Failed to fetch OmniTracker tasks:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 60000); // Auto-refresh every minute
        return () => clearInterval(interval);
    }, []);

    const filteredTasks = tasks.filter(
        task => activeTab === 'ALL' || task.domain === activeTab
    );

    const handleAuthorizeClick = (task: RealWorldTask) => {
        setPendingTask(task);
        setConsentOpen(true);
    };

    const handleWealthDeploy = () => {
        setPendingTask({
            id: 'WEALTH-PROPOSAL',
            title: `Deploy $${wealthProposal?.amount} to ${wealthProposal?.suggestion}`,
            domain: 'TYCOON',
            urgency: 'HIGH',
            status: 'PENDING',
            requiredAgents: ['Grok', 'Gemini'],
            metadata: wealthProposal
        });
        setConsentOpen(true);
    };

    const handleConsentApprove = async () => {
        if (pendingTask?.id === 'WEALTH-PROPOSAL') {
            setExecuting(true);
            uiAudio.playBlip();
            try {
                const res = await fetch('/api/tycoon/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pendingTask.metadata)
                });
                if (res.ok) {
                    uiAudio.playSuccess();
                    setWealthProposal(null);
                }
            } catch (e) {
                console.error("Wealth deployment failed:", e);
            } finally {
                setExecuting(false);
                setPendingTask(null);
            }
        } else if (pendingTask) {
            setTasks(prev => prev.map(t =>
                t.id === pendingTask.id ? { ...t, status: 'ACTIVE' } : t
            ));
            setPendingTask(null);
        }
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col h-[500px] relative overflow-hidden">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
                        OmniTracker (Life OS)
                        <button
                            onClick={fetchTasks}
                            className="ml-2 w-4 h-4 text-emerald-400 hover:text-emerald-300 hover:rotate-180 transition-all rounded-full bg-emerald-500/10 flex items-center justify-center cursor-pointer"
                            title="Force System Health Sync"
                        >
                            ⟳
                        </button>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">
                        Real-World Objective Aggregation
                    </p>
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {(['ALL', 'SCHOLAR', 'TYCOON', 'SOVEREIGN'] as const).map(domain => (
                        <button
                            key={domain}
                            onClick={() => setActiveTab(domain)}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${activeTab === domain
                                ? 'bg-white/20 text-white shadow-inner'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>

            {/* Wealth Signal Bar (Conditional) */}
            <AnimatePresence>
                {wealthProposal && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent animate-shimmer" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    Capital Expansion Detected
                                    <span className="text-emerald-400 animate-pulse">●</span>
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">
                                    Safe Surplus: <span className="text-white font-bold">${wealthProposal.amount}</span> → {wealthProposal.suggestion}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleWealthDeploy}
                            disabled={executing}
                            className={`relative z-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${executing ? 'opacity-50 animate-pulse' : 'hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {executing ? 'Executing...' : 'Authorize Deployment'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-pulse">
                        <div className="w-6 h-6 border-2 border-emerald-500/50 border-t-transparent flex items-center justify-center animate-spin rounded-full mb-2" />
                        <p className="text-xs font-mono uppercase">Syncing Daemon State...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map(task => {
                            const Style = DOMAIN_STYLES[task.domain];
                            const Icon = Style.icon;

                            return (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`pl-3 pr-2 py-2.5 bg-slate-900/40 backdrop-blur-sm border-l-4 ${Style.border} border-y border-r border-y-white/5 border-r-white/5 rounded-r-xl hover:bg-slate-800/80 transition-colors group flex items-center justify-between gap-4`}
                                >
                                    {/* Left: Icon, Title, Urgency, Timeline */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative group/id-tooltip cursor-help shrink-0">
                                            <div className={`p-1.5 rounded bg-black/40 border ${Style.border}`}>
                                                <Icon className={`w-3.5 h-3.5 ${Style.color}`} />
                                            </div>
                                            {/* ID Tooltip */}
                                            <div className="absolute top-full left-0 mt-2 p-1.5 bg-slate-900 border border-white/10 rounded-md opacity-0 group-hover/id-tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl whitespace-nowrap">
                                                <span className="text-[9px] font-mono text-slate-400">{task.id}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                                                    {task.title}
                                                </h3>
                                                {task.urgency === 'CRITICAL' && (
                                                    <span className="shrink-0 px-1.5 py-0.5 rounded border border-rose-500/50 bg-rose-500/10 text-rose-400 text-[8px] font-black tracking-widest uppercase">
                                                        Critical
                                                    </span>
                                                )}
                                                {task.urgency === 'HIGH' && (
                                                    <span className="shrink-0 px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/10 text-amber-400 text-[8px] font-black tracking-widest uppercase">
                                                        High
                                                    </span>
                                                )}
                                                {task.status === 'ACTIVE' && (
                                                    <span className="shrink-0 px-1.5 py-0.5 rounded border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-[8px] font-black tracking-widest uppercase animate-pulse">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            {task.deadline && (
                                                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono mt-0.5">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                            {task.telemetry && task.telemetry.progress !== undefined && task.status === 'ACTIVE' && (
                                                <div className="mt-2 w-full min-w-[150px]">
                                                    <div className="flex justify-between text-[8px] font-mono mb-0.5">
                                                        <span className="text-cyan-500/80 truncate pr-2">{task.telemetry.lastEvent || 'Processing...'}</span>
                                                        <span className="text-cyan-400 font-bold">{task.telemetry.progress}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${task.telemetry.progress}%` }}
                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Agents & CTA */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="items-center gap-1 px-1.5 py-1 rounded bg-black/60 border border-white/5 hidden sm:flex">
                                            {task.requiredAgents.map(agent => (
                                                <div key={agent}>{AGENT_ICONS[agent] || <Terminal className="w-3 h-3 text-slate-400" />}</div>
                                            ))}
                                        </div>

                                        {task.status === 'PENDING' && (task.urgency === 'CRITICAL' || task.urgency === 'HIGH') ? (
                                            <button
                                                onClick={() => handleAuthorizeClick(task)}
                                                className={`flex items-center gap-1 text-[9px] font-black tracking-widest uppercase transition-colors px-2 py-1.5 rounded 
                                                ${task.urgency === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30' : 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30'}
                                            `}
                                                title="Authorize Action"
                                            >
                                                <ShieldCheck className="w-3 h-3" />
                                                Auth
                                            </button>
                                        ) : (
                                            <button className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-emerald-400 transition-colors px-2 py-1.5 border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded bg-transparent" title="Mark Complete">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Done
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                {!isLoading && filteredTasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
                        <p className="text-xs font-mono uppercase">All Domains Optimized</p>
                    </div>
                )}
            </div>

            <BiometricConsent
                isOpen={consentOpen}
                onClose={() => {
                    setConsentOpen(false);
                    setPendingTask(null);
                }}
                onApprove={handleConsentApprove}
                actionName={pendingTask?.title || ''}
                riskLevel={pendingTask?.urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH'}
            />
        </div>
    );
};
