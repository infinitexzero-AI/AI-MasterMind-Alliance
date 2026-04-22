import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NexusLayout from '../components/NexusLayout';
import { OmniBar } from '../components/OmniBar';
import { SharedMemoryMarquee } from '../src/components/dashboard/shared-memory-marquee';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GlobalContextWidget } from '../src/components/AILCC_V2/GlobalContextWidget';
import { ActiveTaskProvider, useActiveTask } from '../src/components/AILCC_V2/ActiveTaskContext';
import MastermindHub from '../components/MastermindHub';

const useDocumentVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  return isVisible;
};

const DeepSpaceBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0f] to-black" />
);

const AmbientGlow = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null; // Phase 84: SRE VRAM Mitigation (Halt compositing when out of focus)
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />
    </div>
  );
};


const DashboardContent = () => {
  const { activeTask } = useActiveTask();
  const isTaskActive = activeTask !== null;
  const isVisible = useDocumentVisibility();

  return (
    <ErrorBoundary scope="Root Layout">
      <NexusLayout>
        <DeepSpaceBackground />
        <AmbientGlow isVisible={isVisible} />
        
        {/* Dynamic Top Navigation Ticker */}
        <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
           <SharedMemoryMarquee />
        </div>

        <OmniBar />

        {/* Global Context Banner (Phase 78) */}
        <div className="px-6 pt-6">
           <GlobalContextWidget />
        </div>

        {/* Active Task Override Banner */}
        {isTaskActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-transparent border border-purple-500/30 flex items-center shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-md"
          >
            <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping mr-4 shadow-[0_0_10px_rgba(168,85,247,1)]" />
            <div className="flex flex-col">
              <span className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Context Zone Override</span>
              <span className="text-white/90 font-mono text-sm tracking-wide">[{activeTask.id}] {activeTask.title}</span>
            </div>
          </motion.div>
        )}

        {/* The Matrix Layout (Unified PARA + OmniTracker Override) */}
        <div className="w-full h-full pb-24">
           <ErrorBoundary scope="Mastermind Hub">
             <MastermindHub />
           </ErrorBoundary>
        </div>
      </NexusLayout>
    </ErrorBoundary>
  );
};

export default function Page() {
  return (
    <ActiveTaskProvider>
      <DashboardContent />
    </ActiveTaskProvider>
  );
}

// [SYSTEM]: End of Vanguard Root Nexus
