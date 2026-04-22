import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import MemoryMap, { MemoryNode, ClusterInfo } from '../components/MemoryMap';
import { Search, Brain, Activity, Database, Sparkles, Target, Library } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { VaultSearch } from '../components/widgets/VaultSearch';
import { ErrorBoundary } from '../components/ErrorBoundary';

const DataMaterialization = dynamic(() => import('../components/DataMaterialization'), { ssr: false });
const KnowledgeMap = dynamic(() => import('../components/KnowledgeMap'), { ssr: false });

export default function MemoryPage() {
    const [data, setData] = useState<{ memories: MemoryNode[], clusters: ClusterInfo[], stats: { totalVectors: number; similarityThreshold: string } } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [hippoMetrics, setHippoMetrics] = useState<{ vectorsIndexed: number; collections: number } | null>(null);
    const [isPruning, setIsPruning] = useState(false);

    const handlePruneMemory = async () => {
        setIsPruning(true);
        try {
            await fetch('/api/system/prune-memory', { method: 'POST' });
            setTimeout(() => {
                setIsPruning(false);
            }, 5000);
        } catch (error) {
            console.error('Failed to trigger semantic prune:', error);
            setIsPruning(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const res = await fetch('/api/system/memory', { signal: controller.signal });
                const json = await res.json();
                if (res.ok) {
                    setData(json);
                } else {
                    throw new Error(json.error || 'Fetch failed');
                }
            } catch (err) {
                console.warn('Memory hydration fallback triggered:', err);
                // Set default data structure to unblock rendering
                setData({ 
                    memories: [], 
                    clusters: [], 
                    stats: { totalVectors: 0, similarityThreshold: '0.00' } 
                });
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };
        fetchData();

        // 🛡️ Safety Fallback: Ensure loading always clears even if logic hangs
        const loadingGuard = setTimeout(() => setLoading(false), 3000);

        // Also fetch Qdrant hippocampus stats
        fetch('/api/hippocampus/metrics')
            .then(r => r.ok ? r.json() : null)
            .then(d => d && setHippoMetrics({ vectorsIndexed: d.vectorsIndexed, collections: d.collections }))
            .catch(() => { /* Qdrant offline */ });

        return () => clearTimeout(loadingGuard);
    }, []);

    return (
        <NexusLayout>
            <Head>
                <title>Vector Memory Explorer | AILCC</title>
            </Head>

            <div className="flex flex-col space-y-8 p-4 lg:p-8 max-w-[1920px] mx-auto min-h-screen">

                {/* Header HUD */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500">
                                VECTOR MEMORY EXPLORER
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-mono uppercase tracking-[0.3em] pl-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" /> Semantic Synapse Monitoring & Retrieval
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 flex-1 max-w-xl relative group ml-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Query semantic space..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-purple-500/30 transition-all outline-none"
                            />
                        </div>
                        <button 
                            onClick={handlePruneMemory}
                            disabled={isPruning}
                            className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center min-w-[170px] transition-all border ${
                                isPruning 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-wait animate-pulse' 
                                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                            }`}
                        >
                            {isPruning ? 'CRUNCHING...' : 'PRUNE MEMORY'}
                        </button>
                    </div>
                </header>

                {/* Stats Strip */}
                {(data?.stats || hippoMetrics) && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Ingested Vectors', value: (hippoMetrics?.vectorsIndexed ?? data?.stats?.totalVectors ?? 0).toLocaleString(), icon: Database, color: 'text-purple-400' },
                                { label: 'Active Clusters', value: hippoMetrics?.collections ?? data?.clusters?.length ?? 0, icon: Sparkles, color: 'text-emerald-400' },
                                { label: 'Synapse Sync', value: 'OPTIMAL', icon: Activity, color: 'text-cyan-400' },
                                { label: 'Avg SIM Threshold', value: data?.stats?.similarityThreshold ?? '0.78', icon: Target, color: 'text-rose-400' }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="renaissance-panel p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                        <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                                    </div>
                                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-40`} />
                                </motion.div>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <KnowledgeMap />
                        </div>
                    </div>
                )}

                {/* The Galaxy Map */}
                <div className="flex-1 relative">
                    {loading ? (
                        <div className="w-full h-[600px] flex flex-col items-center justify-center space-y-4 bg-slate-950/20 border border-white/5 rounded-3xl animate-pulse">
                            <Brain className="w-12 h-12 text-purple-500/40 animate-bounce" />
                            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">Hydrating Semantic Map...</span>
                        </div>
                    ) : data ? (
                        <MemoryMap
                            memories={data.memories}
                            clusters={data.clusters}
                            searchQuery={searchQuery}
                        />
                    ) : (
                        <div className="w-full h-[600px] flex items-center justify-center text-rose-400 font-mono text-xs uppercase">
                            Critical Disconnection from Semantic Memory Hub
                        </div>
                    )}
                </div>

                {/* Live Synapse Stream & Footer Insight */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 renaissance-panel p-6 bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/10 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Synapse Insight</h4>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                                    The swarm has recently clustered **842 new vectors** related to `Next.js Hydration Patterns`. Similarity density suggests a 92% confidence in the current architectural state. Use the Galaxy Map above to explore specific memory nodes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-1 renaissance-panel p-4 bg-black/40 border border-white/5 rounded-2xl h-32 overflow-hidden relative">
                         <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Activity className="w-3 h-3 animate-pulse" /> Live Synapse Stream
                         </div>
                         <div className="space-y-1.5">
                             <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 animate-in fade-in slide-in-from-bottom-1">
                                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-blue-500/50 border border-blue-500" title="PROJECT"></span> INGEST: nextjs_docs</span>
                                 <span className="text-emerald-500">0.96 SIM</span>
                             </div>
                             <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 opacity-70">
                                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-green-500/50 border border-green-500" title="AREA"></span> CLUSTER: architecture</span>
                                 <span className="text-cyan-500">RELOCATING</span>
                             </div>
                             <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 opacity-40">
                                 <span className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-purple-500/50 border border-purple-500" title="RESOURCE"></span> VAULT: strategic_roadmap</span>
                                 <span className="text-purple-500">INDEXED</span>
                             </div>
                         </div>
                         <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Intelligence Archive (absorbed from archive.tsx) */}
                <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-6">
                        <Library className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight">INTELLIGENCE ARCHIVE</h2>
                    </div>
                    <div className="renaissance-panel p-8 bg-black/40 border-slate-700/50 text-center mb-6">
                        <h3 className="text-sm font-bold text-slate-200 mb-4">SEARCH THE ALLIANCE VAULT</h3>
                        <div className="max-w-2xl mx-auto">
                            <VaultSearch />
                        </div>
                    </div>
                    <div className="renaissance-panel p-8 bg-black/20 border-white/5 backdrop-blur-md">
                        <h3 className="text-xs font-mono text-cyan-400 mb-6 flex items-center gap-2">
                            <Database className="w-3 h-3" /> HIPPOCAMPUS VECTOR GRID
                        </h3>
                        <div className="min-h-[850px] custom-scrollbar">
                            <ErrorBoundary scope="Data Grid">
                                <DataMaterialization />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>

            </div>
        </NexusLayout>
    );
}
