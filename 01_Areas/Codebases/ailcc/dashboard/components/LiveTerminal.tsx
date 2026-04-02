import React, { useEffect, useState, useRef } from 'react';

import { Terminal, Activity, Monitor, Trash2 } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'system' | 'warn';
    data?: any;
}

const LiveTerminal: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5005');

        ws.onopen = () => {
            setIsConnected(true);
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                message: 'Neural Link Established (Relay: Active)',
                type: 'system'
            }]);
        };

        ws.onclose = () => {
            setIsConnected(false);
            setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                message: 'Neural Link Disconnected',
                type: 'error'
            }]);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'LOG' || data.type === 'SYSTEM') {
                    setLogs(prev => [...prev, {
                        timestamp: new Date().toISOString(),
                        message: data.message || JSON.stringify(data),
                        type: data.level || 'info',
                        data: data.payload
                    }].slice(-100));
                }
            } catch (e) {
                // Ignore non-JSON or unrelated messages to keep terminal clean
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type: string) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            case 'system': return 'text-cyan-400';
            default: return 'text-green-400';
        }
    };

    return (
        <div className="bg-black/90 border border-cyan-500/30 rounded-lg overflow-hidden flex flex-col h-[400px] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                    <Terminal size={16} className="text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-100 tracking-wider">NEURAL TERMINAL</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-mono border ${isConnected
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        <Activity size={10} />
                        <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                    <button
                        onClick={() => setLogs([])}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Clear Logs"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent"
            >
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Monitor size={40} className="opacity-20" />
                        <p>Waiting for neural signals...</p>
                    </div>
                )}

                {logs.map((log, index) => (
                    <div key={index} className="flex space-x-2 animate-fade-in">
                        <span className="text-slate-400 shrink-0">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={`${getLogColor(log.type)} break-all`}>
                            {log.type === 'system' && '> '}
                            {log.message}
                        </span>
                        {log.data && (
                            <details className="text-slate-400 cursor-pointer hover:text-cyan-300">
                                <summary>DATA</summary>
                                <pre className="mt-1 p-2 bg-slate-900 rounded text-[10px] text-cyan-200 overflow-x-auto">
                                    {JSON.stringify(log.data, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                ))}
                {/* Typing indicator cursor */}
                <div className="inline-block w-2 h-4 bg-cyan-500/50 animate-pulse ml-1" />
            </div>
        </div>
    );
};

export default LiveTerminal;
