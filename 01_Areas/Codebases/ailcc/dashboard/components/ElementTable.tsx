import React from 'react';
import { ElementDefinition } from '../types/elements';
import { Shield, Target, Eye, Lock, Gavel, Radio } from 'lucide-react';

const ELEMENTS: ElementDefinition[] = [
    {
        key: 'signal',
        label: 'Signal',
        description: 'Information Hygiene',
        guidelines: 'Ensure data purity and relevance. Filter noise.'
    },
    {
        key: 'scope',
        label: 'Scope',
        description: 'Boundary Management',
        guidelines: 'Operate strictly within defined contexts.'
    },
    {
        key: 'strategy',
        label: 'Strategy',
        description: 'Optimization Logic',
        guidelines: 'Maximize efficiency and goal alignment.'
    },
    {
        key: 'safety',
        label: 'Safety',
        description: 'Risk Mitigation',
        guidelines: 'Prevent harm to system and data integrity.'
    },
    {
        key: 'ethics',
        label: 'Ethics',
        description: 'Value Alignment',
        guidelines: 'Adhere to Netukulimk principles of interconnectedness.'
    },
    {
        key: 'constraints',
        label: 'Constraints',
        description: 'Resource Limits',
        guidelines: 'Respect computational and budgetary limits.'
    },
];

const ICONS = {
    signal: Radio,
    scope: Target,
    strategy: Eye,
    safety: Shield,
    ethics: Gavel,
    constraints: Lock
};

export function ElementTable() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ELEMENTS.map((el) => {
                const Icon = ICONS[el.key] || Shield;
                return (
                    <div key={el.key} className="renaissance-panel p-4 group hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-cyan-500/10 transition-colors">
                                <Icon className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-100">{el.label}</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{el.description}</p>
                            <p className="text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-2">{el.guidelines}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
