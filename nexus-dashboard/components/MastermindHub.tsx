import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VanguardPanel } from './VanguardPanel';
import dynamic from 'next/dynamic';
const BiometricConsent = dynamic(() => import('./widgets/BiometricConsent').then(mod => mod.BiometricConsent), { ssr: false });
import { OmniTracker } from './widgets/OmniTracker';
import { BioPulseWidget } from './widgets/BioPulseWidget';
import { TycoonYieldTracker } from './widgets/TycoonYieldTracker';
import { useAgentHeartbeat } from './hooks/useAgentHeartbeat';
import NeuralBriefing from './NeuralBriefing';
import { NeuralSynapseStream } from './NeuralSynapseStream';
import { AilccGraph } from './AilccGraph';
import { ParaNexusView } from './widgets/ParaNexusView';
import { SingularityReviewPanel } from './widgets/SingularityReviewPanel';

import {
    Activity,
    Cpu,
    Layers,
    Terminal,
    Clock,
    Zap,
    Shield,
    MessageSquare,
    ArrowRightLeft,
    Bot,
    Monitor,
    Ghost
} from 'lucide-react';
import { UnifiedTask, AgentRosterItem } from '@alliance-types/alliance';
import { useAllianceData } from '../hooks/useAllianceData';
import { useStealthMode } from './StealthModeProvider';
import { useToast } from './Toast';


// Mock data based on the Unified Schema
const MOCK_AGENTS: AgentRosterItem[] = [
    { name: 'COMET', role: 'Sensory Cortex (Research)', status: 'online', lastSeen: 'Live', metrics: { tasksCompleted: 142, successRate: 0.98, latency: 45 } },
    { name: 'ANTIGRAVITY', role: 'Motor Cortex (Execution)', status: 'online', lastSeen: 'Live', metrics: { tasksCompleted: 215, successRate: 0.95, latency: 12 } },
    { name: 'GROK', role: 'Prefrontal Cortex (Strategy)', status: 'idle', lastSeen: '2m ago', metrics: { tasksCompleted: 45, successRate: 1.0, latency: 120 } },
    { name: 'GROK_ARCH', role: 'Broca Area (Comms)', status: 'online', lastSeen: 'Live', metrics: { tasksCompleted: 88, successRate: 0.99, latency: 85 } },
];

const MOCK_TASKS: UnifiedTask[] = [
    {
        id: 'T-101',
        source: 'DASHBOARD',
        assignedTo: 'COMET',
        priority: 'CRITICAL',
        category: 'RESEARCH',
        track: 'TECH',
        directive: 'GENS 2101: Synthesize Vision Final Document',
        narrative: 'COMET is refining the Vision Final docx.',
        why: 'Finalizing Project Part 1 requires a polished Vision statement.',
        status: 'IN_PROGRESS',
        successCriteria: ['Format DOCX to MTA standards', 'Implement peer review feedback'],
        context: { vaultPath: '/01_Scholar/GENS2101' },
        telemetry: { progress: 65, lastEvent: 'Applying formatting rules...' }
    },
    {
        id: 'T-102',
        source: 'LINEAR',
        assignedTo: 'ANTIGRAVITY',
        priority: 'HIGH',
        category: 'DEVELOPMENT',
        track: 'TECH',
        directive: 'GENS 2101: Draft Project Part 1 Core',
        narrative: 'ANTIGRAVITY is structuring the GENS 2101 project.',
        why: 'Core component for midterm grade.',
        status: 'QUEUED',
        successCriteria: ['Outline main arguments', 'Draft 1500 words'],
        context: { repo: 'AILCC_PRIME' },
        telemetry: { progress: 0, lastEvent: 'Awaiting completion of Vision doc...' }
    },
    {
        id: 'L-201',
        source: 'SYSTEM',
        assignedTo: 'VALENTINE',
        priority: 'MEDIUM',
        category: 'OPERATIONS',
        track: 'LIFE',
        directive: 'HLTH 1011: Transcribe Focus Group Audio',
        narrative: 'VALENTINE is transcribing the HLTH focus group.',
        why: 'Required textual data for the final Focus Group report.',
        status: 'IN_PROGRESS',
        successCriteria: ['Process 45min audio file', 'Identify speaker tags'],
        context: { url: 'https://docs.google.com' },
        telemetry: { progress: 40, lastEvent: 'Transcribing minute 18...' }
    },
    {
        id: 'L-202',
        source: 'DASHBOARD',
        assignedTo: 'GROK_ARCH',
        priority: 'HIGH',
        category: 'STRATEGY',
        track: 'LIFE',
        directive: 'HLTH 1011: Draft Focus Group Report FINAL',
        narrative: 'GROK is architecting the Focus Group synthesis.',
        why: 'Primary deliverable for HLTH 1011 module.',
        status: 'REVIEW',
        successCriteria: ['Synthesize 3 core themes', 'Format Markdown report'],
        context: { vaultPath: '/01_Scholar/HLTH1011' },
        telemetry: { progress: 95, lastEvent: 'Validating final theme headers' }
    }
];

export default function MastermindHub() {
    const { tasks: liveTasks, agents: liveAgents, logs: liveLogs, synapses, stats, syncData } = useAllianceData();
    const [activeTrack, setActiveTrack] = useState<'TECH' | 'LIFE' | 'ALL'>('ALL');
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const { isStealthMode, setIsStealthMode } = useStealthMode();
    const { showToast } = useToast();
    const [consentOpen, setConsentOpen] = useState(false);
    const heartbeats = useAgentHeartbeat(30000);

    const [pendingAction, setPendingAction] = useState<{ name: string; agent: string } | null>(null);

    // Merge live data with fallback/mock if needed, or just use live
    const tasks = liveTasks.length > 0 ? liveTasks : MOCK_TASKS;
    const agents = liveAgents.length > 0 ? liveAgents : MOCK_AGENTS;
    const logs = liveLogs.length > 0 ? liveLogs : [];
    const derivedStats = stats || { vanguard: [], thermal: 35, uptime: '24/7', status: 'OPTIMAL' };

    const dispatchVanguardTask = (agentName: string) => {
        setPendingAction({ name: `Sovereign Research: ${agentName}`, agent: agentName });
        setConsentOpen(true);
    };

    const confirmDispatch = () => {
        if (!pendingAction) return;
        const task = {
            id: 'SOVEREIGN-' + Date.now().toString().slice(-4),
            directive: pendingAction.name,
            timestamp: new Date().toISOString()
        };

        const socket = (window as any).io_socket;
        if (socket) {
            socket.emit('DISPATCH_VANGUARD_TASK', task);
        }
        setPendingAction(null);
    };

    const [masterView, setMasterView] = useState<'LEGACY' | 'PARA' | 'SINGULARITY'>('PARA');

    return (
        <div className={`flex flex-col relative min-h-full ${isStealthMode ? 'stealth-mode bg-black' : 'bg-slate-950 font-sans'}`}>
            
            {/* ZONE 1: PRIMARY KPIs (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 lg:px-6 border-b border-white/5 bg-slate-900/40 shrink-0">
                {/* Metric 1: System Status */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Core Status</span>
                        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-black text-white">OPTIMAL</div>
                    <div className="flex gap-2 mt-2">
                       {stats.vanguard.map((node: any) => (
                           <div key={node.node} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title={node.node.toUpperCase()} />
                       ))}
                    </div>
                </div>

                {/* Metric 2: Thermal Workload */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Thermal Load</span>
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <div className="text-xl font-black text-amber-400">{derivedStats.thermal || 35}°C</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">NOMINAL RANGE</div>
                </div>

                {/* Metric 3: Active Swarm Nodes */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Active Nodes</span>
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <div className="text-xl font-black text-white">{agents.filter(a => a.status === 'online').length}</div>
                        <div className="text-sm font-bold text-slate-500">/ {agents.length}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">SWARM ENGAGED</div>
                </div>

                {/* Metric 4: Stealth / Time */}
                <div className="bg-slate-800/80 rounded-xl p-4 border border-white/5 flex flex-col justify-between items-end">
                    <div className="flex items-center gap-2 mb-2 w-full justify-between">
                        <button
                            onClick={() => setIsStealthMode(!isStealthMode)}
                            className={`px-3 py-1 flex items-center gap-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${isStealthMode
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                                : 'bg-black/40 text-slate-500 border-white/10 hover:text-white'
                                }`}
                        >
                            <Ghost className="w-3 h-3" />
                            Stealth
                        </button>
                    </div>
                    <div className="text-xl font-black text-slate-300 font-mono tracking-tighter">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 lg:px-6 space-y-6 overflow-y-auto w-full max-w-full">
                
                {/* ZONE 2: WORKLIST & STREAMS (Middle) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                    
                    {/* Left/Center: Task Queue (F-Pattern Priority) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <OmniTracker />
                        
                        <div className="bg-slate-900/60 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col flex-1 min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-400" />
                                        Unified Task Queue
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex bg-slate-800/80 rounded-lg p-1 border border-white/5">
                                        <button 
                                            onClick={() => setMasterView('PARA')}
                                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${masterView === 'PARA' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            PARA NEXUS
                                        </button>
                                        <button 
                                            onClick={() => setMasterView('SINGULARITY')}
                                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${masterView === 'SINGULARITY' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            SINGULARITY
                                        </button>
                                        <button 
                                            onClick={() => setMasterView('LEGACY')}
                                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${masterView === 'LEGACY' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            QUEUE
                                        </button>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-black/40 rounded-lg">
                                        <button
                                            onClick={() => syncData()}
                                            title="Synchronize UI"
                                            aria-label="Synchronize UI"
                                            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                                        >
                                            <span className="sr-only">Synchronize UI</span>
                                            <Activity className="w-3.5 h-3.5" />
                                        </button>
                                        {(['ALL', 'TECH', 'LIFE'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setActiveTrack(t)}
                                                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTrack === t
                                                    ? 'bg-slate-700 text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {masterView === 'SINGULARITY' ? (
                                <SingularityReviewPanel />
                            ) : masterView === 'PARA' ? (
                                <ParaNexusView tasks={tasks} />
                            ) : (
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                {tasks
                                    .filter(t => activeTrack === 'ALL' || t.track === activeTrack)
                                    .filter(t => ['CRITICAL', 'HIGH'].includes(t.priority) || activeTrack === 'LIFE')
                                    .map((task, index) => {
                                        const isExpanded = expandedTaskId === task.id;
                                        return (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`bg-slate-800/80 rounded-xl border transition-all ${isExpanded ? 'border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                                            >
                                                {/* Header Row: Standardized Micro-grid */}
                                                <div
                                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                                                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                                >
                                                    <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                                                        <span className="text-xs font-semibold text-white truncate">{task.directive}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${task.status === 'UPCOMING' ? 'bg-cyan-500/20 text-cyan-400' :
                                                            task.status === 'AWAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-white/10 text-white/40'
                                                            }`}>
                                                            {task.status || 'ACTIVE'}
                                                        </span>
                                                        <span className="px-2 py-1 rounded bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                            {task.assignedTo}
                                                        </span>
                                                        {task.telemetry?.progress !== undefined && (
                                                            <span className="px-2 py-1 rounded bg-black/40 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                                                {task.telemetry.progress}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded State */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-4 pb-4"
                                                        >
                                                            <div className="pt-3 border-t border-white/5 space-y-3">
                                                                <p className="text-xs text-slate-400">{task.why}</p>
                                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 flex justify-between items-center text-xs">
                                                                    <span className="text-slate-500">Latest Event: <span className="text-slate-300 ml-1">{task.telemetry?.lastEvent || 'Processing...'}</span></span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${task.telemetry?.progress || 0}%` }}
                                                                        className="h-full bg-indigo-500"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                })}
                            </div>
                            )}
                        </div>
                    </div>

                    {/* Right Rail: Swarm Roster */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-slate-900/60 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col">
                           <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-cyan-400" />
                                    Vanguard Swarm
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {agents.map((agent) => (
                                    <div key={agent.name} className="glass-card p-4 flex flex-col gap-3 relative group/agent transition-all duration-500 hover:scale-[1.02]">
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white tracking-tight">{agent.name}</span>
                                                {agent.status === 'online' && (
                                                    <div className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {agent.name === 'COMET' && (
                                                    <button
                                                        onClick={() => dispatchVanguardTask(agent.name)}
                                                        className="p-1.5 hover:bg-cyan-500/20 rounded-lg text-cyan-500 transition-all active:scale-90"
                                                        title="Dispatch Vanguard Task"
                                                    >
                                                        <span className="sr-only">Dispatch Task</span>
                                                        <Zap className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${agent.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                                    {agent.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 truncate">{agent.role}</p>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <span>Latency: {heartbeats[agent.name]?.alive ? `${heartbeats[agent.name].latencyMs}ms` : '-'}</span>
                                            <span>SR: {(agent.metrics?.successRate || 0) * 100}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bio / Market blocks integrated cleanly */}
                        <BioPulseWidget />
                        <TycoonYieldTracker />
                    </div>
                </div>

                {/* ZONE 3: DETAILS & LOGS (Bottom) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-slate-900/60 rounded-2xl border border-white/5 p-6 flex flex-col min-h-[300px] overflow-hidden">
                        <NeuralBriefing />
                    </div>
                    <div className="lg:col-span-1 bg-slate-900/60 rounded-2xl border border-white/5 p-6 flex flex-col min-h-[300px] overflow-hidden">
                        <NeuralSynapseStream />
                    </div>
                    <div className="lg:col-span-1 bg-slate-900/60 rounded-2xl border border-white/5 p-6 flex flex-col min-h-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-400" />
                                Neural Stream
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] pr-2 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {logs.slice(-20).map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: 5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-slate-400 py-1"
                                    >
                                        <span className={`mr-2 ${log.type === 'agent' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                            [{log.timestamp.split(' ')[1]}]
                                        </span>
                                        {log.msg}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
                {/* Modals & Hidden overlays */}
                <VanguardPanel />
                <BiometricConsent
                    isOpen={consentOpen}
                    onClose={() => setConsentOpen(false)}
                    onApprove={confirmDispatch}
                    actionName={pendingAction?.name || ''}
                    riskLevel="HIGH"
                />

            </div>
        </div>
    );
}
