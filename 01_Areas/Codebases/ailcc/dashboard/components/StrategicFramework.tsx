import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Zap,
    Users,
    Share2,
    Activity,
    Terminal,
    Eye,
    MousePointer2,
    Sparkles
} from 'lucide-react';

interface StrategicNode {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    historical: string;
    future: string;
}

const STRATEGIC_NODES: StrategicNode[] = [
    {
        id: 1,
        title: "Boundaries",
        description: "Hardening the environment and defining operational limits.",
        icon: <Shield size={24} />,
        color: "from-blue-500 to-cyan-400",
        historical: "Open file systems; no sandbox.",
        future: "Zero-Trust Chamber Environment."
    },
    {
        id: 2,
        title: "Benefits",
        description: "Shifting from simple efficiency to Sustainable Abundance.",
        icon: <Zap size={24} />,
        color: "from-amber-500 to-orange-400",
        historical: "Single-task automation.",
        future: "Autonomous wealth & knowledge generation."
    },
    {
        id: 3,
        title: "Bystanders",
        description: "Minimizing side-impact on non-agentic processes.",
        icon: <Users size={24} />,
        color: "from-slate-500 to-slate-400",
        historical: "WindowServer choke points.",
        future: "Shadow Orchestration priority."
    },
    {
        id: 4,
        title: "Info Flows",
        description: "High-fidelity, low-latency neural propagation.",
        icon: <Share2 size={24} />,
        color: "from-emerald-500 to-teal-400",
        historical: "File-drop syncing.",
        future: "Real-time Neural Mesh."
    },
    {
        id: 5,
        title: "Stability",
        description: "Self-healing infrastructure and robust path parity.",
        icon: <Activity size={24} />,
        color: "from-rose-500 to-pink-400",
        historical: "Connection refuse loops.",
        future: "Antigravity Auto-Repair."
    },
    {
        id: 6,
        title: "Protocols",
        description: "Unified grammar for agentic interoperability.",
        icon: <Terminal size={24} />,
        color: "from-indigo-500 to-violet-400",
        historical: "Ad-hoc manual scripts.",
        future: "Universal Agentic Handshake."
    },
    {
        id: 7,
        title: "Feedback Loops",
        description: "Specialized roles and recursive self-improvement.",
        icon: <Eye size={24} />,
        color: "from-purple-500 to-fuchsia-400",
        historical: "User-driven loops.",
        future: "Recursive Judge/SOP refinement."
    },
    {
        id: 8,
        title: "Convenience",
        description: "Zero-touch execution across Apple ecosystem.",
        icon: <MousePointer2 size={24} />,
        color: "from-cyan-500 to-sky-400",
        historical: "CLI-heavy barriers.",
        future: "Single-token intent execution."
    },
    {
        id: 9,
        title: "Side Effects",
        description: "Generating Cognitive Surplus from mundane automation.",
        icon: <Sparkles size={24} />,
        color: "from-yellow-500 to-lime-400",
        historical: "Disk bloat and noise.",
        future: "Systemic Enlightenment."
    }
];

export const StrategicFramework = () => {
    const [selected, setSelected] = useState<StrategicNode | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <AnimatePresence>
                {STRATEGIC_NODES.map((node) => (
                    <motion.div
                        key={node.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelected(selected?.id === node.id ? null : node)}
                        className={`
                            relative h-48 renaissance-panel p-6 cursor-pointer overflow-hidden group
                            ${selected?.id === node.id ? 'md:col-span-2 md:row-span-2 h-auto ring-2 ring-white/20' : ''}
                        `}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${node.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${node.color} shadow-lg`}>
                                {node.icon}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                0{node.id}_NODE
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{node.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                            {node.description}
                        </p>

                        {selected?.id === node.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <div>
                                    <h4 className="text-[10px] font-mono text-cyan-400 uppercase mb-2">Historical Context</h4>
                                    <p className="text-sm text-slate-300 italic">"{node.historical}"</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-mono text-purple-400 uppercase mb-2">Future Vision</h4>
                                    <p className="text-sm text-slate-300 font-bold underline decoration-purple-500/50 underline-offset-4">
                                        {node.future}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity font-mono text-[8px] text-slate-400">
                            GODIN_STRATEGY_MAP_V1
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
