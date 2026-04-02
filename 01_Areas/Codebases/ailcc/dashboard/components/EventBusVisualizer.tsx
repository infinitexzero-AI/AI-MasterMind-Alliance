import React, { useEffect, useState, useRef } from 'react';
import { Activity, Server, Cpu, Database, User, ArrowRight, Zap } from 'lucide-react';

interface AILCCEvent {
    id: string;
    timestamp: string;
    source: string;
    target: string;
    action: string;
    payload: string;
    latencyMs?: number;
    severity?: 'info' | 'warn' | 'error';
}

const getEntityIcon = (entity: string) => {
    const e = entity.toUpperCase();
    if (['USER'].includes(e)) return <User className="w-4 h-4 text-slate-400" />;
    if (['VAULT', 'MEMORY'].includes(e)) return <Database className="w-4 h-4 text-amber-500" />;
    if (['DISPATCH', 'ROUTER', 'SYSTEM'].includes(e)) return <Server className="w-4 h-4 text-fuchsia-400" />;
    if (['FORGE', 'SCOUT', 'ARCHITECT', 'GROK'].includes(e)) return <Cpu className="w-4 h-4 text-cyan-400" />;
    return <Activity className="w-4 h-4 text-indigo-400" />;
};

const getActionColor = (action: string) => {
    if (action.includes('ERROR') || action.includes('FAIL')) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (action.includes('QUERY') || action.includes('SEARCH')) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    if (action.includes('DELEGATE') || action.includes('HANDOFF')) return 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10';
    if (action.includes('ROUTE') || action.includes('DISPATCH')) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
};

export const EventBusVisualizer: React.FC = () => {
    const [events, setEvents] = useState<AILCCEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/system/event-stream');

        eventSource.onopen = () => setIsConnected(true);

        eventSource.onmessage = (event) => {
            if (event.data === 'connected') return;
            try {
                const newEvent: AILCCEvent = JSON.parse(event.data);
                setEvents(prev => {
                    const next = [...prev, newEvent].slice(-50); // Keep last 50 events
                    return next;
                });
            } catch (err) {
                console.error("Failed to parse event", err);
            }
        };

        eventSource.onerror = () => {
            setIsConnected(false);
            eventSource.close();
            // Optional: Implement reconnect logic here
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    const handleExportSnapshot = () => {
        const snapshot = {
            timestamp: new Date().toISOString(),
            recentEvents: events.map(e => `[${e.source}->${e.target}] ${e.action}: ${e.payload}`).slice(-30),
            status: isConnected ? 'ONLINE' : 'OFFLINE',
            message: "AILCC Telemetry Snapshot for AI Evaluation"
        };
        navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2))
            .then(() => alert("State Snapshot copied to clipboard! Paste this into Perplexity or Grok."))
            .catch(err => console.error("Could not copy text: ", err));
    };

    return (
        <div className="renaissance-panel bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)] flex flex-col h-96">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-900/50 border-b border-white/10 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Zap className={`w-5 h-5 ${isConnected ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                    <h3 className="font-mono text-sm tracking-widest text-slate-200 uppercase font-bold">
                        Global Event Bus
                    </h3>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <button
                        onClick={handleExportSnapshot}
                        className="text-[10px] font-mono uppercase bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-600 hover:border-cyan-500/50 px-3 py-1.5 rounded transition-all"
                    >
                        Copy State Snapshot
                    </button>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'} animate-pulse`} />
                        <span className="font-mono text-[10px] uppercase text-slate-400 tracking-widest">
                            {isConnected ? 'Live Telemetry' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
                {events.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs italic">
                        Waiting for swarm telemetry...
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((evt, idx) => (
                            <div
                                key={evt.id || idx}
                                className="group relative bg-[#0a0f16]/80 p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider bg-slate-900 px-2 py-1 rounded-md border border-white/5">
                                            {getEntityIcon(evt.source)}
                                            <span className="text-slate-300">{evt.source}</span>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-600" />
                                        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider bg-slate-900 px-2 py-1 rounded-md border border-white/5">
                                            {getEntityIcon(evt.target)}
                                            <span className="text-slate-300">{evt.target}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500/80">
                                        {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                                    </span>
                                </div>
                                <div className="flex items-start gap-4 mt-1">
                                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border tracking-widest ${getActionColor(evt.action)}`}>
                                        {evt.action}
                                    </span>
                                    <span className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed">
                                        {evt.payload}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventBusVisualizer;
