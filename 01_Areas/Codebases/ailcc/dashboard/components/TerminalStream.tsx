import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2 } from 'lucide-react';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'CMD' | 'OUT' | 'ERR';
}

export const TerminalStream = ({ logs }: { logs: LogEntry[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="renaissance-panel bg-slate-950 border border-slate-800 flex flex-col h-[300px]">
            <header className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Signal Stream</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-all"
                        aria-label="Copy terminal logs"
                        title="Copy Logs"
                    >
                        <Copy size={12} />
                    </button>
                    <button 
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-all"
                        aria-label="Clear terminal logs"
                        title="Clear Logs"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </header>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 custom-scrollbar"
            >
                {logs.length === 0 && (
                    <div className="text-slate-700 animate-pulse">Waiting for telemetry uplink...</div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="group flex gap-3">
                        <span className="text-slate-400 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                        <span className={`
                            ${log.type === 'CMD' ? 'text-cyan-400' : 
                              log.type === 'ERR' ? 'text-rose-400' : 'text-slate-300'}
                            break-all
                        `}>
                            {log.type === 'CMD' && <span className="text-slate-400 mr-2">$</span>}
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>

            <div className="px-4 py-1 bg-slate-900/30 border-t border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-400">
                <span>BUFFER: {logs.length}/500</span>
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    Baud Rate: 115200
                </span>
            </div>
        </div>
    );
};
