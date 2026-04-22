import React, { useState } from 'react';
import { Brain, Zap, Database, Shield, Cloud, GitBranch, Code, Search, MessageSquare, Workflow, Cpu, Lock, Globe, FileText, Terminal, Sparkles } from 'lucide-react';
import NexusLayout from '../components/NexusLayout';

export default function AIMastermindPeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Periodic Table Structure - Organized by the 4 Pillars of AI Discovery
  const elements = {
    // Row 1: Primitives (Ground Truth)
    primitives: [
      { 
        symbol: 'Lg', 
        name: 'LLM (LG)', 
        number: 1, 
        role: 'Reasoning',
        color: 'bg-orange-500',
        icon: Brain,
        desc: 'Fundamental LLMs for reasoning and knowledge processing.',
        access: 'Universal',
        category: 'Primitives'
      },
      { 
        symbol: 'Em', 
        name: 'Embeddings (EM)', 
        number: 2, 
        role: 'Scientific Data',
        color: 'bg-orange-600',
        icon: Database,
        desc: 'Representing vast amounts of scientific and experimental data.',
        access: 'System',
        category: 'Primitives' 
      }
    ],
    
    // Row 2: Compositions (Intelligence Logic)
    compositions: [
      { 
        symbol: 'Rg', 
        name: 'RAG (RG)', 
        number: 3, 
        role: 'Retrieval',
        color: 'bg-green-500', 
        icon: Search, 
        desc: 'Retrieval Augmented Generation to utilize scientific databases.', 
        access: 'Comet', 
        category: 'Compositions' 
      },
      { 
        symbol: 'Ge', 
        name: 'Gemini (GE)', 
        number: 4, 
        role: 'Vision/Sim',
        color: 'bg-blue-500', 
        icon: Globe, 
        desc: 'Google powerhouse for multi-modal context and technical architecture.', 
        access: 'Google Cloud', 
        category: 'Compositions' 
      },
      { 
        symbol: 'Gp', 
        name: 'ChatGPT (GP)', 
        number: 5, 
        role: 'Planning',
        color: 'bg-emerald-600', 
        icon: MessageSquare, 
        desc: 'Advanced reasoning, planning, and agentic task orchestration.', 
        access: 'OpenAI', 
        category: 'Compositions' 
      },
      { 
        symbol: 'Gr', 
        name: 'Guardrails (GR)', 
        number: 12, 
        role: 'Safety',
        color: 'bg-green-700', 
        icon: Shield, 
        desc: 'Crucial for ethical and safe operation in discovery.', 
        access: 'Valentine', 
        category: 'Compositions' 
      }
    ],

    // Row 3: Deployment (Action Layer)
    deployment: [
      { 
        symbol: 'Ag', 
        name: 'Agents (AG)', 
        number: 6, 
        role: 'Specialists',
        color: 'bg-rose-500', 
        icon: Cpu, 
        desc: 'Specialized units for research, hypothesis, and experimentation (Active).', 
        access: 'Antigravity', 
        category: 'Deployment' 
      },
      { 
        symbol: 'Fw', 
        name: 'Frameworks (FW)', 
        number: 7, 
        role: 'Orchestration',
        color: 'bg-blue-600', 
        icon: Workflow, 
        desc: 'NEXUS and n8n systems orchestrating agent interactions.', 
        access: 'NEXUS', 
        category: 'Deployment' 
      }
    ],

    // Row 4: Emerging (The Frontier)
    emerging: [
      { 
        symbol: 'Ma', 
        name: 'Multi-Agent (MA)', 
        number: 8, 
        role: 'Collaboration',
        color: 'bg-purple-500', 
        icon: Sparkles, 
        desc: 'Complex problem-solving through collaboration and debate.', 
        access: 'Swarm', 
        category: 'Emerging' 
      },
      { 
        symbol: 'Th', 
        name: 'Thinking (TH)', 
        number: 9, 
        role: 'Deep Reasoning',
        color: 'bg-purple-600', 
        icon: Brain, 
        desc: 'Deep reasoning and hypothesis generation models.', 
        access: 'Grok', 
        category: 'Emerging' 
      },
      { 
        symbol: 'In', 
        name: 'Interpretability (IN)', 
        number: 10, 
        role: 'Clarity',
        color: 'bg-purple-700', 
        icon: Shield, 
        desc: 'Understanding the mechanics behind AI-driven discovery.', 
        access: 'The Judge', 
        category: 'Emerging' 
      },
      { 
        symbol: 'Sy', 
        name: 'Synthetic (SY)', 
        number: 11, 
        role: 'Data Gen',
        color: 'bg-purple-400', 
        icon: Database, 
        desc: 'Generating novel data for exploring new physical phenomena.', 
        access: 'Cortex', 
        category: 'Emerging' 
      }
    ],

    // Row 5: Noble Elements (AIMmA Core)
    nobleElements: [
      { 
        symbol: 'Cl', 
        name: 'Grok', 
        number: 12, 
        role: 'Architect',
        color: 'bg-indigo-500',
        icon: Brain,
        desc: 'The primary thinking model for system architecture.',
        access: 'Root',
        category: 'Noble Elements'
      },
      { 
        symbol: 'Gk', 
        name: 'Grok', 
        number: 13, 
        role: 'The Judge',
        color: 'bg-indigo-600',
        icon: Shield,
        desc: 'Strategic direction and entropy detection.',
        access: 'Root',
        category: 'Noble Elements'
      },
      { 
        symbol: 'Cm', 
        name: 'Comet', 
        number: 14, 
        role: 'The Scout',
        color: 'bg-indigo-700',
        icon: Search,
        desc: 'The browser-based RAG and research unit.',
        access: 'Root',
        category: 'Noble Elements'
      },
      { 
        symbol: 'Vl', 
        name: 'Valentine', 
        number: 15, 
        role: 'The Visionary',
        color: 'bg-indigo-400',
        icon: Sparkles,
        desc: 'Human-AI alignment and UI orchestration.',
        access: 'Root',
        category: 'Noble Elements'
      }
    ]
  };

  const categories = [
    { name: 'Primitives', color: 'bg-gradient-to-r from-orange-500 to-orange-700', desc: 'Ground Truth' },
    { name: 'Compositions', color: 'bg-gradient-to-r from-green-500 to-green-700', desc: 'Logic Layer' },
    { name: 'Deployment', color: 'bg-gradient-to-r from-blue-500 to-blue-700', desc: 'Action Layer' },
    { name: 'Emerging', color: 'bg-gradient-to-r from-purple-500 to-purple-700', desc: 'The Frontier' },
    { name: 'Noble Elements', color: 'bg-gradient-to-r from-indigo-500 to-indigo-700', desc: 'AIMmA Core' }
  ];

  return (
    <NexusLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            AI Mastermind Alliance
          </h1>
          <h2 className="text-2xl text-purple-300 mb-2 font-mono tracking-widest uppercase">Periodic Table of Elements</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A structured taxonomy of the agents, tools, and protocols driving the AIMmA ecosystem.
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.color} rounded-xl p-4 cursor-pointer transition-all hover:scale-105 shadow-lg border border-white/10`}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="text-white font-bold text-sm tracking-tight">{cat.name}</div>
              <div className="text-white/80 text-[10px] uppercase font-mono mt-1">{cat.desc}</div>
            </div>
          ))}
        </div>

        {/* Periodic Table Grid */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-slate-700/30 shadow-2xl">
          {Object.entries(elements).map(([key, row], rowIdx) => (
            <div key={key} className="mb-10 last:mb-0">
              <div className="flex flex-wrap gap-4 justify-center">
                {row.map((element) => {
                  const Icon = element.icon;
                  const isHighlighted = hoveredCategory === element.category;
                  
                  return (
                    <div
                      key={element.number}
                      onClick={() => setSelectedElement(element)}
                      onMouseEnter={() => setSelectedElement(element)}
                      className={`
                        ${element.color} 
                        rounded-2xl p-4 cursor-pointer transition-all duration-300
                        hover:scale-110 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]
                        ${isHighlighted ? 'ring-2 ring-white scale-105' : ''}
                        ${selectedElement?.number === element.number ? 'ring-4 ring-cyan-400 scale-110' : ''}
                        w-32 h-32 flex flex-col items-center justify-center relative group
                      `}
                    >
                      <div className="absolute top-2 right-3 text-white/50 text-[10px] font-mono">
                        {element.number}
                      </div>
                      <div className="text-white font-black text-3xl mb-1 tracking-tighter">
                        {element.symbol}
                      </div>
                      <Icon className="w-5 h-5 text-white/80 mb-2 group-hover:text-white transition-colors" />
                      <div className="text-white/90 text-[10px] font-bold text-center uppercase tracking-tighter">
                        {element.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Element Detail */}
        {selectedElement && (
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className={`${selectedElement.color} rounded-2xl p-10 flex-shrink-0 shadow-2xl relative group`}>
                <div className="absolute top-4 right-6 text-white/40 text-lg font-mono">
                  #{selectedElement.number}
                </div>
                <div className="text-white font-black text-7xl mb-4 tracking-tighter">
                  {selectedElement.symbol}
                </div>
                <selectedElement.icon className="w-16 h-16 text-white" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                  {selectedElement.name}
                </h3>
                <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
                  <span className="px-4 py-1.5 bg-slate-800/80 rounded-full text-slate-300 text-xs font-mono border border-slate-700 capitalize">
                    {selectedElement.role}
                  </span>
                  <span className="px-4 py-1.5 bg-slate-800/80 rounded-full text-slate-300 text-xs font-mono border border-slate-700">
                    {selectedElement.category}
                  </span>
                  <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/50 rounded-full text-cyan-400 text-xs font-mono">
                    ACCESS: {selectedElement.access}
                  </span>
                </div>
                <p className="text-slate-300 text-xl leading-relaxed max-w-3xl">
                  {selectedElement.desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[
            { label: 'Total Elements', value: '21', color: 'text-white' },
            { label: 'Core Agents', value: '5', color: 'text-emerald-400' },
            { label: 'Categories', value: '6', color: 'text-cyan-400' },
            { label: 'Possibilities', value: '∞', color: 'text-purple-400' }
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/30 text-center">
              <div className={`text-5xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 text-xs font-mono uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400 text-[10px] font-mono uppercase tracking-[0.2em] space-y-2">
          <p>Inspired by IBM's AI Periodic Table • Taxonomy v1.0.0</p>
          <p>Hover elements for spectrum analysis • Recursive intent optimization active</p>
        </div>
      </div>
    </NexusLayout>
  );
}
