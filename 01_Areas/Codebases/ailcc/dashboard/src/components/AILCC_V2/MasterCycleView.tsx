import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Code, Database, Globe, Layers, Zap } from 'lucide-react';
import clsx from 'clsx';

import { useSwarmTelemetry } from '../../../hooks/useSwarmTelemetry';

// Simulated Live Feed of Agent Actions
const MOCK_ACTIONS = [
    { id: 1, agent: 'Antigravity', task: 'Writing Docker compose', icon: Code, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 2, agent: 'Valentine', task: 'Orchestrating Phase 17', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 3, agent: 'Ouroboros', task: 'Monitoring Memory Pipeline', icon: Database, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 4, agent: 'Grok', task: 'Synthesizing Strategic Steps', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 5, agent: 'Comet', task: 'Browser Sync Standby', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

export const MasterCycleView = () => {
    const { actionPlan } = useSwarmTelemetry();
    const [activeActions, setActiveActions] = useState(MOCK_ACTIONS.slice(0, 3));
    const [counter, setCounter] = useState(3);

    // Phase 72: Real-time Master Cycle Data Binding
    useEffect(() => {
        if (actionPlan && actionPlan.steps) {
            // Map the latest completed or in-progress steps to the cycle view
            const liveSteps = actionPlan.steps
                .filter((s: any) => s.status === 'in_progress' || s.status === 'completed')
                .reverse() // Newest first
                .slice(0, 5)
                .map((s: any, _idx: number) => {
                    const isCode = s.title.includes('forge') || s.title.includes('execute');
                    return {
                        id: s.id + "_" + s.status, // force animation key change on status update
                        agent: actionPlan.title.includes("Agency") ? "Sovereign Node" : "Swarm Node",
                        task: s.title,
                        icon: isCode ? Code : Activity,
                        color: s.status === 'in_progress' ? 'text-cyan-400' : 'text-green-400',
                        bg: s.status === 'in_progress' ? 'bg-cyan-500/10' : 'bg-green-500/10'
                    };
                });
            
            if (liveSteps.length > 0) {
                setActiveActions(liveSteps);
                return;
            }
        }
        
        // Fallback to idle simulation if no active action plan
        const interval = setInterval(() => {
            setCounter((prev) => prev + 1);
            const nextAction = { ...MOCK_ACTIONS[counter % MOCK_ACTIONS.length], id: Date.now() };

            setActiveActions((current) => {
                const updated = [nextAction, ...current];
                if (updated.length > 5) return updated.slice(0, 4);
                return updated;
            });
        }, 4000); 

        return () => clearInterval(interval);
    }, [actionPlan, counter]);

    return (
        <div className="renaissance-panel p-4 relative overflow-hidden flex flex-col gap-3 min-h-[160px]">
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-400 font-mono opacity-80 uppercase tracking-widest">Master Cycle Live</span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-white/80">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-sans font-medium text-sm tracking-wide">Swarm Execution Timeline</h3>
            </div>

            <div className="relative flex-1 flex items-center pr-4 mt-2">
                {/* Horizontal Track Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-transparent pointer-events-none" />

                <div className="flex items-center gap-4 w-full overflow-hidden whitespace-nowrap mask-edges-x">
                    <AnimatePresence mode="popLayout">
                        {activeActions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={action.id}
                                    layout
                                    initial={{ opacity: 0, x: -50, scale: 0.8 }}
                                    animate={{ opacity: i === 0 ? 1 : 0.6, x: 0, scale: i === 0 ? 1 : 0.95 }}
                                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className={clsx(
                                        "flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm",
                                        action.bg,
                                        i === 0 ? "shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-500/20" : ""
                                    )}
                                >
                                    <div className={clsx("p-2 rounded-md bg-black/40", action.color)}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={clsx("text-xs font-bold uppercase tracking-wider", action.color)}>
                                            {action.agent}
                                        </span>
                                        <span className="text-xs text-white/70 font-mono truncate max-w-[150px]">
                                            {action.task}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MasterCycleView;
