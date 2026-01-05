import React, { useState } from 'react';
import { Brain, Zap, Database, Shield, Cloud, GitBranch, Code, Search, MessageSquare, Workflow, Cpu, Lock, Globe, FileText, Terminal, Sparkles } from 'lucide-react';

export default function AIMastermindPeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Periodic Table Structure - Organized by Function
  const elements = {
    // Row 1: Core Intelligence (Noble Agents)
    coreAgents: [
      { 
        symbol: 'Cl', 
        name: 'Claude', 
        number: 1, 
        role: 'Architect',
        color: 'bg-orange-500',
        icon: Brain,
        desc: 'Deep reasoning, architecture, analysis',
        access: 'Read-Only',
        category: 'Core Intelligence'
      },
      { 
        symbol: 'Gp', 
        name: 'ChatGPT', 
        number: 2, 
        role: 'Orchestrator',
        color: 'bg-green-500',
        icon: Code,
        desc: 'Code generation, API integration',
        access: 'Write',
        category: 'Core Intelligence'
      },
      { 
        symbol: 'Gk', 
        name: 'Grok', 
        number: 3, 
        role: 'Commander',
        color: 'bg-purple-500',
        icon: Sparkles,
        desc: 'Strategic direction, X integration',
        access: 'Command',
        category: 'Core Intelligence'
      },
      { 
        symbol: 'Px', 
        name: 'Perplexity', 
        number: 4, 
        role: 'Scout',
        color: 'bg-blue-500',
        icon: Search,
        desc: 'Research, real-time intelligence',
        access: 'Read-Only',
        category: 'Core Intelligence'
      },
      { 
        symbol: 'Gm', 
        name: 'Gemini', 
        number: 5, 
        role: 'Craftsman',
        color: 'bg-cyan-500',
        icon: Globe,
        desc: 'Multimodal, Google ecosystem',
        access: 'Read/Write',
        category: 'Core Intelligence'
      }
    ],
    
    // Row 2: Orchestration Layer
    orchestration: [
      { 
        symbol: 'Vc', 
        name: 'Valentine Core', 
        number: 6, 
        role: 'Gateway',
        color: 'bg-red-600',
        icon: Shield,
        desc: 'Central API orchestrator, security',
        access: 'Root',
        category: 'Orchestration'
      },
      { 
        symbol: 'N8', 
        name: 'n8n', 
        number: 7, 
        role: 'Pulse',
        color: 'bg-pink-500',
        icon: Workflow,
        desc: 'Workflow automation, webhooks',
        access: 'Execute',
        category: 'Orchestration'
      },
      { 
        symbol: 'Ag', 
        name: 'Antigravity', 
        number: 8, 
        role: 'Bridge',
        color: 'bg-indigo-500',
        icon: Terminal,
        desc: 'Local system, file access',
        access: 'System',
        category: 'Orchestration'
      }
    ],

    // Row 3: Data & Memory
    dataLayer: [
      { 
        symbol: 'Rd', 
        name: 'Redis', 
        number: 9, 
        role: 'Cache',
        color: 'bg-red-400',
        icon: Database,
        desc: 'Shared memory, state management',
        access: 'Read/Write',
        category: 'Data & Memory'
      },
      { 
        symbol: 'Pg', 
        name: 'PostgreSQL', 
        number: 10, 
        role: 'Persistence',
        color: 'bg-blue-600',
        icon: Database,
        desc: 'Relational database, transactions',
        access: 'Read/Write',
        category: 'Data & Memory'
      },
      { 
        symbol: 'Vd', 
        name: 'Vector DB', 
        number: 11, 
        role: 'Knowledge',
        color: 'bg-purple-600',
        icon: Brain,
        desc: 'RAG system, embeddings',
        access: 'Read/Write',
        category: 'Data & Memory'
      }
    ],

    // Row 4: Integration Platforms
    integrations: [
      { 
        symbol: 'Gh', 
        name: 'GitHub', 
        number: 12, 
        role: 'VCS',
        color: 'bg-gray-700',
        icon: GitBranch,
        desc: 'Version control, repositories',
        access: 'API',
        category: 'Integrations'
      },
      { 
        symbol: 'Ln', 
        name: 'Linear', 
        number: 13, 
        role: 'Tasks',
        color: 'bg-blue-500',
        icon: FileText,
        desc: 'Task management, issues',
        access: 'API',
        category: 'Integrations'
      },
      { 
        symbol: 'Nt', 
        name: 'Notion', 
        number: 14, 
        role: 'Docs',
        color: 'bg-gray-600',
        icon: FileText,
        desc: 'Documentation, knowledge base',
        access: 'API',
        category: 'Integrations'
      },
      { 
        symbol: 'Gd', 
        name: 'Google Drive', 
        number: 15, 
        role: 'Storage',
        color: 'bg-yellow-500',
        icon: Cloud,
        desc: 'File storage, collaboration',
        access: 'API',
        category: 'Integrations'
      }
    ],

    // Row 5: Communication & Protocols
    protocols: [
      { 
        symbol: 'Wp', 
        name: 'Webhooks', 
        number: 16, 
        role: 'Events',
        color: 'bg-green-600',
        icon: Zap,
        desc: 'Event-driven communication',
        access: 'Protocol',
        category: 'Protocols'
      },
      { 
        symbol: 'Ap', 
        name: 'REST API', 
        number: 17, 
        role: 'Interface',
        color: 'bg-blue-400',
        icon: MessageSquare,
        desc: 'HTTP/REST communication',
        access: 'Protocol',
        category: 'Protocols'
      },
      { 
        symbol: 'Mq', 
        name: 'Message Queue', 
        number: 18, 
        role: 'Async',
        color: 'bg-orange-600',
        icon: Workflow,
        desc: 'Asynchronous messaging',
        access: 'Protocol',
        category: 'Protocols'
      }
    ],

    // Row 6: Security & Auth
    security: [
      { 
        symbol: 'Tk', 
        name: 'API Tokens', 
        number: 19, 
        role: 'Auth',
        color: 'bg-red-700',
        icon: Lock,
        desc: 'Authentication keys, PATs',
        access: 'Secret',
        category: 'Security'
      },
      { 
        symbol: 'Ev', 
        name: '.env', 
        number: 20, 
        role: 'Secrets',
        color: 'bg-yellow-700',
        icon: Shield,
        desc: 'Environment variables',
        access: 'Secret',
        category: 'Security'
      },
      { 
        symbol: 'Oa', 
        name: 'OAuth', 
        number: 21, 
        role: 'SSO',
        color: 'bg-green-700',
        icon: Lock,
        desc: 'Single sign-on, authorization',
        access: 'Protocol',
        category: 'Security'
      }
    ]
  };

  const categories = [
    { name: 'Core Intelligence', color: 'bg-gradient-to-r from-orange-500 to-purple-500', desc: 'AI Agents' },
    { name: 'Orchestration', color: 'bg-gradient-to-r from-red-600 to-pink-500', desc: 'Control Layer' },
    { name: 'Data & Memory', color: 'bg-gradient-to-r from-red-400 to-purple-600', desc: 'Storage' },
    { name: 'Integrations', color: 'bg-gradient-to-r from-gray-700 to-yellow-500', desc: 'Platforms' },
    { name: 'Protocols', color: 'bg-gradient-to-r from-green-600 to-orange-600', desc: 'Communication' },
    { name: 'Security', color: 'bg-gradient-to-r from-red-700 to-green-700', desc: 'Auth & Secrets' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            AI Mastermind Alliance
          </h1>
          <h2 className="text-2xl text-purple-300 mb-2">Periodic Table of Elements</h2>
          <p className="text-gray-400">
            A structured taxonomy of agents, tools, and protocols
          </p>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.color} rounded-lg p-3 cursor-pointer transition-all hover:scale-105`}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="text-white font-bold text-sm">{cat.name}</div>
              <div className="text-white/80 text-xs">{cat.desc}</div>
            </div>
          ))}
        </div>

        {/* Periodic Table Grid */}
        <div className="bg-black/40 backdrop-blur rounded-lg p-6 mb-6 border border-purple-500/30">
          {Object.entries(elements).map(([key, row], rowIdx) => (
            <div key={key} className="mb-6">
              <div className="flex flex-wrap gap-3 justify-center">
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
                        rounded-lg p-4 cursor-pointer transition-all
                        hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50
                        ${isHighlighted ? 'ring-4 ring-white scale-105' : ''}
                        ${selectedElement?.number === element.number ? 'ring-4 ring-yellow-400 scale-110' : ''}
                        w-32 h-32 flex flex-col items-center justify-center
                      `}
                    >
                      <div className="text-white/70 text-xs font-mono mb-1">
                        {element.number}
                      </div>
                      <div className="text-white font-bold text-3xl mb-1">
                        {element.symbol}
                      </div>
                      <Icon className="w-6 h-6 text-white mb-1" />
                      <div className="text-white/90 text-xs font-semibold text-center">
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
          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-start gap-6">
              <div className={`${selectedElement.color} rounded-lg p-6 flex-shrink-0`}>
                <div className="text-white/70 text-sm font-mono mb-2">
                  #{selectedElement.number}
                </div>
                <div className="text-white font-bold text-5xl mb-2">
                  {selectedElement.symbol}
                </div>
                {React.createElement(selectedElement.icon, { className: "w-12 h-12 text-white" })}
              </div>
              
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {selectedElement.name}
                </h3>
                <div className="flex gap-3 mb-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                    {selectedElement.role}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                    {selectedElement.category}
                  </span>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-300 text-sm">
                    {selectedElement.access}
                  </span>
                </div>
                <p className="text-gray-300 text-lg">
                  {selectedElement.desc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <div className="text-4xl font-bold text-white">21</div>
            <div className="text-gray-400">Total Elements</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <div className="text-4xl font-bold text-green-400">5</div>
            <div className="text-gray-400">Core Agents</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <div className="text-4xl font-bold text-blue-400">6</div>
            <div className="text-gray-400">Categories</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/30">
            <div className="text-4xl font-bold text-purple-400">∞</div>
            <div className="text-gray-400">Possibilities</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Inspired by IBM's AI Periodic Table • Organized by Function & Role</p>
          <p className="mt-2">Hover over elements to explore • Click for details</p>
        </div>
      </div>
    </div>
  );
}