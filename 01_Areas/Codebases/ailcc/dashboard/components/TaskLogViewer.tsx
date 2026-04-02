import React, { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { Activity, Terminal, AlertCircle, CheckCircle, Shield, XCircle } from 'lucide-react';
import HumanApprovalGate from './HumanApprovalGate';
import RiskTierBadge from './RiskTierBadge';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface FlattenedLog {
    id: string;
    content: string;
    timestamp: string;
    agent: string;
    taskId: string;
    status: string;
    jobId: string;
    payload?: any;
}

interface TaskLogViewerProps {
    taskId?: string;
    limit?: number;
    refreshInterval?: number;
    title?: string;
}

export function TaskLogViewer({ taskId, limit = 20, refreshInterval = 3000, title = "Protocol Stream" }: TaskLogViewerProps) {
    const url = `http://localhost:5001/api/v1/logs?limit=${limit}${taskId ? `&taskId=${taskId}` : ''}`;
    const { data, error } = useSWR(url, fetcher, { refreshInterval });

    const [logs, setLogs] = useState<FlattenedLog[]>([]);
    const [approving, setApproving] = useState<Record<string, boolean>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const virtualHeightRef = useRef<HTMLDivElement>(null);
    const virtualOffsetRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    // Virtual scrolling constants
    const ITEM_HEIGHT = 60; // Approximate height per log item
    const BUFFER_SIZE = 5;  // Items to render outside viewport

    useEffect(() => {
        if (data?.data) {
            const rawLogs = Array.isArray(data.data) ? data.data : [];
            const formatted = rawLogs.map((item: any) => ({
                id: item.id,
                content: item.content,
                timestamp: item.timestamp,
                agent: item.agent || 'system',
                taskId: item.taskId,
                status: item.status || 'info',
                jobId: item.jobId,
                payload: item.payload
            }));
            setLogs(formatted);
        }
    }, [data]);

    useEffect(() => {
        if (virtualHeightRef.current) {
            virtualHeightRef.current.style.height = `${logs.length * ITEM_HEIGHT}px`;
            virtualHeightRef.current.style.position = 'relative';
        }
    }, [logs.length]);

    useEffect(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
        const offsetY = startIndex * ITEM_HEIGHT;
        if (virtualOffsetRef.current) {
            virtualOffsetRef.current.style.transform = `translateY(${offsetY}px)`;
        }
    }, [scrollTop, logs.length]);

    if (error) return <div className="text-red-400 text-xs p-4">Uplink Error: {error.message}</div>;

    const handleApprove = async (log: FlattenedLog) => {
        if (approving[log.id]) return;

        setApproving(prev => ({ ...prev, [log.id]: true }));
        try {
            await fetch(`http://localhost:5001/api/v1/swarms/${log.taskId}/approve`, { method: 'POST' });
        } catch (e) {
            console.error(e);
            setApproving(prev => ({ ...prev, [log.id]: false }));
        }
    };

    const handleScroll = () => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
        }
    };

    const containerHeight = containerRef.current?.clientHeight || 400;
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(logs.length, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE);
    const visibleLogs = logs.slice(startIndex, endIndex);

    return (
        <div className="renaissance-panel flex flex-col h-96">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" /> {title}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                </span>
            </div>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Terminal className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-mono">NO ACTIVE SIGNALS</span>
                    </div>
                ) : (
                    <div ref={virtualHeightRef}>
                        <div ref={virtualOffsetRef}>
                            {visibleLogs.map((log) => (
                                <div key={log.id} className={`group flex gap-3 p-2 hover:bg-white/5 rounded transition-colors text-xs font-mono border-l-2 border-transparent ${log.agent === 'ManagerWorker' ? 'hover:border-emerald-500/50 bg-emerald-950/10' : 'hover:border-cyan-500/30'}`}>
                                    <div className="text-slate-400 min-w-[70px]">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <AgentBadge agent={log.agent} />
                                            <span className="text-slate-400">::</span>
                                            <StatusBadge status={log.status} payload={log.payload} agent={log.agent} />
                                        </div>
                                        <div className="text-slate-300 truncate w-full group-hover:whitespace-normal group-hover:text-white transition-colors">
                                            {log.agent === 'ManagerWorker' && log.payload?.feedback ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="italic text-emerald-300">"{log.payload.feedback}"</span>
                                                    {log.payload.decision === 'PENDING_APPROVAL' && (
                                                        <HumanApprovalGate
                                                            taskId={log.taskId}
                                                            isApproving={!!approving[log.id]}
                                                            onApprove={() => handleApprove(log)}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span>{log.content?.replace(/^\[.*?\]\s*[A-Z]+:\s*/, '') || 'No Signal Data'}</span>
                                                    {/* Render Risk Analysis if present in AutomationWorker plans */}
                                                    {log.agent === 'AutomationWorker' && log.payload?.dispatch_plan?.risk_analysis && (
                                                        <RiskTierBadge
                                                            riskTier={log.payload.dispatch_plan.risk_analysis.risk_tier}
                                                            keyRisks={log.payload.dispatch_plan.risk_analysis.key_risks}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AgentBadge({ agent }: { agent: string }) {
    if (agent === 'ManagerWorker') {
        return <span className="uppercase font-bold text-emerald-400 flex items-center gap-1"><Shield className="w-3 h-3" /> {agent}</span>;
    }
    return (
        <span className={`uppercase font-bold ${agent.includes('Automation') ? 'text-purple-400' : 'text-cyan-400'}`}>
            {agent}
        </span>
    );
}

function StatusBadge({ status, payload, agent }: { status: string, payload?: any, agent?: string }) {
    if (agent === 'ManagerWorker' && payload?.decision) {
        if (payload.decision === 'PENDING_APPROVAL') {
            return <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse"><AlertCircle className="w-3 h-3" /> PENDING APPROVAL</span>;
        }
        return payload.decision === 'APPROVED' ?
            <span className="text-emerald-500 flex items-center gap-1 font-bold"><CheckCircle className="w-3 h-3" /> APPROVED</span> :
            <span className="text-red-500 flex items-center gap-1 font-bold"><XCircle className="w-3 h-3" /> REJECTED</span>;
    }

    if (status === 'complete' || status === 'success') {
        return <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OK</span>;
    }
    if (status === 'failed' || status === 'error') {
        return <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> ERR</span>;
    }
    return <span className="text-slate-400">{status.toUpperCase()}</span>;
}
