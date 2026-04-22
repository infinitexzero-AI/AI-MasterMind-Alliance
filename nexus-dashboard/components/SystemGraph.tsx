import React from 'react';
import { useAgentStatus } from './hooks/useAgentStatus';
import { motion } from 'framer-motion';

const SystemGraphBase: React.FC = () => {
    const { agents } = useAgentStatus();

    // Helper to check if a role is active
    const isRoleActive = (rolePattern: string) => {
        return agents.some(a =>
            a.role.toLowerCase().includes(rolePattern.toLowerCase()) &&
            (a.status === 'EXECUTING' || a.status === 'THINKING')
        );
    };

    // Derived states
    const isCoderActive = isRoleActive('coder') || isRoleActive('developer');
    const isResearcherActive = isRoleActive('research') || isRoleActive('analyst');
    const isStrategistActive = isRoleActive('strategist') || isRoleActive('planner');

    // System is "thinking" if any agent is busy
    const isSystemActive = isCoderActive || isResearcherActive || isStrategistActive;

    return (
        <div className="relative w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-lg border border-slate-800">
            {/* SVG Layer for Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                        <stop offset="50%" stopColor="rgba(34, 211, 238, 1)" />
                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
                    </linearGradient>
                </defs>

                {/* Central Flow Lines */}
                <FlowLine x1="15%" y1="50%" x2="40%" y2="50%" delay={0} active={true} />
                <FlowLine x1="60%" y1="50%" x2="85%" y2="20%" delay={0.5} active={isCoderActive} />
                <FlowLine x1="60%" y1="50%" x2="85%" y2="50%" delay={0.7} active={isResearcherActive} />
                <FlowLine x1="60%" y1="50%" x2="85%" y2="80%" delay={0.9} active={isStrategistActive} />
            </svg>

            <div className="relative z-10 w-full h-full grid grid-cols-3 gap-4 p-4 items-center">

                {/* COL 1: Input */}
                <div className="flex flex-col items-center gap-4">
                    <Node label="User" icon="👤" active={true} />
                    <div className={`h-8 w-px border-l border-dashed ${isSystemActive ? 'border-cyan-500/50' : 'border-slate-600'}`} />
                    <Node label="Omni-Bar" icon="⌘K" active={true} color="cyan" />
                </div>

                {/* COL 2: Brain (Router) */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className={`absolute inset-0 bg-purple-500/20 blur-xl rounded-full transition-opacity duration-500 ${isSystemActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                        <Node label="Intent Router" icon="🧠" active={true} size="lg" color="purple" />
                    </div>
                    <div className="mt-8">
                        <Node label="Shared Memory" icon="💾" active={isSystemActive} size="sm" color="emerald" />
                    </div>
                </div>

                {/* COL 3: Agents */}
                <div className="flex flex-col items-center gap-6 justify-center">
                    <Node label="Coder" icon="💻" active={isCoderActive} color="blue" />
                    <Node label="Researcher" icon="🔎" active={isResearcherActive} color="amber" />
                    <Node label="Strategist" icon="♟️" active={isStrategistActive} color="indigo" />
                </div>
            </div>
        </div>
    );
};

export const SystemGraph = React.memo(SystemGraphBase);
SystemGraph.displayName = 'SystemGraph';

const Node = ({ label, icon, active, size = 'md', color = 'slate', onHandoff }: any) => {
    const sizeClasses = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-xl';

    // Color mapping
    const colorMap: any = {
        cyan: 'border-cyan-500 shadow-cyan-500/50 text-cyan-400',
        purple: 'border-purple-500 shadow-purple-500/50 text-purple-400',
        emerald: 'border-emerald-500 shadow-emerald-500/50 text-emerald-400',
        blue: 'border-blue-500 shadow-blue-500/50 text-blue-400',
        amber: 'border-amber-500 shadow-amber-500/50 text-amber-400',
        indigo: 'border-indigo-500 shadow-indigo-500/50 text-indigo-400',
        slate: 'border-slate-500 shadow-slate-500/50 text-slate-400'
    };

    const activeClass = active ? `shadow-[0_0_15px_rgba(0,0,0,0.5)] ${colorMap[color]} bg-slate-900` : 'border-slate-800 text-slate-700 bg-slate-900/50';

    return (
        <motion.div 
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                // If dragged significantly to the right, trigger handoff
                if (info.offset.x > 50) onHandoff?.(label);
            }}
            className="flex flex-col items-center gap-2 transition-all duration-300 relative z-20 cursor-grab active:cursor-grabbing"
        >
            <div className={`
                ${sizeClasses} rounded-xl border-2 flex items-center justify-center
                transition-all duration-300 ${activeClass}
            `}>
                {icon}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-mono ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                {label}
            </span>
        </motion.div>
    );
};

const FlowLine = ({ x1, y1, x2, y2, delay, active = true }: any) => {
    return (
        <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#line-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5,5"
            className={`transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-10'}`}
        >
            {active && <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" begin={delay} />}
        </line>
    );
};

export default SystemGraph;
