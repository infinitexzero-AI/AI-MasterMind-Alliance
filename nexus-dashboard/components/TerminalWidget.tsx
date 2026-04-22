import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    line: string;
}

export default function TerminalWidget({ logPath }: { logPath?: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connected, setConnected] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        const url = `/api/system/tail-logs${logPath ? `?path=${encodeURIComponent(logPath)}` : ''}`;
        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
            setConnected(true);
            setLogs([{ timestamp: new Date().toISOString(), line: '[SYSTEM] Established secure uplink to Alliance Core Terminal.' }]);
        };

        eventSource.onmessage = (e) => {
            try {
                const data: LogEntry = JSON.parse(e.data);
                setLogs(prev => {
                    const next = [...prev, data];
                    if (next.length > 500) return next.slice(next.length - 500); // Keep last 500 lines
                    return next;
                });
            } catch (err) {
                console.error("Failed to parse log line", err);
            }
        };

        eventSource.onerror = () => {
            setConnected(false);
            setLogs(prev => [...prev, { timestamp: new Date().toISOString(), line: '[ERROR] Terminal stream connection dropped or failed. Retrying...' }]);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [logPath]);

    // Handle scroll locking
    useEffect(() => {
        if (!containerRef.current) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current!;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setAutoScroll(isAtBottom);
        };

        const currentRef = containerRef.current;
        currentRef.addEventListener('scroll', handleScroll);
        return () => currentRef.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (autoScroll) {
            endRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [logs, autoScroll]);

    return (
        <div className="flex flex-col h-full bg-[#0a0f16] border border-slate-700/50 rounded-xl overflow-hidden font-mono text-xs">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700/50 text-slate-400 select-none">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-cyan-500" />
                    <span className="font-bold tracking-wider text-slate-300">NEXUS_TERMINAL</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 opacity-80">
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] tracking-widest uppercase">{connected ? 'Live' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Terminal Output */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar whitespace-pre-wrap word-break">
                {logs.length === 0 && !connected && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2 opacity-50">
                        <ShieldAlert className="w-8 h-8" />
                        <div>Initializing terminal uplink...</div>
                    </div>
                )}

                {logs.map((log, i) => {
                    const isSystem = log.line.includes('[SYSTEM]');
                    const isError = log.line.includes('[ERROR]') || log.line.toLowerCase().includes('error');
                    const isWarn = log.line.includes('[WARN]') || log.line.toLowerCase().includes('warn');
                    const date = new Date(log.timestamp);
                    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

                    return (
                        <div key={i} className={`flex hover:bg-white/5 pr-4 -mx-4 px-4 ${isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSystem ? 'text-cyan-500 font-bold' : 'text-slate-300'}`}>
                            <span className="text-slate-600 mr-3 select-none flex-shrink-0">[{timeStr}]</span>
                            <span className="font-mono break-all">{log.line}</span>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Scroll lock warning */}
            {!autoScroll && logs.length > 0 && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 text-slate-300 border border-slate-600/50 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-700 transition-colors shadow-lg z-10 text-[10px] tracking-widest uppercase flex items-center gap-2"
                    onClick={() => {
                        setAutoScroll(true);
                        endRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    Resume Auto-Scroll
                </div>
            )}
        </div>
    );
}
