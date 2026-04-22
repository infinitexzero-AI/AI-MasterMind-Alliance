import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, XCircle, RotateCw } from 'lucide-react';

interface SingularityProposal {
    id: string;
    timestamp: string;
    objective: string;
    reasoning: string;
    primaryAgent: string;
    status: string;
}

export const SingularityReviewPanel = () => {
    const [proposals, setProposals] = useState<SingularityProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/system/proposals');
            const data = await res.json();
            if (data.proposals) {
                setProposals(data.proposals);
            }
        } catch (error) {
            console.error('Failed to load Singularity payloads', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    return (
        <div className="bg-slate-900/60 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-fuchsia-400" />
                        Singularity Architecture Queue
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Reviewing Mode 6 JSON Payloads from the Daemon Engine.</p>
                </div>
                <button 
                    onClick={fetchProposals}
                    className="p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition"
                    title="Refresh Node"
                >
                    <RotateCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin text-fuchsia-400' : ''}`} />
                </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {proposals.length === 0 && !isLoading && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-10 text-slate-500 text-sm font-mono">
                            // NO PENDING PROPOSALS INTERCEPTED
                        </motion.div>
                    )}
                    {proposals.map((proposal) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-800/80 rounded-xl border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all p-4 shadow-[0_4px_20px_rgba(217,70,239,0.05)]"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-fuchsia-500/10 text-[10px] font-bold text-fuchsia-400 tracking-wider">
                                            {proposal.id.split('-')[1] || 'EPOCH 39'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {new Date(proposal.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white">{proposal.objective}</h3>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${proposal.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {proposal.status}
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-400 mb-4 pl-3 border-l-[2px] border-slate-700">
                                {proposal.reasoning}
                            </p>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                                    <BrainCircuit className="w-3 h-3" />
                                    {proposal.primaryAgent}
                                </span>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-bold">
                                        <XCircle className="w-3.5 h-3.5" /> REJECT
                                    </button>
                                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> MERGE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
