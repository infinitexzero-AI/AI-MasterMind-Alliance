import React from 'react';
import { DashboardCard } from '../ui/DashboardCard';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileText, Activity } from 'lucide-react';

interface AuditMetrics {
    tax_status: {
        cra_payroll_assessment: number;
        non_capital_loss_carry_back: number;
        dispute_status: string;
        audit_risk: string;
    };
    forensic_metrics: {
        nsf_count: number;
        coinbase_throughput: number;
    };
}

export const AuditDefenseHUD: React.FC = () => {
    const [data, setData] = React.useState<AuditMetrics | null>(null);

    React.useEffect(() => {
        const fetchAudit = async () => {
            const res = await fetch('/api/finance');
            if (res.ok) setData(await res.json());
        };
        fetchAudit();
        const interval = setInterval(fetchAudit, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return <div className="h-48 animate-pulse bg-slate-900/50 rounded-2xl border border-white/5" />;

    const { tax_status, forensic_metrics } = data;
    const riskScore = tax_status.audit_risk === 'CRITICAL' ? 94 : 45;

    return (
        <DashboardCard
            title="CRA Audit Defense Matrix"
            subtitle="Forensic Compliance & Risk Mitigation"
            headerAction={
                <div className="flex items-center gap-2">
                    <div className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                        RISK: {tax_status.audit_risk}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Risk Gauge */}
                <div className="relative pt-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Defense Integrity</span>
                        <span className="text-xs font-black text-white">{100 - riskScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - riskScore}%` }}
                            className="h-full bg-rose-500"
                        />
                    </div>
                </div>

                {/* Active Assessments */}
                <div className="space-y-2">
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-white leading-none">CRA Payroll Assessment</span>
                            </div>
                            <span className="text-[10px] font-black text-rose-400">
                                ${tax_status.cra_payroll_assessment.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] text-slate-500 font-mono uppercase">Account Closed Oct 2023</span>
                            <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                                <AlertTriangle size={8} />
                                DISPUTED
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-white leading-none">Non-Capital Loss Carry-Back</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-400">
                                ${tax_status.non_capital_loss_carry_back.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] text-slate-500 font-mono uppercase">Trigger via NETFILE</span>
                            <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                <Activity size={8} />
                                PENDING
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forensic Triggers */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                        <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">NSF Alerts</div>
                        <div className="text-sm font-black text-rose-400 italic">{forensic_metrics.nsf_count} Events</div>
                    </div>
                    <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                        <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Crypto Velocity</div>
                        <div className="text-sm font-black text-cyan-400 italic">${(forensic_metrics.coinbase_throughput / 1000).toFixed(1)}k</div>
                    </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10 group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                        <Shield size={12} className="text-indigo-400" />
                        <div className="flex-1">
                            <div className="text-[8px] text-indigo-300 font-bold uppercase tracking-widest">Next Critical Step</div>
                            <div className="text-[10px] text-white font-medium">Submit Payroll Closure Confirmation</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};
