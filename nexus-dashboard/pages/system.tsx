import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { StorageTierVisualizer } from '../components/StorageTierVisualizer';
import { DataFlowVisualizer } from '../components/DataFlowVisualizer';
import { IntelligentFileFinder } from '../components/IntelligentFileFinder';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function SystemPage() {
    const [mounted, setMounted] = useState(false);
    const [processData, setProcessData] = useState<any[]>([]);
    const [showStorage, setShowStorage] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchHealth = async () => {
             try {
                 const res = await fetch('/api/system/health');
                 if (res.ok) {
                     const data = await res.json();
                     if (data.processes) {
                         const mapped = Object.entries(data.processes).map(([name, info]: [string, any]) => ({
                             name,
                             mem: info.memory,
                             status: info.status,
                             pid: info.pid || '—'
                         }));
                         setProcessData(mapped);
                     }
                 }
             } catch (e) {
                 console.error("Failed to fetch process telemetry:", e);
             }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NexusLayout>
            <Head>
                <title>System Telemetry | AILCC</title>
            </Head>
            <div className="p-8 max-w-7xl mx-auto text-slate-200">
                <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
                            SYSTEM TELEMETRY
                        </h1>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Hardware Performance · Process Theory · Storage Intelligence</p>
                    </div>
                    <div className="font-mono text-emerald-500 text-sm">
                        {mounted ? 'ONLINE' : '...'}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Process Table */}
                    <div className="renaissance-panel p-6 bg-black/40 min-h-[400px]">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-mono text-cyan-400 uppercase">Process Monitor</h3>
                            <span className="text-xs text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
                            </span>
                        </div>
                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                                <span className="w-1/4">Process</span><span className="w-1/4 text-center">PID</span><span className="w-1/4 text-center">Mem</span><span className="w-1/4 text-right">Status</span>
                            </div>
                            {processData.length > 0 ? processData.map((data, i) => (
                                <div key={i} className="flex justify-between text-slate-300 py-1.5 border-b border-white/5 items-center">
                                    <span className="w-1/4 capitalize">{data.name.replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="text-slate-400 w-1/4 text-center">{data.pid}</span>
                                    <span className="text-cyan-400 w-1/4 text-center">{data.mem}</span>
                                    <span className={`w-1/4 text-right ${data.status === 'running' ? 'text-emerald-400' : 'text-red-400'}`}>{data.status}</span>
                                </div>
                            )) : (
                                <div className="text-slate-400 italic py-4">Initializing telemetry uplink...</div>
                            )}
                        </div>
                    </div>

                    {/* Disk Usage */}
                    <div className="space-y-6">
                        <div className="renaissance-panel p-6 bg-black/40">
                            <h3 className="font-mono text-fuchsia-400 uppercase mb-4">Storage Matrix</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white">Macintosh HD (Boot)</span>
                                        <span className="text-emerald-400">14GB / 499GB</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[96%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white">XDriveAlpha (External)</span>
                                        <span className="text-cyan-400">1.6TB / 4TB</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[40%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Intelligence (absorbed from storage.tsx) */}
                <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Storage Intelligence</h2>
                        <button
                            onClick={() => setShowStorage(prev => !prev)}
                            aria-label="Toggle storage view"
                            className="text-[10px] font-mono text-slate-400 hover:text-fuchsia-400 border border-slate-700 hover:border-fuchsia-500/30 px-3 py-1 rounded transition-all"
                        >
                            {showStorage ? 'COLLAPSE' : 'EXPAND'}
                        </button>
                    </div>
                    {showStorage && (
                        <div className="space-y-6">
                            <ErrorBoundary scope="Storage Tiers">
                                <StorageTierVisualizer />
                            </ErrorBoundary>
                            <ErrorBoundary scope="Data Flow">
                                <DataFlowVisualizer />
                            </ErrorBoundary>
                            <ErrorBoundary scope="File Finder">
                                <IntelligentFileFinder />
                            </ErrorBoundary>
                        </div>
                    )}
                </div>

            </div>
        </NexusLayout>
    );
}
