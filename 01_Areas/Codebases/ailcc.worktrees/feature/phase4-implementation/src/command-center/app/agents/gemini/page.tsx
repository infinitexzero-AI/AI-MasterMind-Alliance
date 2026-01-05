'use client';
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function GeminiPage() {
  return (
    <div className="p-8 text-cyan-100 font-mono h-full flex flex-col">
      <header className="mb-6 border-b border-cyan-900/50 pb-4">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
          <Sparkles className="w-10 h-10 text-blue-400" />
          GEMINI <span className="text-sm font-normal text-cyan-600 self-end mb-2">/ MULTIMODAL_INTELLIGENCE</span>
        </h1>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Panel */}
          <div className="border border-cyan-900/30 bg-slate-900/50 p-6 rounded-lg">
             <h2 className="text-xl font-bold mb-4 text-blue-300">SYSTEM STATUS</h2>
             <div className="font-mono text-sm space-y-2 text-cyan-400">
                <div className="flex justify-between">
                    <span>CONNECTION:</span>
                    <span className="text-emerald-400">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                    <span>LATENCY:</span>
                    <span>14ms</span>
                </div>
                <div className="flex justify-between">
                    <span>CAPABILITIES:</span>
                    <span>TEXT, CODE, VISION</span>
                </div>
             </div>
          </div>

          {/* Action Panel */}
          <div className="border border-cyan-900/30 bg-slate-900/50 p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
             <p className="text-cyan-400/70">
               Gemini is ready to assist with complex reasoning and multimodal analysis.
             </p>
             <a 
                href="https://gemini.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-all"
             >
                <span>OPEN CONSOLE</span>
                <MessageSquare className="w-4 h-4" />
             </a>
          </div>
      </div>
    </div>
  );
}
