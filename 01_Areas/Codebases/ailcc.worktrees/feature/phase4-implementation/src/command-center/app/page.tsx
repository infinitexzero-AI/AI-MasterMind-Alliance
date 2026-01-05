'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import AgentGrid from './components/AgentGrid';
import ArtifactTimeline from './components/ArtifactTimeline';
import ProjectStatus from './components/ProjectStatus';
import ColorLegend from './components/ColorLegend';

interface Agent {
  name: string;
  role: string;
  status: string;
  conversations?: number;
}

interface TaskItem {
  title: string;
  state?: { name: string };
  url: string;
  html_url?: string;
}

interface McpData {
  linear?: { connected: boolean; issues: TaskItem[] };
  github?: { connected: boolean; prs: TaskItem[] };
  git?: { connected: boolean };
  filesystem?: { connected: boolean };
  agents?: Agent[];
}

export default function CommandCenter() {
  const [systemStatus] = useState('NOMINAL');
  const [currentTime, setCurrentTime] = useState('');
  const [mcpData, setMcpData] = useState<McpData | null>(null);

  useEffect(() => {
    // Fetch Live Data
    const fetchData = () => {
        fetch('/data/live_status.json')
            .then(res => res.json())
            .then(data => setMcpData(data))
            .catch(() => console.log("MCP Bridge Sync Pending..."));
    };
    
    fetchData(); // Initial fetch
    
    // Poll every 5 seconds
    const pollTimer = setInterval(fetchData, 5000);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => {
        clearInterval(timer);
        clearInterval(pollTimer);
    };
  }, []);

  return (
    <main className="min-h-screen font-mono overflow-hidden selection:bg-cyan-900 selection:text-white">
      {/* HUD Header */}
      <header className="border-b border-cyan-900/50 bg-slate-900/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-cyan-900/20">
        <div className="flex items-center gap-4">
          <div className="p-2 border border-cyan-500/30 rounded-full bg-cyan-950 animate-pulse">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-cyan-100">AI Mastermind Alliance</h1>
            <p className="text-xs text-cyan-600 flex gap-2">
                 <span>COMMAND_CENTER // PRIME_NODE</span>
                 {mcpData && <span className="text-emerald-500">:: MCP_SYNC_ACTIVE</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-4">
               <div className={`text-xs flex flex-col items-end ${mcpData?.linear?.connected ? 'text-cyan-400' : 'text-slate-600'}`}>
                   <span className="font-bold">LINEAR</span>
                   <span>{mcpData?.linear?.connected ? 'ONLINE' : 'OFFLINE'}</span>
               </div>
               <div className={`text-xs flex flex-col items-end ${mcpData?.github?.connected ? 'text-cyan-400' : 'text-slate-600'}`}>
                   <span className="font-bold">GITHUB</span>
                   <span>{mcpData?.github?.connected ? 'ONLINE' : 'OFFLINE'}</span>
               </div>
               <div className={`text-xs flex flex-col items-end ${mcpData?.git?.connected ? 'text-cyan-400' : 'text-slate-600'}`}>
                   <span className="font-bold">GIT</span>
                   <span>{mcpData?.git?.connected ? 'ACTIVE' : 'OFFLINE'}</span>
               </div>
               <div className={`text-xs flex flex-col items-end ${mcpData?.filesystem?.connected ? 'text-cyan-400' : 'text-slate-600'}`}>
                   <span className="font-bold">FS</span>
                   <span>{mcpData?.filesystem?.connected ? 'MOUNTED' : 'OFFLINE'}</span>
               </div>
           </div>

           <div className="flex flex-col items-end">
             <span className="text-xs text-fuchsia-700 uppercase">Antigravity</span>
             <span className="font-bold text-fuchsia-400 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse" />
                LINKED
             </span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-xs text-cyan-700 uppercase">System Status</span>
              <span className="font-bold text-emerald-400 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                {systemStatus}
              </span>
           </div>
           <div className="text-2xl font-bold text-cyan-100 font-numeric">{currentTime}</div>
        </div>
      </header>

      {/* Main Grid Area */}
      <div className="p-6 h-[calc(100vh-80px)] overflow-hidden grid grid-cols-12 gap-6">
        <div className="col-span-8 h-full overflow-y-auto">
             <AgentGrid agents={mcpData?.agents} />
        </div>
        <div className="col-span-4 h-full overflow-y-auto space-y-6">
             <div className="h-1/3 flex flex-col gap-2">
                <ProjectStatus linear={mcpData?.linear} github={mcpData?.github} />
                <div className="flex justify-center">
                    <ColorLegend />
                </div>
             </div>
             <div className="h-2/3">
                <ArtifactTimeline />
             </div>
        </div>
      </div>

      {/* Background Ambience */}
    </main>
  );
}

