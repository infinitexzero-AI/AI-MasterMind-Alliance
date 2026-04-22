import React, { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import NexusLayout from '../components/NexusLayout';
import { useAuth } from '../src/contexts/AuthContext';
import { Briefcase, Activity, Code, ChevronRight, Mail, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CareerNexus() {
    const { hasAccess } = useAuth();
    const { data: jobs, error, mutate } = useSWR('/api/career', fetcher, { refreshInterval: 5000 });
    const [selectedJob, setSelectedJob] = useState<any>(null);

    if (!hasAccess('career')) return null;

    const isLoading = !jobs && !error;

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/career', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: status })
        });
        mutate();
        if (selectedJob?.id === id) {
            setSelectedJob({ ...selectedJob, status });
        }
    };

    return (
        <NexusLayout>
            <Head><title>Sprint 10 | Career Nexus</title></Head>
            <div className="w-full h-full p-4 lg:p-6 flex flex-col gap-6 max-w-[1600px] mx-auto overflow-hidden">
                <div className="flex justify-between items-end border-b border-indigo-500/20 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-indigo-400" /> Career Nexus
                        </h1>
                        <p className="font-mono text-xs text-indigo-300/60 uppercase tracking-[0.2em] mt-2">Autonomous Opportunity Routing & MedTech Exploitation</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-2 px-4 shadow-inner flex items-center gap-3">
                            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <span className="text-xs font-mono tracking-widest uppercase text-slate-300">
                                Active Bounties: <span className="text-indigo-400">{jobs?.length || 0}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 min-h-0">
                    {/* Master List Panel */}
                    <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center text-indigo-500/50 uppercase font-mono tracking-[0.2em] text-xs">
                                <Activity className="w-4 h-4 mr-2 animate-spin" /> Scanning Vault...
                            </div>
                        ) : jobs?.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-600 uppercase font-mono tracking-[0.2em] text-xs border border-dashed border-slate-800 rounded-xl">
                                No Active Target Vectors. Run career_hunter_daemon.py
                            </div>
                        ) : (
                            jobs?.map((job: any) => (
                                <button
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className={clsx(
                                        "w-full text-left p-4 rounded-xl border transition-all duration-300 backdrop-blur-sm group flex flex-col gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)]",
                                        selectedJob?.id === job.id 
                                            ? "bg-indigo-900/30 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)] translate-x-1" 
                                            : "bg-[#030712]/50 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition-colors w-3/4">{job.title}</h3>
                                        {job.status === 'APPLIED' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                        {job.status === 'DRAFTED' && <Clock className="w-4 h-4 text-amber-500 shrink-0" />}
                                    </div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Code className="w-3 h-3 text-cyan-500" /> {job.company}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Syntax / Curation Details Panel */}
                    <div className="flex-1 rounded-2xl border border-indigo-500/20 bg-[#030712]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col">
                        {!selectedJob ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 select-none">
                                <Briefcase className="w-32 h-32 text-indigo-500/20 mb-6" />
                                <p className="font-mono text-sm tracking-[0.3em] uppercase text-indigo-300">Standby: Awaiting Target Lock</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                                {/* Details Header */}
                                <div className="p-6 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-900/20 to-transparent">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={clsx(
                                                    "px-2 py-1 text-[9px] font-mono tracking-widest uppercase rounded",
                                                    selectedJob.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                )}>
                                                    Status: {selectedJob.status}
                                                </span>
                                                <span className="text-xs font-mono text-slate-500">{new Date(selectedJob.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h2 className="text-3xl font-bold tracking-tight text-white">{selectedJob.title}</h2>
                                            <p className="text-indigo-400 font-mono text-sm uppercase tracking-widest mt-1 flex items-center gap-2">
                                                <ChevronRight className="w-4 h-4" /> {selectedJob.company}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedJob.status !== 'APPLIED' && (
                                                <button 
                                                    onClick={() => updateStatus(selectedJob.id, 'APPLIED')}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Mark Applied
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex gap-6">
                                    <div className="w-1/3 flex flex-col gap-4">
                                        <h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Target JD Vector</h3>
                                        <p className="text-xs text-slate-300/80 leading-relaxed font-sans whitespace-pre-wrap">{selectedJob.description}</p>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col gap-4 border-l border-white/5 pl-6">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <h3 className="font-mono text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-400" /> Auto-Forged Cover Letter (LLaMA3)
                                            </h3>
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(selectedJob.cover_letter)}
                                                className="text-[10px] text-slate-400 hover:text-white uppercase font-mono"
                                            >
                                                [ Copy ]
                                            </button>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-xl border border-emerald-500/10 shadow-inner h-full overflow-y-auto custom-scrollbar">
                                            <p className="text-[13px] text-emerald-100/90 leading-loose font-serif whitespace-pre-wrap">
                                                {selectedJob.cover_letter}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}
