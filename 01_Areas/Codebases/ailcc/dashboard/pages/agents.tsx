import React, { useState } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { AgentMonitor } from '../components/AgentMonitor';
import { useAgentStatus } from '../components/hooks/useAgentStatus';
import { Agent } from '../types/DashboardInterfaces';
import { SkeletonAgentCard } from '../components/SkeletonLoaders';

import { AgentGovernance } from '../components/AgentGovernance';
import { AirtableHub } from '../components/AirtableHub';
import { AgentDetailModal } from '../components/AgentDetailModal';

export default function AgentsPage() {
  const { agents, loading, error } = useAgentStatus(); // Hooks into /api/forge/agents
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Mock fallback if API is down, just like in AgentPanel for robustness
  const fallbackAgents: Agent[] = [
    { id: 'grok', name: 'GROK-JUDGE', role: 'Strategic Advisory', status: 'IDLE', currentTask: 'Analyzing System Logs', currentBucket: 'PROJECT', costSession: 0.12, skills: ['Log Analysis', 'Logic Synthesis', 'Advisory'], significance: 85, throughput: 65 },
    { id: 'comet', name: 'COMET-SCOUT', role: 'Browser Research', status: 'IDLE', currentTask: 'Standby', currentBucket: 'RESOURCE', costSession: 0.05, skills: ['Search', 'Scraping', 'Browser'], significance: 10, throughput: 5 },
    { id: 'gemini', name: 'GEMINI-CRAFT', role: 'Code Optimization', status: 'IDLE', currentTask: 'PR Generation Logic', currentBucket: 'PROJECT', costSession: 0.08, skills: ['Optimization', 'Refactoring', 'C'], significance: 92, throughput: 95 },
    { id: 'grok-arch', name: 'GROK-ARCH', role: 'Logic Synthesis', status: 'IDLE', currentTask: 'Structuring Manifest', currentBucket: 'AREA', costSession: 0.02, skills: ['Architecture', 'Logic', 'Documentation'], significance: 45, throughput: 30 },
    { id: 'valentine', name: 'VALENTINE', role: 'Aesthetic UX', status: 'IDLE', currentTask: 'Theme Generation', currentBucket: 'PROJECT', costSession: 0.01, skills: ['Design', 'CSS', 'Framer Motion'], significance: 75, throughput: 88 },
    { id: 'antigravity', name: 'ANTIGRAVITY', role: 'System Bridge', status: 'EXECUTING', currentTask: 'Orchestrating Swarm', currentBucket: 'AREA', costSession: 0.00, skills: ['Orchestration', 'Shell', 'Browser'], significance: 100, throughput: 100 }
  ];

  const displayAgents = (agents.length === 0 && error) ? fallbackAgents : agents;

  return (
    <NexusLayout>
      <Head>
        <title>Agents | Swarm Command</title>
      </Head>
      <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter uppercase">Swarm Command</h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Real-time status & security governance of autonomous executors</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Monitor */}
          <div className="col-span-1 xl:col-span-8 renaissance-panel p-6 min-h-[600px] border border-slate-700/30">
            <h2 className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] mb-6">Active Roster Telemetry</h2>
            {loading && displayAgents.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <SkeletonAgentCard key={i} />)}
              </div>
            ) : (
              <AgentMonitor
                agents={displayAgents}
                onAgentSelect={(id) => setSelectedAgentId(id)}
                networkStatus={!loading && !error ? 'CONNECTED' : 'DISCONNECTED'}
              />
            )}
          </div>

          {/* Security & Settings & Execution triggers */}
          <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
            <AgentGovernance />
            <AirtableHub />
            
            {/* Vanguard Deployment Matrix */}
            <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl">
               <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest border-b border-slate-800 pb-2">Vanguard Deployment</h3>
               <p className="text-[10px] text-slate-500 font-mono mb-4">Click to force-spawn sub-agents autonomously via the CLI Bridge.</p>
               
               <div className="grid grid-cols-1 gap-3">
                  <button onClick={async () => {
                      await fetch('/api/execute-proposal', { method: 'POST', body: JSON.stringify({ command: 'node scripts/launch_comet.js' }) });
                  }} className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 p-3 rounded font-mono text-[10px] uppercase tracking-widest transition-colors flex justify-between items-center group">
                      <span>Launch Comet Browser</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Deploy &rarr;</span>
                  </button>

                  <button onClick={async () => {
                      await fetch('/api/execute-proposal', { method: 'POST', body: JSON.stringify({ command: 'python3 ../automations/integrations/moodle_scraper_daemon.py' }) });
                  }} className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 p-3 rounded font-mono text-[10px] uppercase tracking-widest transition-colors flex justify-between items-center group">
                      <span>Moodle Intelligence Sweep</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Deploy &rarr;</span>
                  </button>

                  <button onClick={async () => {
                      await fetch('/api/execute-proposal', { method: 'POST', body: JSON.stringify({ command: 'python3 ../automations/integrations/research_scout_daemon.py' }) });
                  }} className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 p-3 rounded font-mono text-[10px] uppercase tracking-widest transition-colors flex justify-between items-center group">
                      <span>Academic Zotero Ingest</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">Deploy &rarr;</span>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
      <AgentDetailModal
        agent={displayAgents.find(a => a.id === selectedAgentId) || null}
        onClose={() => setSelectedAgentId(null)}
      />
    </NexusLayout>
  );
}
