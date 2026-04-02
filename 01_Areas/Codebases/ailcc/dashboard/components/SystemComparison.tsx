import React, { useEffect, useState } from 'react';
import { Brain, Database, Network, Shield, Cpu, Activity, Zap, Layers, Server, Globe } from 'lucide-react';
import { fetchHippocampusMetrics, HippocampusData } from '../lib/hippocampus-client';

const SystemComparison: React.FC = () => {
  const [metrics, setMetrics] = useState<HippocampusData | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await fetchHippocampusMetrics();
      setMetrics(data);
    };
    loadMetrics();
    // Poll every 5 seconds for live updates during ingestion
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    {
      id: '01',
      title: 'Foundations',
      icon: <Layers className="w-5 h-5" />,
      industry: {
        title: 'The AI Framework',
        desc: 'ML, Deep Learning, Generative AI as separate disciplines.',
        color: 'border-blue-500/30 bg-blue-500/5'
      },
      ailcc: {
        title: 'Integrated Intelligence',
        desc: 'Models are pluggable engines under a coordination OS.',
        color: 'border-cyan-500/50 bg-cyan-500/10'
      }
    },
    {
      id: '02',
      title: 'The Engine',
      icon: <Cpu className="w-5 h-5" />,
      industry: {
        title: 'NLP Stack',
        desc: 'Single transformer stack (Tokenization -> Embeddings -> Reasoning).',
        color: 'border-purple-500/30 bg-purple-500/5'
      },
      ailcc: {
        title: 'Multi-LLM Mesh',
        desc: 'Network of peers (Grok, Gemini, Comet) with UCP-P handshake.',
        color: 'border-cyan-500/50 bg-cyan-500/10'
      }
    },
    {
      id: '03',
      title: 'Reliability',
      icon: <Shield className="w-5 h-5" />,
      industry: {
        title: 'Trust Layer',
        desc: 'RAG and prompt engineering to reduce hallucinations.',
        color: 'border-green-500/30 bg-green-500/5'
      },
      ailcc: {
        title: 'Protocol Governance',
        desc: 'Upstream constraints (Mode 7) and cross-agent verification.',
        color: 'border-cyan-500/50 bg-cyan-500/10'
      }
    },
    {
      id: '04',
      title: 'Ops Stack',
      icon: <Server className="w-5 h-5" />,
      industry: {
        title: 'Infrastructure',
        desc: 'LangChain, Model Hubs, App Deployment.',
        color: 'border-red-500/30 bg-red-500/5'
      },
      ailcc: {
        title: 'Nexus + Cloud Cortex',
        desc: 'Replit Agentic AIOS + Nexus Dashboard as living control plane.',
        color: 'border-cyan-500/50 bg-cyan-500/10'
      }
    },
    {
      id: '05',
      title: 'Knowledge',
      icon: <Database className="w-5 h-5" />,
      industry: {
        title: 'Vector Databases',
        desc: 'Semantic search and unified data stores.',
        color: 'border-yellow-500/50 bg-yellow-500/10'
      },
      ailcc: {
        title: 'Hippocampus (Live)',
        // Dynamic description based on metrics
        desc: metrics ? `Vectors Indexed: ${metrics.vectorsIndexed} / ${metrics.targetVectors} (Goal)` : 'Connecting to Hippocampus...',
        color: 'border-orange-500/60 bg-orange-500/20'
      }
    },
    {
      id: '06',
      title: 'Frontiers',
      icon: <Zap className="w-5 h-5" />,
      industry: {
        title: 'Future Tech',
        desc: 'Multimodal AI and Autonomous Agents as "upcoming".',
        color: 'border-indigo-500/30 bg-indigo-500/5'
      },
      ailcc: {
        title: 'Mode 7 (Emergent)',
        desc: 'Agents are the baseline. Nexus is the sensory dashboard.',
        color: 'border-emerald-500/60 bg-emerald-500/20'
      }
    }
  ];

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            System Architecture Audit
          </h2>
          <p className="text-slate-400 text-sm mt-1">Comparing Standard Industry Framework vs. AILCC Mode 7 OS</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            INDUSTRY STANDARD
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-900/20 text-cyan-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            AILCC MODE 7
          </div>
        </div>
      </div>

      {/* Progress Bar for Knowledge Gap */}
      {metrics && metrics.vectorsIndexed > 0 && (
         <div className="mb-6 px-1">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-mono text-orange-400">KNOWLEDGE GAP CLOSING</span>
                <span className="text-xs font-mono text-white">{Math.round((metrics.vectorsIndexed / metrics.targetVectors) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out" 
                    ref={(el) => { if (el) el.style.width = `${(metrics.vectorsIndexed / metrics.targetVectors) * 100}%`; }}
                ></div>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent transform -translate-x-1/2 hidden md:block"></div>

        {categories.map((cat, index) => (
          <React.Fragment key={cat.id}>
            {/* Industry Side */}
            <div className={`relative group p-4 rounded-lg border ${cat.industry.color} hover:border-white/20 transition-all duration-300`}>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-slate-700 md:flex hidden items-center justify-center z-10 text-[10px] font-mono text-slate-400">
                {cat.id}
              </div>
              <div className="flex items-start gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="p-2 rounded-md bg-white/5 text-slate-400">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">{cat.industry.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[90%]">
                    {cat.industry.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* AILCC Side */}
            <div className={`relative group p-4 rounded-lg border ${cat.ailcc.color} hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300`}>
               <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-cyan-500/30 md:flex hidden items-center justify-center z-10 text-[10px] font-mono text-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                {cat.id}
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-cyan-100">{cat.ailcc.title}</h3>
                    {cat.id === '05' && (
                       <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                         {metrics && metrics.vectorsIndexed > 0 ? "CONNECTING..." : "CRITICAL GAP"}
                       </span>
                    )}
                     {cat.id === '06' && (
                       <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                         ADVANTAGE
                       </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[90%]">
                    {cat.ailcc.desc}
                  </p>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SystemComparison;
