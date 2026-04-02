import React from 'react';
import Head from 'next/head';

import OmniSearch from './OmniSearch';

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex text-slate-100 selection:bg-cyan-500/30">
      <Head>
        <title>NEXUS | Command Center</title>
      </Head>

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 fixed h-full glass-panel border-r border-white/5 z-40 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5">
           <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]">
             N
           </div>
           <span className="ml-3 font-bold tracking-widest hidden lg:block text-slate-100">NEXUS</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
           {['Dashboard', 'Agents', 'Intelligence', 'Settings'].map((item) => (
             <button key={item} className="w-full h-10 flex items-center justify-center lg:justify-start lg:px-4 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors group">
               <div className="w-5 h-5 bg-current opacity-50 group-hover:opacity-100" /> 
               <span className="ml-3 hidden lg:block text-sm font-medium">{item}</span>
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="hidden lg:block text-xs font-mono text-green-400">OPERATIONAL</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-20 lg:ml-64 flex flex-col">
        <header className="h-16 glass-panel sticky top-0 z-30 px-6 flex items-center justify-between border-b border-white/5">
           <div className="md:hidden">
              {/* Mobile Menu Trigger Placeholder */}
              <div className="w-6 h-6 bg-slate-700 rounded"></div>
           </div>
           
           <div className="flex-1 max-w-2xl mx-auto">
              <OmniSearch />
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                 <span className="text-xs font-mono text-slate-400">SYSTEM LOAD</span>
                 <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-cyan-500 w-[85%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                 </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 border border-white/20"></div>
           </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
           <div className="max-w-[1920px] mx-auto animate-fade-in">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
