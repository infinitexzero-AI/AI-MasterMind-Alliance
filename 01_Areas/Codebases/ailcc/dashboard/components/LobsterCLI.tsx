import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Zap, Activity, Trash2, Cpu } from 'lucide-react';
import { useNeuralSync } from './NeuralSyncProvider';

interface TerminalLine {
    text: string;
    type: 'stdout' | 'stderr' | 'info' | 'error';
    timestamp: string;
}

export const LobsterCLI: React.FC = () => {
    const { socket, isConnected } = useNeuralSync();
    const [input, setInput] = useState('');
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!socket) return;

        const handleOutput = (data: { type: string, data?: string, code?: number }) => {
            if (data.type === 'exit') {
                setIsExecuting(false);
                setLines(prev => [...prev, {
                    text: `--- Process Exited with code ${data.code} ---`,
                    type: 'info',
                    timestamp: new Date().toISOString()
                }]);
                return;
            }

            setLines(prev => [...prev, {
                text: data.data || '',
                type: data.type as any,
                timestamp: new Date().toISOString()
            }].slice(-500)); // Buffer management
        };

        socket.on('OPENCLAW_OUTPUT', handleOutput);
        return () => { socket.off('OPENCLAW_OUTPUT', handleOutput); };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const handleExecute = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socket || isExecuting) return;

        const cmd = input.trim();
        setLines(prev => [...prev, {
            text: `> ${cmd}`,
            type: 'stdout',
            timestamp: new Date().toISOString()
        }]);
        
        socket.emit('OPENCLAW_EXEC', cmd);
        setInput('');
        setIsExecuting(true);
    };

    return (
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-2xl relative group">
            {/* Glossy Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30">
                        <Terminal size={18} className="text-emerald-400" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest block">Lobster CLI</span>
                        <span className="text-[9px] text-emerald-500 font-mono">OpenClaw v2026 Beta // Vanguard</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                        <Activity size={12} className={isExecuting ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
                        <span className="text-[10px] font-mono text-slate-300">
                            {isExecuting ? 'EXECUTING' : isConnected ? 'SYNCHRONIZED' : 'OFFLINE'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setLines([])}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Purge Terminal Buffer"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Terminal Output */}
            <div 
                ref={scrollRef}
                className="flex-1 p-5 font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-900/40 scrollbar-track-transparent bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
            >
                {lines.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
                        <Cpu size={48} className="text-emerald-500 mb-4 animate-pulse" />
                        <p className="text-emerald-400 font-bold uppercase tracking-tighter text-sm">Awaiting Strategic Commands</p>
                        <p className="text-[10px] text-slate-500 mt-2">OpenClaw Neural Bridge // Ready for Input</p>
                    </div>
                )}

                {lines.map((line, idx) => (
                    <div key={idx} className={`flex gap-3 leading-relaxed ${line.type === 'stderr' || line.type === 'error' ? 'text-rose-400 bg-red-400/5 px-2 rounded' : 'text-emerald-400/90'}`}>
                        <span className="text-slate-600 shrink-0 select-none">
                            {new Date(line.timestamp).toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span className="whitespace-pre-wrap break-all">
                            {line.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Command Entry */}
            <div className="p-4 bg-slate-900/50 border-t border-emerald-500/10">
                <form onSubmit={handleExecute} className="flex items-center gap-3">
                    <Zap size={14} className="text-emerald-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type strategic command (e.g. openclaw doctor)..."
                        autoFocus
                        disabled={!isConnected || isExecuting}
                        className="flex-1 bg-transparent border-none text-emerald-100 font-mono text-xs focus:ring-0 placeholder:text-emerald-900/60"
                    />
                    <button 
                        type="submit"
                        disabled={!input || isExecuting}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold tracking-widest transition-all uppercase disabled:opacity-30"
                    >
                        Execute
                    </button>
                </form>
            </div>

            {/* Decorative Pulse Line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>
    );
};

export default LobsterCLI;
