import React, { useEffect, useState, useRef } from 'react';
import { Activity, Terminal, RefreshCw } from 'lucide-react';

export default function HealthPanel() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<string>("init");
    const [lastPing, setLastPing] = useState<string>("-");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/heartbeat');
            const data = await res.json();
            if (data.status === "ok") {
                setLogs(data.log_tail);
                setStatus("active");
                setLastPing(new Date().toLocaleTimeString());
            } else {
                setStatus("waiting");
            }
        } catch (e) {
            setStatus("error");
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-full h-full flex flex-col font-mono text-sm shadow-xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Activity size={16} />
                    <span className="font-bold tracking-wider">SYSTEM HEARTBEAT</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {status.toUpperCase()}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                        <RefreshCw size={10} />
                        {lastPing}
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 space-y-1 custom-scrollbar min-h-[150px] max-h-[300px]"
            >
                {logs.length === 0 && <span className="text-slate-400 italic">Connecting to Neural Relay...</span>}
                {logs.map((line, i) => (
                    <div key={i} className="break-all whitespace-pre-wrap hover:bg-slate-900/50 px-1 rounded">
                        <span className="text-slate-400 mr-2">$</span>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );
}
