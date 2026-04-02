import React, { useRef, useEffect } from 'react';
import { StateViewerProps } from '../types/DashboardInterfaces';
import { FileJson, Scroll } from 'lucide-react';

const StateViewerBase: React.FC<StateViewerProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'COMET': return 'text-cyan-400';
            case 'ANTIGRAVITY': return 'text-fuchsia-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="bg-black/80 border border-slate-800 rounded-lg p-3 h-full flex flex-col font-mono">
            <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-2">
                <h2 className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <FileJson size={14} />
                    Neural State Stream
                </h2>
                <span className="text-[10px] text-slate-400">LIVE FEED</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-[10px] md:text-xs"
            >
                {logs.length === 0 ? (
                    <div className="text-slate-700 italic px-2">Waiting for signal...</div>
                ) : (
                    logs.map((log, idx) => (
                        <div key={idx} className="flex gap-2 group hover:bg-white/5 py-0.5 px-2 rounded transition-colors">
                            <span className="text-slate-400 min-w-[70px]">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className={`font-bold ${getSourceColor(log.source)} w-[90px]`}>
                                {log.source}
                            </span>
                            <span className="text-slate-300 flex-1 break-all">
                                {log.message}
                            </span>
                            {/* Optional Payload Inspector could go here */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const StateViewer = React.memo(StateViewerBase);
StateViewer.displayName = 'StateViewer';
