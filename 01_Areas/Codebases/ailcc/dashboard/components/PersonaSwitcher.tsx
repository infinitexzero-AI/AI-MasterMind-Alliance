import React from 'react';
import { Bot, Code, Search, Zap, Shield } from 'lucide-react';

export type PersonaType = 'general' | 'code' | 'research' | 'strategy' | 'memory';

interface PersonaSwitcherProps {
    activePersona: PersonaType;
    onPersonaChange: (p: PersonaType) => void;
}

const PERSONAS: { id: PersonaType; label: string; icon: React.FC<any>; color: string }[] = [
    { id: 'general', label: 'NEXUS', icon: Bot, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'code', label: 'FORGE', icon: Code, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'research', label: 'SCOUT', icon: Search, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'strategy', label: 'ARCHITECT', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'memory', label: 'MEMORY', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
];

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({ activePersona, onPersonaChange }) => {
    return (
        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-700/50 bg-slate-900/50">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 w-full mb-1">Active Alliance Persona</span>
            {PERSONAS.map((p) => {
                const isActive = activePersona === p.id;
                const Icon = p.icon;
                return (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => onPersonaChange(p.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border ${isActive ? p.color : 'text-slate-500 bg-transparent border-transparent hover:bg-slate-800'
                            }`}
                        title={`Switch to ${p.label} Persona`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {p.label}
                    </button>
                );
            })}
        </div>
    );
};
