import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, Globe, Files, MessageSquare, Zap, Cpu, Database, Layout, Palette } from 'lucide-react';

interface StackItem {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
}

interface IdeaStackProps {
    title: string;
    items: StackItem[];
}

const STACKS: IdeaStackProps[] = [
    {
        title: "Scholar Stack",
        items: [
            { id: 'comet', name: 'Comet Browser', icon: Globe, color: 'bg-orange-500' },
            { id: 'pdf', name: 'Syllabus PDF', icon: Files, color: 'bg-rose-500' },
            { id: 'canvas', name: 'Canvas LMS', icon: GraduationCap, color: 'bg-red-500' },
            { id: 'notes', name: 'BSc Notes', icon: BookOpen, color: 'bg-amber-500' },
        ]
    },
    {
        title: "AI Orchestration",
        items: [
            { id: 'antigravity', name: 'Antigravity', icon: Zap, color: 'bg-cyan-500' },
            { id: 'grok', name: 'Grok Architect', icon: MessageSquare, color: 'bg-purple-500' },
            { id: 'openclaw', name: 'OpenClaw Upgrade', icon: Cpu, color: 'bg-fuchsia-500' },
            { id: 'vector', name: 'Hippocampus DB', icon: Database, color: 'bg-indigo-500' },
        ]
    },
    {
        title: "Design System",
        items: [
            { id: 'nexus', name: 'Nexus Layout', icon: Layout, color: 'bg-emerald-500' },
            { id: 'palette', name: 'Quantum Colors', icon: Palette, color: 'bg-teal-500' },
            { id: 'motion', name: 'Framer Pulse', icon: Zap, color: 'bg-sky-500' },
        ]
    }
];

export const IdeaStack: React.FC = () => {
    const [expandedStack, setExpandedStack] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-6">
            {STACKS.map((stack) => (
                <div key={stack.title} className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2">{stack.title}</h3>

                    <div className="relative h-64 perspective-[1000px]">
                        <AnimatePresence>
                            {stack.items.map((item, index) => {
                                const isExpanded = expandedStack === stack.title;
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={false}
                                        animate={{
                                            y: isExpanded ? index * 60 : index * 8,
                                            z: isExpanded ? 0 : -index * 10,
                                            scale: isExpanded ? 1 : 1 - (index * 0.05),
                                            rotateX: isExpanded ? 0 : -15,
                                            opacity: isExpanded ? 1 : 1 - (index * 0.2),
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            y: isExpanded ? index * 60 - 5 : index * 8 - 5,
                                            transition: { duration: 0.2 }
                                        }}
                                        onClick={() => setExpandedStack(isExpanded ? null : stack.title)}
                                        className={`
                                            absolute inset-0 cursor-pointer rounded-2xl p-6 border border-white/10
                                            backdrop-blur-xl shadow-2xl transition-colors duration-300
                                            ${item.color === 'bg-cyan-500' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-slate-900/60'}
                                            active:scale-95
                                        `}
                                        style={{ transformOrigin: 'top center' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${item.color} shadow-lg`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold tracking-wide">{item.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">Active Instance</p>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.random() * 60 + 40}%` }}
                                                    className={`h-full ${item.color}`}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[8px] font-mono text-slate-500">UTILIZATION</span>
                                                <span className="text-[8px] font-mono text-slate-300">OPTIMAL</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setExpandedStack(expandedStack === stack.title ? null : stack.title)}
                        className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest mt-2"
                    >
                        {expandedStack === stack.title ? 'Collapse Stack' : 'Expand Details'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default IdeaStack;
