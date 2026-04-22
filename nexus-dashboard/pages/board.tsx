import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { AntigravityPanel } from '../components/antigravity/AntigravityPanel';
import { SystemHUD } from '../components/SystemHUD';
import FocusTimer from '../components/widgets/FocusTimer';
import { OrchestrationView } from '../components/OrchestrationView';
import { ParticleBackground } from '../components/ParticleBackground';
import { ReflexTrigger } from '../components/ReflexTrigger';
import { DeploymentMonitor } from '../components/DeploymentStatus';
import { KnowledgeGraph } from '../components/KnowledgeGraph';
import { MemoryInterface } from '../components/MemoryInterface';

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState('nexus');
  const [deployActive, setDeployActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDeploy = () => {
      setDeployActive(true);
      // The Monitor component initiates the SSE connection automatically when active
  };

  const handleBackup = async () => {
      setStatusMessage('Backing up...');
      try {
          const res = await fetch('/api/system/backup', { method: 'POST' });
          if (res.ok) setStatusMessage('Backup Complete');
          else setStatusMessage('Backup Failed');
      } catch {
          setStatusMessage('Network Error');
      }
      setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFlush = async () => {
      setStatusMessage('Flushing...');
      try {
          const res = await fetch('/api/system/flush', { method: 'POST' });
          if (res.ok) setStatusMessage('Cache Flushed');
          else setStatusMessage('Flush Failed');
      } catch {
          setStatusMessage('Network Error');
      }
      setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <Head>
        <title>AILCC | Command Nexus</title>
      </Head>

      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 opacity-40">
           <ParticleBackground />
      </div>

      <SystemHUD />
      <MemoryInterface />

      <main className="relative z-10 p-6 h-screen flex flex-col gap-6">
        {/* Top Bar */}
        <header className="flex justify-between items-center pb-4 border-b border-white/5 mx-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></span>
                    NEXUS PRIME
                </h1>
                <p className="text-slate-400 text-xs font-mono mt-1 opacity-70 tracking-widest">
                    SYSTEM STATUS: OPTIMAL // PHASE 5: HIPPOCAMPUS ONLINE
                </p>
            </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Col: Executive Function (Linear + Timer) */}
            <div className="col-span-3 flex flex-col gap-6 h-full">
                <div className="shrink-0">
                    <FocusTimer />
                </div>
                
                {/* Motor Cortex / N8N Controls */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20">
                     <div className="flex justify-between items-center mb-3">
                         <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                             Motor Cortex
                         </h3>
                         {statusMessage && (
                             <span className="text-[10px] text-purple-400 font-mono animate-pulse">{statusMessage}</span>
                         )}
                     </div>
                     <div className="space-y-2">
                         <ReflexTrigger 
                            label="Deploy Production" 
                            color="bg-green-500" 
                            onClickOverride={handleDeploy}
                         />
                         <ReflexTrigger label="System Backup" color="bg-blue-500" onClickOverride={handleBackup} />
                         <ReflexTrigger label="Flush Cache" color="bg-amber-500" onClickOverride={handleFlush} />
                     </div>
                </div>

                <div className="flex-1 min-h-0">
                    <OrchestrationView />
                </div>
            </div>

            {/* Center Col: Hippocampus / Knowledge Graph */}
            <div className="col-span-6 h-full flex flex-col">
                <div className="flex-1 glass-panel border border-white/5 rounded-2xl overflow-hidden flex flex-col relative group bg-slate-900/40">
                     
                     <div className="relative h-full">
                        <AnimatePresence>
                             {deployActive && (
                                 <DeploymentMonitor active={deployActive} onClose={() => setDeployActive(false)} />
                             )}
                        </AnimatePresence>

                        {!deployActive && (
                            <KnowledgeGraph />
                        )}
                        
                        {/* Overlay Title */}
                        {!deployActive && (
                            <div className="absolute top-6 left-6 pointer-events-none">
                                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Active Neural Net</h2>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* Right Col: Antigravity / Tools */}
            <div className="col-span-3 h-full">
                <AntigravityPanel />
            </div>
        </div>
      </main>
    </div>
  );
}
