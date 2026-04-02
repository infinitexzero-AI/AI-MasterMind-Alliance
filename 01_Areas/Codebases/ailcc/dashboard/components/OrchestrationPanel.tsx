import React from 'react';
import { motion } from 'framer-motion';
import { OrchestrationPanelProps, TaskClassification } from '../types/DashboardInterfaces';
import { Network, ArrowRight, CheckCircle, BrainCircuit, Play, Search, Terminal, Cpu, Plus } from 'lucide-react';

const OrchestrationPanelBase: React.FC<OrchestrationPanelProps> = ({
    currentIntent,
    classification,
    activeStep,

    traceLog,
    onDispatch
}) => {
    const [command, setCommand] = React.useState('');
    const [targetAgent, setTargetAgent] = React.useState('AUTO');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleDispatch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const activeCommand = command.trim() || currentIntent;
        if (!activeCommand || !onDispatch) return;

        const finalPrompt = targetAgent !== 'AUTO' ? `[${targetAgent}] ${activeCommand}` : activeCommand;
        onDispatch(finalPrompt);
        setCommand('');
    };

    const saveAsMacro = async () => {
        const activeCommand = command.trim() || currentIntent;
        if (!activeCommand) return;

        setIsSaving(true);
        try {
            await fetch('/api/macros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: activeCommand.slice(0, 20) + (activeCommand.length > 20 ? '...' : ''),
                    prompt: activeCommand,
                    icon: targetAgent === 'TYPE_A_BROWSER' ? 'book-open' : 'terminal'
                })
            });
            alert('Automation saved to library.');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Determine Type Icon/Color
    const getTypeMeta = (type: TaskClassification) => {
        switch (type) {
            case 'TYPE_A_BROWSER': return { label: 'TYPE A: BROWSER', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', icon: Search };
            case 'TYPE_B_DESKTOP': return { label: 'TYPE B: DESKTOP', color: 'text-fuchsia-400', border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-500/10', icon: Terminal };
            case 'TYPE_C_HYBRID': return { label: 'TYPE C: HYBRID', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', icon: Network };
            case 'TYPE_D_PARALLEL': return { label: 'TYPE D: PARALLEL', color: 'text-violet-400', border: 'border-violet-500/50', bg: 'bg-violet-500/10', icon: Cpu };
            default: return { label: 'UNKNOWN', color: 'text-slate-400', border: 'border-slate-500/50', bg: 'bg-slate-500/10', icon: BrainCircuit };
        }
    };

    const meta = getTypeMeta(classification);
    const TypeIcon = meta.icon;

    // Steps Configuration
    const steps = ['ROUTER', 'DISPATCH', 'EXECUTE', 'VERIFY', 'COMPLETE'];
    const activeStepIndex = steps.indexOf(activeStep);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 h-full flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <BrainCircuit size={120} />
            </div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-violet-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2 mb-1">
                        <Network size={16} />
                        Orchestration Engine
                    </h2>
                    <div className="text-[10px] text-slate-400 font-mono">
                        MODE 6: INTENT ROUTER ACTIVE
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Target Selector */}
                    <select
                        value={targetAgent}
                        onChange={(e) => setTargetAgent(e.target.value)}
                        aria-label="Select Target Agent"
                        title="Select Target Agent"
                        className="bg-slate-950 border border-slate-700 text-[10px] text-slate-400 font-mono px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                    >
                        <option value="AUTO">AUTO-ROUTE</option>
                        <option value="GROK">GROK (STRATEGIC)</option>
                        <option value="GEMINI">GEMINI (CODING)</option>
                        <option value="GROK">GROK (DRAFTS)</option>
                        <option value="COMET">COMET (BROWSER)</option>
                        <option value="ANTIGRAVITY">ANTIGRAV (FILES)</option>
                        <option value="SWARM">SWARM (ALL ACTIVE)</option>
                    </select>

                    {/* Classification Badge */}
                    {classification && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`font - mono text - [10px] px - 2 py - 1 rounded border flex items - center gap - 2 ${meta.color} ${meta.border} ${meta.bg}`}
                        >
                            <TypeIcon size={12} />
                            {meta.label}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Main Processor Visualization */}
            <div className="flex-1 flex flex-col justify-center items-center gap-8 mb-6">
                {/* Current Intent Input */}
                <div className="w-full max-w-lg text-center z-20">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <div className="text-[10px] uppercase text-slate-400 font-mono text-left">Incoming Intent / Command</div>
                        <button
                            onClick={saveAsMacro}
                            disabled={isSaving || (!command.trim() && !currentIntent)}
                            className="text-[9px] text-indigo-400 font-mono uppercase hover:text-white transition-colors flex items-center gap-1"
                        >
                            <Plus size={10} />
                            Save as Automation
                        </button>
                    </div>

                    {onDispatch ? (
                        <form onSubmit={handleDispatch} className="relative group">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                placeholder={currentIntent || "Enter command..."}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded px-4 py-3 text-center text-xl md:text-2xl font-light text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                autoFocus
                            />
                            <button
                                type="submit"
                                aria-label="Dispatch Command"
                                disabled={!command.trim() && !currentIntent}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 p-2 rounded transition-colors disabled:opacity-0 disabled:pointer-events-none"
                            >
                                <Play size={16} fill="currentColor" />
                            </button>
                        </form>
                    ) : (
                        <div className="text-xl md:text-2xl font-light text-slate-200 tracking-tight leading-tight">
                            "{currentIntent || "Standing by..."}"
                        </div>
                    )}
                </div>

                {/* Pipeline Status: HARPA Visual Core */}
                <TimelineVisualizer activeStep={activeStep} steps={steps} />
            </div>

            {/* Trace Log Terminal */}
            <div className="mt-auto border-t border-slate-800 pt-3">
                <div className="text-[10px] uppercase text-slate-400 mb-2 font-mono flex gap-2 items-center">
                    <Terminal size={12} />
                    Trace Log
                </div>
                <div className="font-mono text-xs space-y-1 h-24 overflow-y-auto custom-scrollbar opacity-80">
                    {traceLog.length === 0 ? (
                        <div className="text-slate-400 italic">No recent activity...</div>
                    ) : (
                        traceLog.map((log, i) => (
                            <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2">
                                <span className="text-slate-400 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const OrchestrationPanel = React.memo(OrchestrationPanelBase);
OrchestrationPanel.displayName = 'OrchestrationPanel';

// --- HARPA VISUAL COMPONENTS ---

const TimelineVisualizer: React.FC<{ activeStep: string; steps: string[] }> = ({ activeStep, steps }) => {
    const activeIndex = steps.indexOf(activeStep);

    return (
        <div className="w-full max-w-2xl px-4">
            {/* Progress Bar Container */}
            <div className="relative flex items-center justify-between w-full">

                {/* Background Track */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />

                {/* Active Progress Fill */}
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}% ` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {/* Steps */}
                {steps.map((step, idx) => {
                    const isActive = idx === activeIndex;
                    const isCompleted = idx < activeIndex;

                    return (
                        <div key={step} className="relative flex flex-col items-center group">
                            {/* Node Circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    borderColor: isActive ? 'rgb(99 102 241)' : isCompleted ? 'rgb(16 185 129)' : 'rgb(30 41 59)',
                                    backgroundColor: isActive ? 'rgb(15 23 42)' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgb(15 23 42)',
                                    boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.5)' : 'none'
                                }}
                                className={`w - 8 h - 8 rounded - full border - 2 flex items - center justify - center z - 10 transition - colors duration - 300 cursor -default `}
                            >
                                {isCompleted ? (
                                    <CheckCircle size={14} className="text-emerald-500" />
                                ) : isActive ? (
                                    <div className="relative">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                        <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 rounded-full animate-ping opacity-75" />
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 bg-slate-800 rounded-full" />
                                )}
                            </motion.div>

                            {/* Label */}
                            <motion.div
                                className={`absolute top - 10 whitespace - nowrap text - [10px] font - mono font - bold tracking - wider transition - colors duration - 300
                                    ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}
`}
                                animate={{ y: isActive ? 0 : 0, opacity: isActive || isCompleted ? 1 : 0.7 }}
                            >
                                {step}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
