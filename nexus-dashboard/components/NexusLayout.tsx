import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import OmniSearch from './OmniSearch';
import Tooltip from './Tooltip';
import { ParticleBackground } from './ParticleBackground';
import { useStealthMode } from './StealthModeProvider';
import { LayoutDashboard, Network, Terminal, GraduationCap, Bot, Grid3X3, Settings2, Cog, Bolt, Activity, Plug, Brain, Wand2, Globe, Compass, Kanban, BookOpen, Menu, X, Sunrise, Swords, EyeOff, Eye, Stethoscope } from 'lucide-react';

// Icon component for sidebar navigation
const iconMap: Record<string, React.ElementType> = {
   LayoutDashboard, Network, Terminal, GraduationCap, Bot, Grid3X3, Settings2, Cog, Bolt, Activity, Plug, Brain, Wand2, Globe, Compass, Kanban, BookOpen, Menu, X, Sunrise, Swords, EyeOff, Eye, Stethoscope
};

function NavIcon({ name }: { name: string }) {
   const IconComponent = iconMap[name];
   return IconComponent ? <IconComponent className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" /> : null;
}
import { useHealthStatus } from '../hooks/useHealthStatus';
import { useSystemHealth } from './hooks/useSystemHealth';
import StatusIndicator from './StatusIndicator';
import { Sparkline } from './Sparkline';
import { useAgentHeartbeat } from './hooks/useAgentHeartbeat';
import LifeModeStrip from './LifeModeStrip';
import CommandPalette from './CommandPalette';
import StatusFooter from './StatusFooter';
import { OpenClawGuide } from './OpenClawGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import { ShortcutCheatSheet } from './ShortcutCheatSheet';
import { AriaLiveRegion, announceToScreenReader } from './AriaLiveRegion';
import { VoiceRecorder } from './VoiceRecorder';
import { spatialAudio } from '../lib/audio-engine';
import { AuthVault } from '../lib/auth-vault';
import { AchievementOverlay } from './AchievementOverlay';
import { useAchievements } from '../hooks/useAchievements';
import { usePlugins } from '../hooks/usePlugins';
import { useXboxController } from './hooks/useXboxController';
import { useAuth } from '../src/contexts/AuthContext';


function SystemStatusWidget() {
   const { isLoading, isConnected, coreStatus, redisStatus, bullStatus } = useSystemHealth();
   const [mcpStatus, setMcpStatus] = React.useState<'healthy' | 'degraded' | 'offline'>('offline');
   const [relayStatus, setRelayStatus] = React.useState<'healthy' | 'degraded' | 'offline'>('offline');
   const [playwrightStatus, setPlaywrightStatus] = React.useState<'healthy' | 'degraded' | 'offline'>('offline');
   const [openClawStatus, setOpenClawStatus] = React.useState<'healthy' | 'degraded' | 'offline'>('offline');
   const [ollamaStatus, setOllamaStatus] = React.useState<'healthy' | 'degraded' | 'offline'>('offline');
   const agentHeartbeats = useAgentHeartbeat();


   React.useEffect(() => {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const checkServices = async () => {
         // MCP Bridge
         try {
            const r = await fetch(`http://${host}:3006/health`, { signal: AbortSignal.timeout(2000) });
            setMcpStatus(r.ok ? 'healthy' : 'degraded');
         } catch { setMcpStatus('offline'); }
         
         // 2. Neural Relay (Port 3001)
         try {
            const relayRes = await fetch(`http://${host}:3001/health`, { signal: AbortSignal.timeout(2000) });
            setRelayStatus(relayRes.ok ? 'healthy' : 'degraded');
         } catch { setRelayStatus('offline'); }
         
         // 3. OpenClaw Gateway (Port 18789)
         try {
            const ocRes = await fetch(`/api/system/openclaw-status`, { signal: AbortSignal.timeout(2000) });
            if (ocRes.ok) {
               const data = await ocRes.json();
               setOpenClawStatus(data.gatewayOnline ? 'healthy' : 'offline');
            } else {
               setOpenClawStatus('degraded');
            }
         } catch { setOpenClawStatus('offline'); }
         
         // Playwright Browser Agent
         try {
            const r = await fetch(`http://${host}:3333/health`, { signal: AbortSignal.timeout(2000) });
            setPlaywrightStatus(r.ok ? 'healthy' : 'degraded');
         } catch { setPlaywrightStatus('offline'); }
         
         // Ollama Local-First
         try {
            const r = await fetch(`http://${host}:11434/api/tags`, { signal: AbortSignal.timeout(2000) });
            setOllamaStatus(r.ok ? 'healthy' : 'degraded');
         } catch { setOllamaStatus('offline'); }
      };
      checkServices();
      const interval = setInterval(checkServices, 15000);
      return () => clearInterval(interval);
   }, []);

   const statusColor = (s: string) =>
      s === 'healthy' ? 'bg-emerald-400' : s === 'degraded' ? 'bg-amber-400' : 'bg-slate-600';
   const statusLabel = (s: string) =>
      s === 'healthy' ? 'ON' : s === 'degraded' ? 'WARN' : 'OFF';

   if (isLoading) return <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />;
   if (!isConnected) return <StatusIndicator status="unhealthy" label="OFFLINE" />;

   return (
      <div className="flex flex-col gap-1.5 w-full">
         <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1 hidden lg:block">System Status</span>
         {[
            { label: 'CORE', status: coreStatus },
            { label: 'REDIS', status: redisStatus },
            { label: 'QUEUE', status: bullStatus },
         ].map(s => (
            <div key={s.label} className="flex items-center justify-between group">
               <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">{s.label}</span>
               <StatusIndicator status={s.status} pulse={s.label === 'CORE'} />
            </div>
         ))}
         <div className="h-px bg-slate-700/50 my-1 hidden lg:block" />
         {[
            { label: 'MCP', status: mcpStatus },
            { label: 'RELAY', status: relayStatus },
            { label: 'OPENCLAW', status: openClawStatus },
            { label: 'BROWSER', status: playwrightStatus },
            { label: 'OLLAMA', status: ollamaStatus },
         ].map(s => (
            <div key={s.label} className="flex items-center justify-between group">
               <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">{s.label}</span>
               <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono text-slate-500 hidden lg:inline">{statusLabel(s.status)}</span>
                  {agentHeartbeats[s.label] && (
                     <div className="ml-1 hidden xl:block">
                        <Sparkline 
                           data={agentHeartbeats[s.label].history} 
                           color={s.label === 'GROK' ? '#a855f7' : '#22d3ee'} 
                        />
                     </div>
                  )}
                  <div className={`w-2 h-2 rounded-full ${statusColor(s.status)} ${s.status === 'healthy' ? 'animate-pulse' : ''}`} />
               </div>
            </div>
         ))}
      </div>
   );
}

// using useStealthMode from StealthModeProvider import

export default function NexusLayout({ children }: { children: React.ReactNode }) {
   const { hasAccess } = useAuth();
   const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
   const [isShortcutSheetOpen, setIsShortcutSheetOpen] = React.useState(false);
   const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
   const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
   
   // Hook directly into TanStack Cache
   const { data: healthData } = useHealthStatus();
   const systemLoad = healthData?.system?.memory?.usage ?? 0;

   const { isStealthMode: isStealth, setIsStealthMode: toggleStealth } = useStealthMode();
   const { showToast } = useToast();
   const { getSlotComponents } = usePlugins();
   const { latestUnlock, triggerManualUnlock } = useAchievements();
   const router = useRouter();
   const [isTvMode, setIsTvMode] = React.useState(false);
   const [isMirrorMode, setIsMirrorMode] = React.useState(false);

   // Multi-Platform Sync Logic
   React.useEffect(() => {
      if (!isMirrorMode) return;

      const host = window.location.hostname;
      const checkActiveView = async () => {
         try {
            const res = await fetch(`http://${host}:3001/api/system/active-view`);
            if (res.ok) {
               const data = await res.json();
               if (data.path && data.path !== router.pathname) {
                  router.push(data.path);
               }
            }
         } catch (e) { console.error('Mirror Sync Error:', e); }
      };

      const interval = setInterval(checkActiveView, 3000);
      return () => clearInterval(interval);
   }, [isMirrorMode, router.pathname]);

   // Broadcast navigation if leader
   React.useEffect(() => {
      if (!isMirrorMode) {
         const host = window.location.hostname;
         fetch(`http://${host}:3001/api/system/sync-view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: router.pathname })
         }).catch(() => {});
      }
   }, [router.pathname, isMirrorMode]);

   // Xbox Controller Vanguard Integration
   useXboxController((direction) => {
      if (direction === 'UP' || direction === 'DOWN') {
         // Custom scroll logic natively scaling to TV displays
         window.scrollBy(0, direction === 'UP' ? -350 : 350);
      }
      
      if (direction === 'LB' || direction === 'RB') {
         // Cycle through Primary Vanguard Matrices logically
         const CYCLABLE_ROUTES = [
            '/', 
            '/war-room', 
            '/sovereign', 
            '/scholar', 
            '/agents', 
            '/observability', 
            '/memory'
         ];
         
         const currentIndex = CYCLABLE_ROUTES.indexOf(router.pathname);
         let nextIndex = 0; // Default to Nexus Root if unmapped
         
         if (currentIndex !== -1) {
            if (direction === 'LB') {
               nextIndex = currentIndex > 0 ? currentIndex - 1 : CYCLABLE_ROUTES.length - 1;
            } else if (direction === 'RB') {
               nextIndex = (currentIndex + 1) % CYCLABLE_ROUTES.length;
            }
         }
         
         // Trigger the Next.js rapid DOM swap
         router.push(CYCLABLE_ROUTES[nextIndex]);
         // Fire ambient auditory feedback directly to the TV speakers
         // spatialAudio.playInterfaceTick(); // TODO: Implement in audio-engine
      }
      
      if (direction === 'SELECT') {
         showToast("Xbox A-Button Matrix Activated", "info");
      }
   });



   // Close mobile nav on route change
   React.useEffect(() => {
      setIsMobileNavOpen(false);
   }, [router.pathname]);

// System Memory Load natively bound via useHealthStatus hooks directly

   // Unlock "Nexus Sovereign" on full phase completion
   React.useEffect(() => {
      if (router.pathname === '/whitepaper') {
         setTimeout(() => triggerManualUnlock('NEXUS_SOVEREIGN'), 2000);
      }
   }, [router.pathname]);

   React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         // CMD+K: Command Palette
         if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
         }
         // CMD+?: Shortcut Guide
         if ((e.metaKey || e.ctrlKey) && e.key === '?') {
            e.preventDefault();
            setIsShortcutSheetOpen(prev => !prev);
         }
         // CMD+B: Toggle Sidebar
         if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            setIsSidebarCollapsed(prev => {
               const next = !prev;
               announceToScreenReader(next ? "Sidebar collapsed" : "Sidebar expanded");
               return next;
            });
         }
         // CMD+S: Voice Command
         if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            window.dispatchEvent(new Event('NEXUS_TOGGLE_VOICE'));
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, []); // Removed isSidebarCollapsed dependency to avoid re-binding, using functional update instead

   const handleAbort = async () => {
      const verified = await AuthVault.verifyBiometric();
      if (verified) {
         window.dispatchEvent(new Event('ALLIANCE_ABORT_ALL'));
         showToast("Sovereign Killswitch Activated", "success");
         spatialAudio.playError();
      } else {
         showToast("Biometric verification failed. Abort denied.", "error");
      }
   };

   return (
      <div className={`min-h-screen flex text-slate-100 selection:bg-cyan-500/30 font-sans transition-colors duration-1000 ${isStealth ? 'stealth-mode bg-black' : ''} ${isTvMode ? 'tv-optimized' : ''}`}>
         {/* Skip to content - accessibility */}
         <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-black focus:rounded-lg focus:font-bold">Skip to content</a>
         <Head>
            <title>NEXUS | Command Center</title>
         </Head>

         {/* Background Effects */}
         {!isStealth && <ParticleBackground />}

         {/* Performance Bar (Core Web Vitals Monitoring) */}
         <div className="fixed top-0 left-0 w-full h-[1px] z-[100] flex overflow-hidden pointer-events-none opacity-50">
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 0.5 }}
               className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"
            />
         </div>

         {/* Sidebar Navigation */}
         <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-20 lg:w-64'} fixed h-full renaissance-panel border-r border-slate-700/30 z-40 hidden md:flex flex-col bg-slate-950/60 backdrop-blur-xl transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700/30">
               <span className={`font-bold tracking-widest hidden ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} text-slate-100 text-xl`}>NEXUS</span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">

               {/* Core Views */}
               <div className="space-y-1.5">
                  <div className={`px-4 mb-2 ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>
                     <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Core Matrix</span>
                  </div>
                  {[
                     { name: 'The Nexus', path: '/', icon: 'LayoutDashboard', domain: 'nexus' },
                     { name: 'Spectral Writer', path: '/writer', icon: 'Wand2', domain: 'nexus' },
                     { name: 'War Room', path: '/war-room', icon: 'Swords', domain: 'war-room' },
                     { name: 'Mapping', path: '/mapping', icon: 'Network', domain: 'mapping' },
                     { name: 'Observer', path: '/observability', icon: 'Activity', domain: 'observer' },
                     { name: 'Intelligence Vault', path: '/library', icon: 'BookOpen', domain: 'vault' },
                     { name: 'Academic Core', path: '/academics', icon: 'GraduationCap', domain: 'academics' },
                     { name: 'Medical Pathway', path: '/medical', icon: 'Stethoscope', domain: 'academics' },
                     { name: 'Vision Matrix', path: '/vision', icon: 'Sunrise', domain: 'vision' },
                     { name: 'Skill Matrix', path: '/skills', icon: 'Network', domain: 'skills' },
                     { name: 'Career Ops', path: '/career', icon: 'Kanban', domain: 'career' },
                     { name: 'Scholar Domain', path: '/scholar', icon: 'GraduationCap', domain: 'scholar' },
                  ].filter(item => hasAccess(item.domain)).map((item) => {
                     const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                     return (
                        <Tooltip key={item.name} content={`Navigate to ${item.name}`} position="right">
                           <Link href={item.path} className={`w-full h-10 flex items-center justify-center ${isSidebarCollapsed ? 'lg:justify-center' : 'lg:justify-start lg:px-4'} rounded-lg transition-all group ${isActive
                              ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                              : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400 border-l-2 border-transparent'
                              }`}>
                              <NavIcon name={item.icon} />
                              <span className={`ml-3 hidden ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                           </Link>
                        </Tooltip>
                     );
                  })}
               </div>

               {/* Swarm Agents */}
               <div className="space-y-1.5">
                  <div className={`px-4 mb-2 ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>
                     <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Vanguard Swarm</span>
                  </div>
                  {[
                     { name: 'Swarm Matrix', path: '/agents', icon: 'Bot', domain: 'agents' },
                     { name: 'Fleet Radar', path: '/fleet', icon: 'Network', domain: 'agents' },
                     { name: 'Comet (Scout)', path: '/comet', icon: 'Compass', domain: 'agents' },
                     { name: 'Grok (Architect)', path: '/studio', icon: 'Terminal', domain: 'agents' },
                     { name: 'Browser Agent', path: '/browser-agent', icon: 'Globe', domain: 'agents' },
                  ].filter(item => hasAccess(item.domain)).map((item) => {
                     const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                     return (
                        <Tooltip key={item.name} content={`Navigate to ${item.name}`} position="right">
                           <Link href={item.path} className={`w-full h-10 flex items-center justify-center ${isSidebarCollapsed ? 'lg:justify-center' : 'lg:justify-start lg:px-4'} rounded-lg transition-all group ${isActive
                              ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                              : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400 border-l-2 border-transparent'
                              }`}>
                              <NavIcon name={item.icon} />
                              <span className={`ml-3 hidden ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                           </Link>
                        </Tooltip>
                     );
                  })}
               </div>

               {/* Systems */}
               <div className="space-y-1.5">
                  <div className={`px-4 mb-2 ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>
                     <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Systems</span>
                  </div>
                  {[
                     { name: 'Hippocampus', path: '/memory', icon: 'Brain', domain: 'nexus' },
                     { name: 'The Legend', path: '/whitepaper', icon: 'BookOpen', domain: 'nexus' },
                     { name: 'Settings', path: '/settings', icon: 'Cog', domain: 'settings' }
                  ].filter(item => hasAccess(item.domain)).map((item) => {
                     const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                     return (
                        <Tooltip key={item.name} content={`Navigate to ${item.name}`} position="right">
                           <Link href={item.path} className={`w-full h-10 flex items-center justify-center ${isSidebarCollapsed ? 'lg:justify-center' : 'lg:justify-start lg:px-4'} rounded-lg transition-all group ${isActive
                              ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                              : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400 border-l-2 border-transparent'
                              }`}>
                              <NavIcon name={item.icon} />
                              <span className={`ml-3 hidden ${isSidebarCollapsed ? 'lg:hidden' : 'lg:block'} text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                           </Link>
                        </Tooltip>
                     );
                  })}
               </div>

               {/* Plugin Slot: Sidebar */}
               <div className="pt-4 space-y-2">
                  {getSlotComponents('sidebar').map((Component, i) => (
                     <div key={`sidebar-plugin-${i}`} className="px-3">
                        <Component />
                     </div>
                  ))}
               </div>
            </nav>

            <div className="p-4 border-t border-slate-700/30">
               <div className="flex items-center gap-3">
                  <SystemStatusWidget />
               </div>
            </div>
         </aside>

         {/* Mobile Sidebar Overlay */}
         {isMobileNavOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
               <aside className="absolute left-0 top-0 h-full w-72 bg-slate-950/95 border-r border-slate-700/30 flex flex-col animate-slide-in-left">
                  <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/30">
                     <span className="font-bold tracking-widest text-slate-100 text-xl">NEXUS</span>
                     <button onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation" className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                     {/* Keep standard straight list for mobile for now to save space */}
                     {[
                        { name: 'The Nexus', path: '/', icon: 'LayoutDashboard', domain: 'nexus' },
                        { name: 'Spectral Writer', path: '/writer', icon: 'Wand2', domain: 'nexus' },
                        { name: 'War Room', path: '/war-room', icon: 'Swords', domain: 'war-room' },
                        { name: 'Mapping', path: '/mapping', icon: 'Network', domain: 'mapping' },
                        { name: 'Vanguard Swarm', path: '/agents', icon: 'Bot', domain: 'agents' },
                        { name: 'Comet (Scout)', path: '/comet', icon: 'Compass', domain: 'agents' },
                        { name: 'Grok (Architect)', path: '/studio', icon: 'Terminal', domain: 'agents' },
                        { name: 'Browser Agent', path: '/browser-agent', icon: 'Globe', domain: 'agents' },
                        { name: 'Hippocampus', path: '/memory', icon: 'Brain', domain: 'nexus' },
                        { name: 'Observer', path: '/observability', icon: 'Activity', domain: 'observer' },
                        { name: 'Knowledge Vault', path: '/library', icon: 'BookOpen', domain: 'vault' },
                        { name: 'Academic Core', path: '/academics', icon: 'GraduationCap', domain: 'academics' },
                        { name: 'Medical Pathway', path: '/medical', icon: 'Stethoscope', domain: 'academics' },
                        { name: 'Vision Matrix', path: '/vision', icon: 'Sunrise', domain: 'vision' },
                        { name: 'Skill Matrix', path: '/skills', icon: 'Network', domain: 'skills' },
                        { name: 'Career Ops', path: '/career', icon: 'Kanban', domain: 'career' },
                        { name: 'Scholar Domain', path: '/scholar', icon: 'GraduationCap', domain: 'scholar' },
                        { name: 'The Legend', path: '/whitepaper', icon: 'BookOpen', domain: 'nexus' },
                        { name: 'Settings', path: '/settings', icon: 'Cog', domain: 'settings' }
                     ].filter(item => hasAccess(item.domain)).map((item) => {
                        const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                        return (
                           <Link key={item.name} href={item.path} className={`w-full h-10 flex items-center px-4 rounded-lg transition-all ${isActive ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400 border-l-2 border-transparent'
                              }`}>
                              <NavIcon name={item.icon} />
                              <span className={`ml-3 text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                           </Link>
                        );
                     })}
                  </nav>
               </aside>
            </div>
         )}

         {/* Main Content */}
         <div className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-20 lg:ml-64'} flex flex-col relative z-10 transition-all duration-300`} >
            <header className="h-16 renaissance-panel sticky top-0 z-30 px-6 flex items-center justify-between border-b border-slate-700/30 bg-slate-950/60 backdrop-blur-xl">
               <div className="md:hidden">
                  <button onClick={() => setIsMobileNavOpen(true)} aria-label="Open navigation" className="text-slate-400 hover:text-white">
                     <Menu className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex-1 max-w-2xl mx-auto px-4 flex items-center gap-4">
                  {/* Global 'Now' Situational Awareness Indicator */}
                  <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg shrink-0 backdrop-blur-md">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-500/50" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                           LIFE · Strategy Mode · <span className="text-rose-400">3 CHOKEPOINTS</span>
                        </span>
                     </div>
                     <div className="h-4 w-px bg-white/10" />
                     {/* System Pulse Visualization */}
                     <div className="flex items-center gap-0.5 h-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <motion.div
                              key={i}
                              animate={{ 
                                 height: [4, 12, 4],
                                 opacity: [0.3, 1, 0.3]
                              }}
                              transition={{ 
                                 duration: 1, 
                                 repeat: Infinity, 
                                 delay: i * 0.1 
                              }}
                              className="w-0.5 bg-cyan-400 rounded-full"
                           />
                        ))}
                     </div>
                  </div>

                  <OmniSearch />
                  <VoiceRecorder onTranscription={(text) => {
                     window.dispatchEvent(new CustomEvent('NEXUS_VANGUARD_COMMAND', { detail: { query: text } }));
                  }} />
               </div>

               <div className="flex items-center gap-3 sm:gap-4">
                  {/* Global Killswitch */}
                  <button
                     onClick={handleAbort}
                     className="px-2 py-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 font-mono text-[10px] sm:text-xs tracking-widest uppercase rounded flex items-center gap-1 sm:gap-2 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)] whitespace-nowrap"
                     title="Emergency Stop All Swarm Activity (Biometric Gated)"
                  >
                     <X className="w-3 h-3 sm:w-4 sm:h-4" />
                     <span className="hidden sm:inline font-bold">ABORT</span>
                  </button>

                  <Tooltip content={isStealth ? "Disable Stealth Mode" : "Enable Xbox Stealth Skin"}>
                     <button
                        onClick={() => toggleStealth(!isStealth)}
                        className={`p-2 rounded-lg border transition-all ${isStealth ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-500/50'}`}
                        title={isStealth ? "Disable Stealth Mode" : "Enable Xbox Stealth Skin"}
                        aria-label={isStealth ? "Disable Stealth Mode" : "Enable Xbox Stealth Skin"}
                     >
                        {isStealth ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                  </Tooltip>

                  <Tooltip content={isTvMode ? "Disable TV Mode" : "Enable Xbox TV Mode"}>
                     <button
                        onClick={() => setIsTvMode(!isTvMode)}
                        className={`p-2 rounded-lg border transition-all ${isTvMode ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/50'}`}
                        title={isTvMode ? "Disable TV Mode" : "Enable Xbox TV Mode"}
                        aria-label={isTvMode ? "Disable TV Mode" : "Enable Xbox TV Mode"}
                     >
                        <Sunrise className="w-4 h-4" />
                     </button>
                  </Tooltip>

                  <Tooltip content={isMirrorMode ? "Disable Mirror Sync" : "Enable Device Mirroring"}>
                     <button
                        onClick={() => setIsMirrorMode(!isMirrorMode)}
                        className={`p-2 rounded-lg border transition-all ${isMirrorMode ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500/50'}`}
                        title={isMirrorMode ? "Disable Mirror Sync" : "Enable Device Mirroring"}
                        aria-label={isMirrorMode ? "Disable Mirror Sync" : "Enable Device Mirroring"}
                     >
                        <Globe className="w-4 h-4" />
                     </button>
                  </Tooltip>

                  <LifeModeStrip currentMode="ACADEMIC" />

                  <div className="hidden sm:flex flex-col items-end" title={`Memory: ${systemLoad}%`}>
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">System Load</span>
                     <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className={`h-full transition-all duration-1000 rounded-full ${systemLoad < 20 ? 'w-1/6' : systemLoad < 40 ? 'w-1/3' : systemLoad < 60 ? 'w-1/2' : systemLoad < 80 ? 'w-2/3' : systemLoad < 95 ? 'w-5/6' : 'w-full'
                           } ${systemLoad < 70 ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                              : systemLoad < 90 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                 : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                           }`} />
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 border border-white/20 shadow-lg"></div>
               </div>
            </header>

            <main id="main-content" className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 relative">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={router.pathname}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3, ease: 'easeOut' }}
                     className="max-w-[1920px] mx-auto w-full flex-1 flex flex-col h-full min-h-0"
                  >
                     {children}
                  </motion.div>
               </AnimatePresence>
            </main>
         </div >

         <ShortcutCheatSheet
            isOpen={isShortcutSheetOpen}
            onClose={() => setIsShortcutSheetOpen(false)}
         />

         <AriaLiveRegion />

         <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
         />

         <OpenClawGuide currentPage={router.pathname} />
         <StatusFooter />
         <AchievementOverlay achievement={latestUnlock} />
      </div>
   );
}
