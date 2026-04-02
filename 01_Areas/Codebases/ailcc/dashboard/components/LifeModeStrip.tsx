import React from 'react';

type Mode = 'ACADEMIC' | 'FINANCE' | 'HEALTH' | 'OPS';

export default function LifeModeStrip({ currentMode = 'ACADEMIC' }: { currentMode?: Mode }) {
    const modes: Mode[] = ['ACADEMIC', 'FINANCE', 'HEALTH', 'OPS'];

    return (
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5 mr-4">
            {modes.map(mode => (
                <div key={mode} className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider cursor-default transition-all ${mode === currentMode
                        ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                        : 'text-slate-400 opacity-50'
                    }`}>
                    {mode}
                </div>
            ))}
        </div>
    );
}
