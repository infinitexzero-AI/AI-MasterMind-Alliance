'use client';
import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

export default function ChatGPTPage() {
  return (
    <div className="p-8 text-cyan-100 font-mono h-full flex flex-col">
      <header className="mb-6 border-b border-cyan-900/50 pb-4">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-4">
          <MessageSquare className="w-10 h-10 text-emerald-400" />
          CHATGPT <span className="text-sm font-normal text-cyan-600 self-end mb-2">/ EXTERNAL_INTELLIGENCE</span>
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 border border-cyan-900/30 bg-slate-900/50 rounded-lg p-12">
          <div className="text-center space-y-4 max-w-lg">
             <h2 className="text-2xl font-bold text-cyan-100">Establish Neural Link</h2>
             <p className="text-cyan-400/70">
               Direct API integration is currently restricted. Initiate manual neural link via secure browser channel.
             </p>
          </div>
          
          <a 
            href="https://chatgpt.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-none border border-emerald-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <span className="uppercase tracking-widest">Launch Interface</span>
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <div className="mt-8 text-xs text-cyan-600 font-mono uppercase tracking-widest">
             Human-In-The-Loop Authentication Required
          </div>
      </div>
    </div>
  );
}
