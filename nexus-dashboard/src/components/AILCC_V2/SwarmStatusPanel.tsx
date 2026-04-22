import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, Clock, AlertTriangle, Play, Pause, RotateCcw, Brain } from 'lucide-react';
import { io } from 'socket.io-client';

export type SwarmStatus = 'PENDING' | 'UPCOMING' | 'PLANNING' | 'EXECUTING' | 'AWAITING_REVIEW' | 'COMPLETED' | 'FAILED';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SwarmStep {
    id: string;
    description: string;
    targetAgent: string;
    status: 'pending' | 'upcoming' | 'executing' | 'completed' | 'failed' | 'awaiting_approval';
    requiresApproval: boolean;
    riskLevel: RiskLevel;
    metrics?: {
        tokensUsed: number;
        cost: number;
        latency: number;
    };
}

export interface SwarmSession {
    id: string;
    goal: string;
    status: SwarmStatus;
    steps: SwarmStep[];
    currentStepId?: string;
    metrics?: {
        totalCost: number;
        dailyBudget: number;
        agentCosts: {
            agent: string;
            cost: number;
            tokens: number;
            percentage: number;
        }[];
        workloads: {
            agent: string;
            activeSteps: number;
            pendingSteps: number;
            completedSteps: number;
            capacity: number;
            latency: number;
            efficiency: number;
            tokensUsed: number;
            tokenLimit: number;
        }[];
    };
    errors?: {
        stepId: string;
        agent: string;
        error: string;
        timestamp: string;
        retryCount: number;
        maxRetries: number;
        details?: string;
    }[];
}

interface SwarmStatusPanelProps {
    session: SwarmSession | null;
    // eslint-disable-next-line no-unused-vars
    onApprove?: (stepId: string, comment?: string) => void;
    // eslint-disable-next-line no-unused-vars
    onReject?: (stepId: string, comment?: string) => void;
    onPause?: () => void;
    onResume?: () => void;
}

const statusColors: Record<SwarmStatus, string> = {
    PENDING: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    UPCOMING: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    PLANNING: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    EXECUTING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    AWAITING_REVIEW: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    COMPLETED: 'text-green-400 bg-green-500/10 border-green-500/20',
    FAILED: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const stepStatusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3 h-3 text-gray-400" />,
    upcoming: <Clock className="w-3 h-3 text-cyan-400/50 animate-pulse" />,
    UPCOMING: <Clock className="w-3 h-3 text-cyan-400/50 animate-pulse" />,
    executing: <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RotateCcw className="w-3 h-3 text-blue-400" /></motion.div>,
    EXECUTING: <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RotateCcw className="w-3 h-3 text-blue-400" /></motion.div>,
    completed: <CheckCircle2 className="w-3 h-3 text-green-400" />,
    COMPLETED: <CheckCircle2 className="w-3 h-3 text-green-400" />,
    failed: <AlertTriangle className="w-3 h-3 text-red-400" />,
    FAILED: <AlertTriangle className="w-3 h-3 text-red-400" />,
    awaiting_approval: <AlertTriangle className="w-3 h-3 text-amber-500 animate-bounce" />,
    AWAITING_APPROVAL: <AlertTriangle className="w-3 h-3 text-amber-500 animate-bounce" />,
};

const agentColors: Record<string, string> = {
    grok: 'bg-orange-500/20 text-orange-300',
    alchemist: 'bg-purple-500/20 text-purple-300',
    comet: 'bg-cyan-500/20 text-cyan-300',
    openai: 'bg-green-500/20 text-green-300',
    human: 'bg-pink-500/20 text-pink-300',
};

const SwarmStatusPanel: React.FC<SwarmStatusPanelProps> = ({
    session,
    onApprove,
    onReject,
    onPause,
    onResume,
}) => {
    const [comments, setComments] = React.useState<Record<string, string>>({});
    const [pulses, setPulses] = React.useState<any[]>([]);
    const [autoApproveTimers, setAutoApproveTimers] = React.useState<Record<string, number>>({});

    // WebSocket listener for live swarm events
    React.useEffect(() => {
        const socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] });

        socket.on('SWARM_EVENT', (data) => {
            console.log('⚡ Swarm Handoff:', data.source);
        });
        
        socket.on('MEMORY_PULSE', (data) => {
            console.log('🧠 Neural Pulse Received:', data.query);
            setPulses(prev => [data, ...prev].slice(0, 5));
        });

        return () => { socket.disconnect(); };
    }, [session]);

    if (!session) {
        return (
            <div className="p-6 sovereign-glass">
                <div className="flex items-center gap-3 text-white/40">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-tight">No active swarm session</span>
                </div>
            </div>
        );
    }

    const completedSteps = session.steps.filter(s => s.status === 'completed').length;
    const progress = session.steps.length > 0 ? (completedSteps / session.steps.length) * 100 : 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 p-6 sovereign-glass"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/20">
                        <Users className="w-5 h-5 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight text-white/90">Swarm Orchestrator</h2>
                        <span className="text-xs text-white/40 font-mono">{session.id.slice(0, 8)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[session.status]}`}
                        animate={{ opacity: session.status === 'EXECUTING' ? [1, 0.6, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        {session.status.replace('_', ' ')}
                    </motion.span>
                </div>
            </div>

            {/* Goal */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest block mb-1">Mission Goal</span>
                <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{session.goal}</p>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">Progress</span>
                    <span className="text-xs font-mono text-white/60">{completedSteps}/{session.steps.length} steps</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Active Agents Workload */}
            {session.metrics?.workloads && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {session.metrics.workloads.map(w => (
                        <div key={w.agent} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    className={`w-2 h-2 rounded-full ${w.activeSteps > 0 ? 'bg-cyan-400' : 'bg-slate-600'}`}
                                    animate={w.activeSteps > 0 ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{w.agent}</span>
                            </div>
                            <div className="text-[9px] font-mono text-white/50 group-hover:text-cyan-400 transition-colors">
                                {w.activeSteps > 0 ? `${w.activeSteps} ACT` : 'IDLE'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Neural Memory Pulses */}
            <AnimatePresence>
                {pulses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-col gap-2 p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
                    >
                        <div className="flex items-center gap-2">
                            <Brain className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-400 uppercase">Neural Pulse</span>
                        </div>
                        {pulses.map((pulse, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                {pulse.vault_knowledge?.map((v: any, j: number) => (
                                    <div key={j} className="text-[9px] text-white/60 border-l border-cyan-500/30 pl-2">
                                        <span className="font-bold text-cyan-300/80">{v.source}:</span> {v.content.substring(0, 60)}...
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step List */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                    {session.steps.map((step, idx) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${step.id === session.currentStepId
                                ? 'bg-blue-500/10 border-blue-500/20'
                                : 'bg-white/5 border-white/5'
                                }`}
                        >
                            <div className="flex-shrink-0">
                                {stepStatusIcons[step.status]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/80 truncate">{step.description}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${agentColors[step.targetAgent] || 'bg-white/10 text-white/60'}`}>
                                {step.targetAgent}
                            </span>
                            {/* Risk Level Badge */}
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${step.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                                step.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    step.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {step.riskLevel}
                            </span>

                            {step.status === 'awaiting_approval' && (
                                <div className="flex flex-col gap-2 mt-2 w-full">
                                    {/* Auto-approval countdown for low-risk steps */}
                                    {step.riskLevel === 'low' && autoApproveTimers[step.id] !== undefined && (
                                        <div className="flex items-center justify-between p-1.5 rounded bg-green-500/10 border border-green-500/20">
                                            <span className="text-[9px] text-green-400">Auto-approving in:</span>
                                            <span className="text-sm font-mono font-bold text-green-400">{autoApproveTimers[step.id]}s</span>
                                        </div>
                                    )}
                                    <textarea
                                        value={comments[step.id] || ''}
                                        onChange={(e) => setComments({ ...comments, [step.id]: e.target.value })}
                                        placeholder="Rationale / Context..."
                                        aria-label="Step rationale"
                                        className="w-full mt-1.5 p-1.5 rounded bg-black/40 border border-white/10 text-[10px] text-zinc-300 focus:outline-none focus:border-blue-500/50 min-h-[40px] resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onApprove?.(step.id, comments[step.id])}
                                            className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[10px] font-bold transition-all"
                                        >
                                            <CheckCircle2 className="w-3 h-3" /> Approve
                                        </button>
                                        <button
                                            onClick={() => onReject?.(step.id, comments[step.id])}
                                            className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold transition-all"
                                        >
                                            <AlertTriangle className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mt-2">
                {session.status === 'EXECUTING' ? (
                    <button
                        onClick={onPause}
                        className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-amber-500/20 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                        <Pause className="w-3 h-3" /> Pause
                    </button>
                ) : session.status === 'AWAITING_REVIEW' ? (
                    <button
                        onClick={onResume}
                        className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-green-500/20 border border-green-500/20 text-xs font-bold text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                        <Play className="w-3 h-3" /> Resume
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default SwarmStatusPanel;
