import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Image, Search, Brain, Zap, Link2,
} from 'lucide-react';

export type StudioMode = 'document' | 'image_prompt' | 'research' | 'plan' | 'automate' | 'connect';

export interface ModeConfig {
    id: StudioMode;
    label: string;
    tagline: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    placeholder: string;
    contextLabel?: string;
}

export const STUDIO_MODES: ModeConfig[] = [
    {
        id: 'document',
        label: 'Document',
        tagline: 'Create structured docs & reports',
        icon: FileText,
        color: 'text-sky-400',
        gradient: 'from-sky-500/20 to-blue-500/5',
        placeholder: 'Describe the document you need... (e.g. "Technical spec for a REST API authentication system")',
        contextLabel: 'Target audience / format preference',
    },
    {
        id: 'image_prompt',
        label: 'Image Prompt',
        tagline: 'Generate Midjourney / SD prompts',
        icon: Image,
        color: 'text-violet-400',
        gradient: 'from-violet-500/20 to-purple-500/5',
        placeholder: 'Describe your image concept... (e.g. "Futuristic AI command center, dark atmosphere, holographic screens")',
    },
    {
        id: 'research',
        label: 'Research',
        tagline: 'Deep research with cited insights',
        icon: Search,
        color: 'text-amber-400',
        gradient: 'from-amber-500/20 to-orange-500/5',
        placeholder: 'Enter your research topic... (e.g. "Impact of vector databases on AI agent memory systems in 2025")',
        contextLabel: 'Focus area or specific angle',
    },
    {
        id: 'plan',
        label: 'Problem Solving',
        tagline: 'Structured solution roadmaps',
        icon: Brain,
        color: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-teal-500/5',
        placeholder: 'Describe the problem or challenge... (e.g. "Dashboard latency spikes when more than 10 AI agents are active")',
        contextLabel: 'Constraints or existing solutions tried',
    },
    {
        id: 'automate',
        label: 'Automation',
        tagline: 'Workflow blueprints & triggers',
        icon: Zap,
        color: 'text-rose-400',
        gradient: 'from-rose-500/20 to-pink-500/5',
        placeholder: 'Describe the workflow to automate... (e.g. "When a GitHub PR is merged, notify Slack, update Notion, and trigger deployment")',
        contextLabel: 'Existing tools / stack',
    },
    {
        id: 'connect',
        label: 'Connections',
        tagline: 'System integration & API mapping',
        icon: Link2,
        color: 'text-cyan-400',
        gradient: 'from-cyan-500/20 to-blue-500/5',
        placeholder: 'List your systems/tools... (e.g. "Notion, GitHub, Slack, Stripe, xAI API, Next.js dashboard, OpenClaw")',
        contextLabel: 'Primary goal of integrations',
    },
];

export default function StudioModeSelector({
    activeMode,
    onSelect,
}: {
    activeMode: StudioMode;
    onSelect: (mode: StudioMode) => void;
}) {
    return (
        <nav className="w-64 flex-none flex flex-col gap-1 p-2">
            {STUDIO_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                    <motion.button
                        key={mode.id}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(mode.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                                ? `bg-gradient-to-r ${mode.gradient} border border-white/20`
                                : 'border border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
                            <Icon className={`w-4 h-4 ${isActive ? mode.color : 'text-slate-400 group-hover:text-slate-200'} transition-colors`} />
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                                {mode.label}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{mode.tagline}</div>
                        </div>
                    </motion.button>
                );
            })}
        </nav>
    );
}
