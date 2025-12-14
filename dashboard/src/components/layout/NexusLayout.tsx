"use client";
import React from 'react';
import Link from 'next/link';
import OmniSearch from '@/components/ui/OmniSearch';
import Tooltip from '@/components/ui/Tooltip';
import { ParticleBackground } from '@/components/ui/ParticleBackground';

export default function NexusLayout({ children }: { children: React.ReactNode }) {
   return (
      <div className="min-h-screen flex text-slate-100 selection:bg-cyan-500/30 font-sans">
         {/* Background Effects */}
         <ParticleBackground />

         {/* Sidebar Navigation */}
         <aside className="w-20 lg:w-64 fixed h-full renaissance-panel border-r border-slate-700/30 z-40 hidden md:flex flex-col bg-slate-950/80">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/30">
               <span className="font-bold tracking-widest hidden lg:block text-slate-100 text-xl">NEXUS</span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-2">
               {[
                  { name: 'Dashboard', path: '/' },
                  { name: 'Antigravity', path: '/antigravity' }, // New Module
                  { name: 'Nexus', path: '/nexus' },
                  { name: 'Forge', path: '/nexus/forge' },
                  { name: 'Design', path: '/design' }, // NEW
                  { name: 'Intelligence', path: '/intelligence' },
                  { name: 'Settings', path: '/settings' } // Placeholder
               ].map((item) => (
                  <Tooltip key={item.name} content={`Navigate to ${item.name}`} position="right">
                     <Link href={item.path} className="w-full h-10 flex items-center justify-center lg:justify-start lg:px-4 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors group">
                        <div className="w-5 h-5 bg-current opacity-50 group-hover:opacity-100" />
                        <span className="ml-3 hidden lg:block text-sm font-medium">{item.name}</span>
                     </Link>
                  </Tooltip>
               ))}
            </nav>

            <div className="p-4 border-t border-slate-700/30">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="hidden lg:block text-xs font-mono text-green-400">OPERATIONAL</span>
               </div>
            </div>
         </aside>

         {/* Main Content */}
         <div className="flex-1 md:ml-20 lg:ml-64 flex flex-col relative z-10">
            <header className="h-16 renaissance-panel sticky top-0 z-30 px-6 flex items-center justify-between border-b border-slate-700/30 bg-slate-950/80">
               <div className="md:hidden">
                  <div className="w-6 h-6 bg-slate-700 rounded"></div>
               </div>

               <div className="flex-1 max-w-2xl mx-auto px-4">
                  <OmniSearch />
               </div>

               <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">System Load</span>
                     <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-cyan-500 w-[65%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 border border-white/20 shadow-lg"></div>
               </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
               <div className="max-w-[1920px] mx-auto animate-fade-in relative">
                  {children}
               </div>
            </main>
         </div>
      </div>
   );
}
