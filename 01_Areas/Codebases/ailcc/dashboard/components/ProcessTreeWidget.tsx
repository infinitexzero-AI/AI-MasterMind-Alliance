import React, { useEffect, useState } from 'react';
import { Activity, Cpu, HardDrive } from 'lucide-react';

interface Process {
    pid: string;
    ppid: string;
    cpu: string;
    mem: string;
    cmd: string;
}

export default function ProcessTreeWidget() {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProcesses = async () => {
        try {
            const res = await fetch('/api/system/process-tree');
            const data = await res.json();
            setProcesses(data.processes || []);
        } catch (e) {
            console.error('Failed to fetch processes', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
        const interval = setInterval(fetchProcesses, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-all" />

            <h3 className="font-mono text-blue-400 uppercase text-sm mb-6 flex items-center gap-3 font-bold tracking-widest border-b border-blue-500/20 pb-4 relative z-10 transition-all group-hover:text-blue-300">
                <Activity className="w-4 h-4" /> Living Process Tree
            </h3>

            <div className="relative z-10 overflow-hidden rounded-xl border border-white/5 bg-slate-900/40">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left font-mono text-[10px]">
                        <thead className="sticky top-0 bg-slate-900 text-slate-500 uppercase tracking-tighter border-b border-white/10">
                            <tr>
                                <th className="p-3">PID</th>
                                <th className="p-3 text-center">CPU%</th>
                                <th className="p-3 text-center">MEM%</th>
                                <th className="p-3">COMMAND</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && processes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">Scanning neural processes...</td>
                                </tr>
                            ) : processes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No active AILCC processes found.</td>
                                </tr>
                            ) : (
                                processes.map((p) => (
                                    <tr key={p.pid} className="hover:bg-blue-500/5 transition-colors group/row">
                                        <td className="p-3 text-blue-400/80">{p.pid}</td>
                                        <td className={`p-3 text-center ${parseFloat(p.cpu) > 10 ? 'text-orange-400' : 'text-slate-400'}`}>{p.cpu}</td>
                                        <td className="p-3 text-center text-slate-400">{p.mem}</td>
                                        <td className="p-3 text-slate-300 max-w-xs truncate group-hover/row:whitespace-normal group-hover/row:bg-slate-900/80 transition-all">
                                            {p.cmd}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
