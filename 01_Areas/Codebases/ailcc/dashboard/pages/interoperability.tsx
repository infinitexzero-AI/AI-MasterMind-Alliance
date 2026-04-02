import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import ClipboardHistory from '../components/ClipboardHistory';
import HardwareInteropAudit from '../components/HardwareInteropAudit';

/* ─── Types ─── */
interface AgentStatus {
    name: string;
    role: string;
    platform: string;
    status: 'connected' | 'idle' | 'listening' | 'standby' | 'offline';
    lastSeen: string;
    capabilities: string[];
    color: string;
}

interface OpenClawSkill {
    name: string;
    icon: string;
    status: string;
    requirements?: string;
}

/* ─── Alliance Agents Data ─── */
const ALLIANCE_AGENTS: AgentStatus[] = [
    { name: 'Antigravity', role: 'Primary Architect', platform: 'Gemini', status: 'connected', lastSeen: 'now', capabilities: ['Code Gen', 'System Design', 'File Ops', 'Research'], color: 'from-cyan-500 to-blue-500' },
    { name: 'Comet', role: 'Browser Orchestrator', platform: 'Custom', status: 'idle', lastSeen: '2m ago', capabilities: ['Browser Automation', 'UI Testing', 'Screenshot'], color: 'from-orange-500 to-red-500' },
    { name: 'Grok Desktop', role: 'Deep Reasoning', platform: 'xAI', status: 'connected', lastSeen: 'now', capabilities: ['Analysis', 'Code Review', 'Planning'], color: 'from-amber-500 to-yellow-500' },
    { name: 'Grok', role: 'Strategic Sentience', platform: 'xAI', status: 'listening', lastSeen: '5m ago', capabilities: ['Forecasting', 'Trend Analysis', 'Rapid Proto'], color: 'from-purple-500 to-fuchsia-500' },
    { name: 'ChatGPT', role: 'Knowledge Synthesis', platform: 'OpenAI', status: 'standby', lastSeen: '15m ago', capabilities: ['Research', 'Writing', 'Data Processing'], color: 'from-emerald-500 to-green-500' },
    { name: 'Perplexity', role: 'Research Scout', platform: 'Perplexity AI', status: 'standby', lastSeen: '30m ago', capabilities: ['Web Search', 'Fact Check', 'Citation'], color: 'from-indigo-500 to-violet-500' },
    { name: 'OpenClaw', role: 'Self-Improvement Agent', platform: 'OpenClaw', status: 'offline', lastSeen: '1h ago', capabilities: ['Filesystem', 'Browser', 'Shell', 'Cron'], color: 'from-rose-500 to-pink-500' },
];


/* ─── Status dot ─── */
function AgentStatusDot({ status }: { status: AgentStatus['status'] }) {
    const styles: Record<string, string> = {
        connected: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse',
        idle: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)]',
        listening: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.4)] animate-pulse',
        standby: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]',
        offline: 'bg-slate-600',
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${styles[status] || styles.offline}`} />;
}

/* ─── Agent Card ─── */
function AgentCard({ agent }: { agent: AgentStatus }) {
    return (
        <div className="renaissance-panel bg-black/40 p-4 hover:bg-white/5 transition-colors group relative overflow-hidden">
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${agent.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <AgentStatusDot status={agent.status} />
                        {agent.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{agent.role}</p>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${agent.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
                    agent.status === 'listening' ? 'bg-purple-500/20 text-purple-400' :
                        agent.status === 'idle' ? 'bg-cyan-500/20 text-cyan-400' :
                            agent.status === 'standby' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-500/20 text-slate-400'
                    }`}>{agent.status}</span>
            </div>

            <div className="text-[10px] text-slate-400 mb-2">
                <span className="text-slate-400">Platform:</span> {agent.platform} · <span className="text-slate-400">Last:</span> {agent.lastSeen}
            </div>

            <div className="flex flex-wrap gap-1">
                {agent.capabilities.map(cap => (
                    <span key={cap} className="text-[9px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                        {cap}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function InteroperabilityPage() {
    const [mounted, setMounted] = useState(false);
    const [openclawSkills, setOpenclawSkills] = useState<OpenClawSkill[]>([]);
    const [openclawVersion, setOpenclawVersion] = useState<string | null>(null);
    const [activeAgents, setActiveAgents] = useState(ALLIANCE_AGENTS);

    useEffect(() => {
        setMounted(true);

        // Fetch OpenClaw status
        fetch('/api/system/openclaw-status')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setOpenclawSkills(data.skills?.entries || []);
                    setOpenclawVersion(data.version);
                    // Update OpenClaw agent status
                    setActiveAgents(prev => prev.map(a =>
                        a.name === 'OpenClaw' ? { ...a, status: data.gatewayOnline ? 'connected' : 'offline' } : a
                    ));
                }
            })
            .catch(() => { });
    }, []);

    if (!mounted) return <NexusLayout><div className="p-8 text-slate-400">Establishing interoperability mesh...</div></NexusLayout>;

    const onlineCount = activeAgents.filter(a => a.status !== 'offline' && a.status !== 'standby').length;

    return (
        <NexusLayout>
            <Head><title>Interoperability | AILCC</title></Head>
            <div className="p-4 lg:p-8 max-w-[1920px] mx-auto text-slate-200 space-y-8">

                {/* Header */}
                <header className="border-b border-white/10 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 mb-2">
                            INTEROPERABILITY
                        </h1>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Cross-Platform Alliance · Agent Mesh · Capability Sync</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400">{onlineCount}/{activeAgents.length} ONLINE</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                </header>

                {/* ── Row 1: Alliance Agent Matrix ── */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 pl-4 border-l-4 border-fuchsia-500">Alliance Agent Matrix</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {activeAgents.map(agent => (
                            <AgentCard key={agent.name} agent={agent} />
                        ))}
                    </div>
                </section>

                {/* ── Row 2: Hardware Awareness & Sync ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HardwareInteropAudit />
                    <ClipboardHistory />
                </div>

                {/* ── Row 3: Skills & Capacity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* OpenClaw Skills Dashboard */}
                    <div className="renaissance-panel p-6 bg-black/40">
                        <h3 className="font-mono text-fuchsia-400 uppercase text-sm mb-4 flex items-center gap-2">
                            🦞 OpenClaw Skills Registry
                            {openclawVersion && <span className="text-[10px] text-slate-400 font-normal">v{openclawVersion}</span>}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {openclawSkills.length > 0 ? openclawSkills.slice(0, 14).map(skill => (
                                <div key={skill.name} className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono ${skill.status === 'ready'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-500/10 border-slate-700 text-slate-400'
                                    }`}>
                                    <span>{skill.icon || '📦'}</span>
                                    <span className="truncate">{skill.name}</span>
                                    {skill.status === 'ready' && <span className="ml-auto text-[8px] text-emerald-500">✓</span>}
                                </div>
                            )) : (
                                <div className="col-span-2 text-center text-slate-400 py-4 italic text-xs">Loading skill inventory...</div>
                            )}
                        </div>
                        {openclawSkills.length > 14 && (
                            <div className="mt-2 text-center text-[10px] text-slate-400 font-mono">
                                +{openclawSkills.length - 14} more skills
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Row 3: API Key Vault + Capability Overview ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* API Key Vault Status */}
                    <div className="renaissance-panel p-6 bg-black/40">
                        <h3 className="font-mono text-amber-400 uppercase text-sm mb-4">🔐 Provider Vault</h3>
                        <div className="space-y-3">
                            {[
                                { name: 'OpenAI', configured: true, model: 'gpt-4o-mini' },
                                { name: 'xAI', configured: true, model: 'grok-2-1212' },
                                { name: 'xAI (Grok)', configured: true, model: 'grok-2' },
                                { name: 'Perplexity', configured: false, model: null },
                                { name: 'Linear', configured: true, model: 'API' },
                                { name: 'GitHub', configured: true, model: 'API' },
                            ].map(prov => (
                                <div key={prov.name} className="flex items-center justify-between py-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${prov.configured ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                        <span className="text-xs text-slate-300">{prov.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono ${prov.configured ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {prov.configured ? prov.model || 'CONFIGURED' : 'NOT SET'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Capability Matrix */}
                    <div className="renaissance-panel p-6 bg-black/40 col-span-1 lg:col-span-2">
                        <h3 className="font-mono text-indigo-400 uppercase text-sm mb-4">Capability Coverage Matrix</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] font-mono">
                                <thead>
                                    <tr className="text-slate-400 border-b border-white/5">
                                        <th className="text-left py-2 pr-4">Capability</th>
                                        {activeAgents.slice(0, 5).map(a => (
                                            <th key={a.name} className="text-center px-2 py-2">{a.name.slice(0, 6)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Code Gen', 'Browser', 'Research', 'Analysis', 'Shell', 'File Ops', 'Forecasting', 'UI Testing'].map(cap => (
                                        <tr key={cap} className="border-b border-white/5">
                                            <td className="py-1.5 pr-4 text-slate-400">{cap}</td>
                                            {activeAgents.slice(0, 5).map(a => (
                                                <td key={a.name} className="text-center px-2">
                                                    {a.capabilities.some(c => c.toLowerCase().includes(cap.toLowerCase().split(' ')[0])) ? (
                                                        <span className="text-emerald-400">●</span>
                                                    ) : (
                                                        <span className="text-slate-700">○</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </NexusLayout>
    );
}
