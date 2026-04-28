import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { Card } from '../components/ui/Card';
import { Landmark, TrendingDown, AlertOctagon, ShieldCheck, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

import financeData from '../../hippocampus_storage/finance_metrics.json';

export default function FinancesDomain() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Reading directly from the hippocampus storage
    setMetrics(financeData.burn_rate);
  }, []);

  return (
    <NexusLayout>
      <Head>
        <title>Financial Command | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-emerald-400 flex items-center gap-3 drop-shadow-lg">
                    <Landmark className="w-8 h-8" /> Financial Command Center
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Vanguard Resolution Node • Epoch 35
                </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest px-2 group-hover:animate-pulse">System Optimized • Resolution Locked</span>
            </div>
        </div>

        {/* THE 3-YEAR MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 2023 */}
            <Panel title="2023 Audit" icon={<FileText className="w-4 h-4 text-slate-400" />} className="bg-slate-900/50 border-slate-800">
                <div className="flex justify-between items-baseline mb-4">
                    <span className="text-2xl font-black text-slate-500">2023</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">FILED & SETTLED</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                        <span className="text-xs text-slate-400">Gross Revenue (Line 13699)</span>
                        <span className="font-mono font-bold">$156,037</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                        <span className="text-xs text-slate-400">Net Profit (Line 13500)</span>
                        <span className="font-mono font-bold text-emerald-400">+$49,388</span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border-l-2 border-slate-600">
                        <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Audit Baseline</h4>
                        <div className="flex justify-between text-xs font-mono"><span className="text-slate-500">Contractors</span><span>$33,531</span></div>
                        <div className="flex justify-between text-xs font-mono mt-1"><span className="text-slate-500">Grant (Income)</span><span>$5,997</span></div>
                    </div>
                </div>
            </Panel>

            {/* 2024 */}
            <Panel title="2024 Filing" icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 border-emerald-500/30">
                <div className="flex justify-between items-baseline mb-4">
                    <span className="text-2xl font-black text-emerald-500/50">2024</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">NOA VERIFIED</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                        <span className="text-xs text-slate-400">Gross Professional (NOA)</span>
                        <span className="font-mono font-bold">$134,986</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-900/30 pb-2">
                        <span className="text-xs text-slate-400">Actual Net Profit</span>
                        <span className="font-mono font-bold text-emerald-400">+$34,308</span>
                    </div>
                    <div className="mt-4 p-3 bg-emerald-900/10 rounded-lg border-l-2 border-emerald-500">
                        <h4 className="text-[10px] uppercase tracking-widest text-emerald-500 mb-2">TurboTax Fields</h4>
                        <div className="flex justify-between text-xs font-mono"><span className="text-slate-500">Line 13699</span><span>$134,986</span></div>
                        <div className="flex justify-between text-xs font-mono mt-1"><span className="text-slate-500">Line 15000</span><span>$34,308</span></div>
                        <div className="flex justify-between text-xs font-mono mt-1"><span className="text-slate-500">Balance Owing</span><span className="text-emerald-400">$751.54</span></div>
                    </div>
                </div>
            </Panel>

            {/* 2025 */}
            <Panel title="2025 Reconstructed" icon={<TrendingDown className="w-4 h-4 text-amber-400" />} className="bg-slate-900/50 border-amber-500/30">
                <div className="flex justify-between items-baseline mb-4">
                    <span className="text-2xl font-black text-amber-500/50">2025</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-1 rounded">RECONSTRUCTED</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-amber-900/30 pb-2">
                        <span className="text-xs text-slate-400">Est. Gross Revenue</span>
                        <span className="font-mono font-bold">$90,311</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-900/30 pb-2">
                        <span className="text-xs text-slate-400">Net Fiscal (Loss)</span>
                        <span className="font-mono font-bold text-rose-400">-$10,682</span>
                    </div>
                    <div className="mt-4 p-3 bg-amber-900/10 rounded-lg border-l-2 border-amber-500">
                        <h4 className="text-[10px] uppercase tracking-widest text-amber-500 mb-2">2025 Prep Guide</h4>
                        <div className="flex justify-between text-xs font-mono"><span className="text-slate-500">Subcontractors</span><span>$93,410</span></div>
                        <div className="flex justify-between text-xs font-mono mt-1"><span className="text-slate-500">Bank Fees/NSF</span><span>$1,770</span></div>
                        <div className="flex justify-between text-xs font-mono mt-1"><span className="text-slate-500">Loss Carry-Back</span><span className="text-emerald-400">ELIGIBLE</span></div>
                    </div>
                </div>
            </Panel>

        </div>

        {/* ACTION CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Resolution Playbook" icon={<AlertOctagon className="w-4 h-4 text-rose-400" />}>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-4">
                    <p className="text-xs text-rose-400 font-mono tracking-wide">
                        <strong>CRITICAL RECOVERY TARGET:</strong> The 2025 Net Loss (-$10.6k) can be applied to 2024 via Form T1A to trigger a tax refund.
                    </p>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Upload Federal Rebuttal to CRA Portal.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Email Piecework Agreements to PETL NB.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Finalize SFS Submission with 2024 NOA.</li>
                </ul>
            </Panel>

            <Panel title="Live Burn Rate (Daemon)" icon={<DollarSign className="w-4 h-4 text-emerald-400" />}>
                {metrics ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-black/40 border-slate-800 p-4">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Monthly Burn Rate</span>
                                <span className="text-xl font-mono text-white">${metrics.burn_rate.toFixed(2)}</span>
                            </Card>
                            <Card className="bg-black/40 border-slate-800 p-4">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Net Remaining</span>
                                <span className="text-xl font-mono text-emerald-400">${metrics.net.toFixed(2)}</span>
                            </Card>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono text-center mt-4">
                            Drop CSVs into Finance_Hub/Raw_Statements to update telemetry.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-xs font-mono text-slate-500 animate-pulse">Awaiting Bank Telemetry...</span>
                    </div>
                )}
            </Panel>
        </div>

      </div>
    </NexusLayout>
  );
}
