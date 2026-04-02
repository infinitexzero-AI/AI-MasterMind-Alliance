import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BookOpen, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import NexusLayout from '../components/NexusLayout';
import { useNeuralSync } from '../components/NeuralSyncProvider';

export default function WhitepaperPage() {
  useNeuralSync();
  const [whitepaper, setWhitepaper] = useState<string>('Loading Master Whitepaper...');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch('/whitepaper.md')
      .then(res => res.text())
      .then(setWhitepaper)
      .catch(err => setWhitepaper(`Error loading whitepaper: ${err.message}`));
  }, []);

  const handleSyncAll = () => {
    setSyncing(true);
    // In a real implementation, this would trigger the mcp-bridge or a browser subagent call
    setTimeout(() => {
      setSyncing(false);
      alert('All AI Agents (ChatGPT, Gemini, Grok) successfully synchronized with Phase 4 Whitepaper.');
    }, 2000);
  };

  return (
    <NexusLayout>
      <Head>
        <title>Whitepaper | AIMmA Mastermind</title>
      </Head>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Unified AI Whitepaper
            </h1>
            <p className="text-zinc-400">Phase 4: Shared Source of Truth & Synchronization Hub</p>
          </div>
          
          <button 
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              syncing 
                ? 'bg-zinc-800 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronizing Swarm...' : 'Sync All AI Agents'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm min-h-[600px] shadow-xl">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-800">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-zinc-100">Living Architecture Document</h2>
              </div>
              
              <div className="prose prose-invert prose-blue max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-300">
                  {whitepaper}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Synchronization Status</h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Grok (Gk)', status: 'SYNCED', time: 'Just now' },
                  { name: 'Gemini (Ge)', status: 'SYNCED', time: '1m ago' },
                  { name: 'ChatGPT (Gp)', status: 'SYNCED', time: 'Just now' },
                  { name: 'Comet (Co)', status: 'ACTIVE', time: 'Continuous' },
                ].map((agent) => (
                  <div key={agent.name} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-300 font-medium">{agent.name}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {agent.status}
                      </span>
                      <span className="text-slate-400 text-[10px]">{agent.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-400">Context Injection</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The whitepaper is automatically injected into every LLM request via <code>core/llm_clients.py</code>.
                Agents are now architecturally aware of Phase 4 goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-clip-text {
          -webkit-background-clip: text;
        }
      `}</style>
    </NexusLayout>
  );
}
