import React from 'react';
import { Mail, Shield, AlertTriangle, Filter, ExternalLink, Hash } from 'lucide-react';

interface EmailSignal {
    id: string;
    account_id: string;
    subject: string;
    sender: string;
    received_date: string;
    aois: string[];
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    snippet: string;
}

export const EmailIntelligencePanel: React.FC = () => {
    // Mock data for initial presentation
    const mockSignals: EmailSignal[] = [
        {
            id: "1",
            account_id: "primary_work",
            subject: "Update on AILCC PRIME Migration",
            sender: "Lead Architect",
            received_date: new Date().toISOString(),
            aois: ["AILCC_PRIME", "Infrastructure"],
            priority: "HIGH",
            snippet: "The migration of the hot storage tier is 80% complete. Please review the final transition protocols..."
        },
        {
            id: "2",
            account_id: "academic",
            subject: "Urgent: Bioindicator Lab Results",
            sender: "Dr. Aris",
            received_date: new Date().toISOString(),
            aois: ["Bioindicators", "HACCP"],
            priority: "CRITICAL",
            snippet: "The latest samples from sector 7 show significant deviation. Urgent review required for ISO standards compliance..."
        }
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/50';
            case 'HIGH': return 'text-amber-400 bg-amber-400/10 border-amber-400/50';
            case 'MEDIUM': return 'text-blue-400 bg-blue-400/10 border-blue-400/50';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/50';
        }
    };

    return (
        <div className="renaissance-panel flex flex-col h-full bg-slate-900/40 border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/60">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Intelligence
                </h3>
                <div className="flex gap-2">
                    <button title="Filter accounts" className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button title="Global registry" className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {mockSignals.map((signal) => (
                    <div key={signal.id} className="group relative p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate group-hover:whitespace-normal">
                                    {signal.subject}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                                    <span>{signal.sender}</span>
                                    <span>•</span>
                                    <span>{signal.account_id}</span>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(signal.priority)}`}>
                                {signal.priority}
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                            {signal.snippet}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {signal.aois.map((aoi) => (
                                <span key={aoi} className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-950/30 text-cyan-400 text-[10px] font-mono border border-cyan-400/20 rounded">
                                    <Hash className="w-3 h-3" /> {aoi}
                                </span>
                            ))}
                        </div>

                        {signal.priority === 'CRITICAL' && (
                            <div className="mt-3 p-2 bg-red-950/20 border border-red-900/30 rounded flex items-center gap-2 text-[10px] text-red-300">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span>PROACTIVE TASK CREATED IN PROTOCOL STREAM</span>
                            </div>
                        )}
                    </div>
                ))}

                {mockSignals.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                        <Shield className="w-10 h-10 opacity-20" />
                        <span className="text-sm font-mono tracking-widest">AWAITING INTELLIGENCE</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailIntelligencePanel;
