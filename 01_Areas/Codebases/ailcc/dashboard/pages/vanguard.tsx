import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { StatusPill } from '../components/ui/StatusPill';
import { 
    Shield, 
    Scale, 
    GraduationCap, 
    FileText, 
    AlertTriangle, 
    Clock, 
    Zap,
    TrendingDown,
    Activity
} from 'lucide-react';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VanguardOperations() {
    const { data: vanguardData, error } = useSWR('/api/vanguard/data', fetcher, { refreshInterval: 5000 });

    if (error) return (
        <NexusLayout>
            <div className="flex h-full items-center justify-center p-20">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto opacity-50 mb-2" />
                    <h1 className="text-xl font-bold tracking-widest text-rose-400 uppercase">Tactical Link Severed</h1>
                    <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">Failed to retrieve Vanguard tactical data from local vault.</p>
                </div>
            </div>
        </NexusLayout>
    );

    if (!vanguardData) return (
        <NexusLayout>
            <div className="flex h-full items-center justify-center p-20">
                <div className="text-center space-y-4 animate-pulse">
                    <Shield className="w-16 h-16 text-cyan-500 mx-auto opacity-50 mb-2" />
                    <h1 className="text-xl font-bold tracking-widest text-cyan-400 uppercase">Synchronizing Vanguard...</h1>
                    <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">Uplinking with OneDrive Nexus Tactical Store.</p>
                </div>
            </div>
        </NexusLayout>
    );

    return (
        <NexusLayout>
            <Head>
                <title>Vanguard Ops | NEXUS</title>
            </Head>

            <div className="w-full flex flex-col gap-8 max-w-[95rem] mx-auto p-4 lg:p-8 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                            Vanguard Operations
                        </h1>
                        <p className="font-mono text-[10px] text-cyan-400/80 tracking-[0.3em] uppercase mt-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            Fiscal & Legal Triage Matrix // Phase 2: Restoration
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-[9px] text-rose-400 font-mono uppercase tracking-widest font-bold">Risk Level</span>
                            <span className="text-lg font-black text-white">CRITICAL</span>
                        </div>
                        <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-bold">Funding Gap</span>
                            <span className="text-lg font-black text-white">$6,106</span>
                        </div>
                    </div>
                </div>

                {/* Primary Tactical Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Triage Matrix & Fiscal Snapshot */}
                    <div className="xl:col-span-4 flex flex-col gap-8">
                        
                        {/* 2x2 Eisenhower Matrix (Tactical) */}
                        <Panel title="Tactical Triage Matrix" icon={<Zap className="w-4 h-4 text-amber-400" />}>
                            <div className="grid grid-cols-2 gap-3 aspect-square">
                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-rose-500/60 transition-all">
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Urgent / Important</span>
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-white">CRA Rebuttal</p>
                                        <p className="text-[11px] font-bold text-white">PETL Defense</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    </div>
                                </div>
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-cyan-500/60 transition-all">
                                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Not Urgent / Important</span>
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-white">SFS Summer 2026</p>
                                        <p className="text-[11px] font-bold text-white">TurboTax 2025</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Clock className="w-4 h-4 text-cyan-500" />
                                    </div>
                                </div>
                                <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-white/20 transition-all">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Urgent / Not Important</span>
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-slate-400">RBC CSV Sync</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Zap className="w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-white/20 transition-all">
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Not Urgent / Not Important</span>
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-slate-600">Old Archive Audit</p>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-50 transition-opacity">
                                        <FileText className="w-4 h-4 text-slate-700" />
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        {/* Fiscal Recovery Panel */}
                        <Panel title="Fiscal Shield (Loss Carry-Back)" icon={<TrendingDown className="w-4 h-4 text-emerald-400" />}>
                            <div className="space-y-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">2025 Projected Loss</span>
                                        <span className="text-xl font-black text-white">$26,294</span>
                                    </div>
                                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[100%]" />
                                    </div>
                                    <p className="text-[10px] text-emerald-500/60 mt-2 font-mono uppercase">Targeting 2023 Tax Refund via Carry-Back</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-800/60 p-3 rounded-lg border border-white/5">
                                        <span className="text-[9px] text-slate-500 uppercase block mb-1">2023 Profit</span>
                                        <span className="text-sm font-bold text-white">$31,683</span>
                                    </div>
                                    <div className="bg-slate-800/60 p-3 rounded-lg border border-white/5">
                                        <span className="text-[9px] text-slate-500 uppercase block mb-1">Net Refund Pot.</span>
                                        <span className="text-sm font-bold text-emerald-400">MAXIMIZED</span>
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Active Defense Log" icon={<Activity className="w-4 h-4 text-blue-400" />}>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="bg-blue-500/5 border-l-2 border-blue-500 p-3 rounded-r-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">CRA Portal</span>
                                        <span className="text-[9px] font-mono text-slate-500">PENDING</span>
                                    </div>
                                    <p className="text-xs text-slate-200">Rebuttal text prepared in local vault.</p>
                                </div>
                                <div className="bg-emerald-500/5 border-l-2 border-emerald-500 p-3 rounded-r-lg opacity-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">PETL Email</span>
                                        <span className="text-[9px] font-mono text-emerald-500">SENT</span>
                                    </div>
                                    <p className="text-xs text-slate-200">Piecework Agreements attached.</p>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* RIGHT COLUMN: Mission Manifest (Markdown Rendering) */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        
                        <Panel 
                            title="Mission Triage Manifest" 
                            icon={<FileText className="w-4 h-4 text-indigo-400" />}
                            className="flex-1"
                        >
                            <div className="prose prose-invert prose-sm max-w-none bg-slate-900/60 p-8 rounded-2xl border border-white/5 font-sans h-full overflow-y-auto custom-scrollbar">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {vanguardData.manifest || "## No active manifest detected."}
                                </ReactMarkdown>
                            </div>
                        </Panel>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Panel title="CRA Rebuttal Draft" icon={<Scale className="w-4 h-4 text-rose-400" />}>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 leading-relaxed max-h-[200px] overflow-y-auto">
                                    {vanguardData.dashboard ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {vanguardData.dashboard}
                                        </ReactMarkdown>
                                    ) : "Awaiting draft synchronization..."}
                                </div>
                            </Panel>

                            <Panel title="Academic Shield" icon={<GraduationCap className="w-4 h-4 text-indigo-400" />}>
                                <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-2xl flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                                            <GraduationCap className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Summer 2026 PIF</h4>
                                            <p className="text-indigo-400/60 text-[10px] font-mono uppercase mt-1">Registrar Signature Required</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <StatusPill status="critical" label="URGENT" />
                                        <StatusPill status="active" label="DRAFT READY" />
                                    </div>
                                    <button className="w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 rounded-xl text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
                                        Trigger Registrar Handshake
                                    </button>
                                </div>
                            </Panel>
                        </div>
                    </div>

                </div>
            </div>

            {/* Vanguard CSS Overrides */}
            <style jsx global>{`
                .prose h1, .prose h2, .prose h3 {
                    color: white;
                    letter-spacing: -0.025em;
                    font-weight: 800;
                    text-transform: uppercase;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 0.5rem;
                }
                .prose p {
                    color: rgba(255,255,255,0.7);
                    font-family: 'Inter', sans-serif;
                }
                .prose li {
                    color: rgba(255,255,255,0.8);
                }
                .prose strong {
                    color: #22d3ee;
                }
                .prose hr {
                    border-color: rgba(255,255,255,0.05);
                }
            `}</style>
        </NexusLayout>
    );
}
