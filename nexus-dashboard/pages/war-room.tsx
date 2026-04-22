import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { Card } from '../components/ui/Card';
import { DataGrid } from '../components/ui/DataGrid';
import { StatusPill } from '../components/ui/StatusPill';
import { Swords, Activity, Crosshair, ShieldAlert, Sparkles, AlertTriangle, Clock, Flame } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import useSWR from 'swr';
import ReactDiffViewer from 'react-diff-viewer-continued';

import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';

const DailyBriefingRenderer = () => {
    const { data: standup, error } = useSWR('/api/system/standup', (url: string) => fetch(url).then(res => res.json()), { refreshInterval: 10000 });

    if (error) return <div className="text-red-500 font-mono text-xs uppercase tracking-widest">Critical failure extracting chronicle trace.</div>;
    if (!standup) return <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Awaiting Morning Dispatch Uplink...</div>;

    if (standup.error) {
        return <div className="text-slate-400 font-mono text-xs italic">{standup.error}</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold tracking-tighter text-purple-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {standup.title}
            </h3>
            
            <div className="bg-purple-900/10 border-l-2 border-purple-500 p-3 rounded-r-lg">
                <span className="font-mono text-[9px] uppercase tracking-widest text-purple-600 block mb-1 font-bold">Absolute Directive</span>
                <p className="text-slate-200 text-sm font-sans">{standup.directive}</p>
            </div>

            <div className="bg-black/40 border border-slate-800 p-3 rounded-lg">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 block mb-1">Strategic Alignment (Why)</span>
                <p className="text-slate-400 text-xs font-mono">{standup.why}</p>
            </div>
            
            <div className="text-right">
                <span className="font-mono text-[8px] uppercase tracking-widest text-slate-600">ID: {standup.timestamp} // AUTH: STANDUP_DAEMON</span>
            </div>
        </div>
    );
};

export default function WarRoom() {
  const { hasAccess } = useAuth();
  const { tasks: liveTasks, signals: liveSignals, proposals, isConnected, hardwareStats, mediaContext } = useSwarmTelemetry();
  const [godPrompt, setGodPrompt] = React.useState('');
  const [isCasting, setIsCasting] = React.useState(false);

  const handleGodPrompt = async () => {
      if (!godPrompt.trim()) return;
      setIsCasting(true);
      try {
          await fetch('/api/system/god-prompt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ directive: godPrompt })
          });
          setGodPrompt('');
      } catch(e) {
          console.error("God-Prompt Collision:", e);
      } finally {
          setTimeout(() => setIsCasting(false), 2000); // Visual hold for radial burst
      }
  };

  const handleMergeProposal = async (proposal: any) => {
      try {
          await fetch('/api/execute-proposal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'MERGE', proposal })
          });
      } catch(e) { console.error("Merge execution fault", e); }
  };

  const handleRejectProposal = async (proposal: any) => {
      try {
          await fetch('/api/execute-proposal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'REJECT', proposal })
          });
      } catch(e) {}
  };
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: voiceBounties } = useSWR('/api/voice-ingest', fetcher, { refreshInterval: 2000 });
  const { data: gitLogData } = useSWR('/api/system/git-log', fetcher, { refreshInterval: 5000 });

  if (!hasAccess('war-room')) {
      return (
          <NexusLayout>
              <div className="flex h-full items-center justify-center p-20">
                  <div className="text-center space-y-4">
                      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto opacity-50 mb-2" />
                      <h1 className="text-xl font-bold tracking-widest text-red-400 uppercase">Clearance Denied</h1>
                      <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">You do not have WAR-ROOM domain privileges.</p>
                  </div>
              </div>
          </NexusLayout>
      );
  }

  return (
    <NexusLayout>
      <Head>
        <title>War Room | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                    <Swords className="w-8 h-8 text-rose-500" /> Live Operations
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Tactical Overview & Swarm Coordination
                </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                {hardwareStats && (
                    <StatusPill 
                        status={hardwareStats.status === 'NORMAL' ? 'active' : 'critical'} 
                        label={hardwareStats.temperature_c ? `CORE: ${hardwareStats.temperature_c.toFixed(1)}°C` : `CPU: ${hardwareStats.cpu_percent}%`} 
                    />
                )}
                {mediaContext && mediaContext.title && (
                   <StatusPill status="online" label={`🎵 ${(mediaContext.title).substring(0, 15)}${mediaContext.title.length > 15 ? '...' : ''}`} />
                )}
                <StatusPill status="active" label="SINGULARITY MODE" />
                <StatusPill status="critical" label="DEFCON 2" />
                <StatusPill status={isConnected ? 'online' : 'offline'} label={isConnected ? 'SWARM LINK' : 'OFFLINE'} />
                <StatusPill status="active" label="SYNC HZ: 60" />
            </div>
        </div>
        
        {/* Commander's Morning Dispatch */}
        <div className="grid grid-cols-1 gap-6 mb-6">
            <Panel title="Executive Morning Dispatch (Local Intelligence)" icon={<Sparkles className="w-4 h-4 text-purple-400" />}>
                <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-lg min-h-[100px]">
                    <DailyBriefingRenderer />
                </div>
            </Panel>
        </div>

        {/* Tactical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Primary Operations (Left) */}
           <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
               <Panel title="Active Swarm Engagements" icon={<Crosshair className="w-4 h-4 text-rose-400" />} className="h-[400px]">
                   <DataGrid 
                      data={liveTasks}
                      keyExtractor={t => String(t.task_id)}
                      columns={[
                          { header: 'ID', key: 'id', render: t => (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-rose-300">{t.task_id}</span>
                                {t.metadata?.is_ai_generated && (
                                   <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30" title="AI-Generated Prediction">
                                       <Sparkles className="w-2.5 h-2.5" /> AI
                                   </span>
                                )}
                              </div>
                          ) },
                          { header: 'Priority', key: 'priority', render: t => <span className="text-xs uppercase tracking-widest text-slate-300">{t.priority}</span> },
                          { header: 'Status', key: 'status', render: t => <StatusPill status={t.status === 'IN_PROGRESS' ? 'active' : t.status === 'COMPLETED' ? 'completed' : 'idle'} label={String(t.status)} /> },
                          { header: 'Target', key: 'target', render: t => <span className="font-mono text-xs text-slate-400">{t.target_agent_id}</span> }
                      ]}
                   />
               </Panel>
           </div>

           {/* Intelligence Feed (Right) */}
           <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
               <Panel title="Neural Signal Intercepts" icon={<Activity className="w-4 h-4 text-cyan-400" />} className="h-[400px]">
                  <div className="space-y-4">
                      {liveSignals.length > 0 ? liveSignals.map(signal => (
                          <Card key={signal.signal_id} padding="sm" border={false} className="bg-black/40 border-l-2 border-cyan-500">
                             <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-[10px] text-cyan-500 tracking-widest">{signal.source}</span>
                                <span className="font-mono text-[9px] text-slate-500">{new Date(signal.timestamp!).toLocaleTimeString()}</span>
                             </div>
                             <p className="text-xs text-slate-300 font-mono">{signal.message || signal.metadata?.event}</p>
                          </Card>
                      )) : (
                          <div className="flex flex-col items-center justify-center p-8 opacity-50">
                              <Activity className="w-8 h-8 text-cyan-500 mb-2 opacity-50" />
                              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Listening to Frequency...</span>
                          </div>
                      )}
                  </div>
               </Panel>
           </div>

        </div>
        
        {/* Strategic Urgency Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="col-span-1 lg:col-span-12">
                <Panel title="Academic Urgency Scanner" icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         
                         {/* Urgent Task 1 */}
                         <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl flex items-start gap-4 hover:border-orange-500/50 transition-colors cursor-pointer group">
                             <div className="bg-orange-500/20 p-2 rounded-lg">
                                 <Flame className="w-6 h-6 text-orange-500 group-hover:animate-pulse" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="text-white font-bold text-sm tracking-wide">HLTH1011: Research Framework</h4>
                                 <div className="flex items-center gap-2 mt-2">
                                     <Clock className="w-3.5 h-3.5 text-orange-400" />
                                     <span className="text-xs text-orange-400 font-mono font-bold uppercase tracking-widest">Due in 48 Hours</span>
                                 </div>
                                 <div className="w-full bg-black/60 h-1.5 mt-3 rounded-full overflow-hidden">
                                     <div className="bg-orange-500 h-full w-[85%]" />
                                 </div>
                             </div>
                         </div>
                         
                         {/* Critical Task 2 */}
                         <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-4 hover:border-rose-500/50 transition-colors cursor-pointer group">
                             <div className="bg-rose-500/20 p-2 rounded-lg">
                                 <AlertTriangle className="w-6 h-6 text-rose-500 group-hover:animate-pulse" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="text-white font-bold text-sm tracking-wide">GENS2101: NRM Midterm</h4>
                                 <div className="flex items-center gap-2 mt-2">
                                     <Clock className="w-3.5 h-3.5 text-rose-400" />
                                     <span className="text-xs text-rose-400 font-mono font-bold uppercase tracking-widest">Due in 15 Hours</span>
                                 </div>
                                 <div className="w-full bg-black/60 h-1.5 mt-3 rounded-full overflow-hidden">
                                     <div className="bg-rose-500 h-full w-[95%] animate-pulse" />
                                 </div>
                             </div>
                         </div>

                         {/* Nominal Process */}
                         <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-4 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                             <div className="bg-emerald-500/20 p-2 rounded-lg">
                                 <Activity className="w-6 h-6 text-emerald-500" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="text-white font-bold text-sm tracking-wide">Moodle Side-Cart Sync</h4>
                                 <div className="flex items-center gap-2 mt-2">
                                     <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-widest">Nominal / No Threats</span>
                                 </div>
                                 <div className="w-full bg-black/60 h-1.5 mt-3 rounded-full overflow-hidden">
                                     <div className="bg-emerald-500 h-full w-[10%]" />
                                 </div>
                             </div>
                         </div>
                         
                     </div>
                </Panel>
            </div>
        </div>

        {/* Omnipresent Voice Telemetry Log */}
        <div className="mt-6">
            <Panel title="Apple Hardware Voice Matrix (10.0.0.245)" icon={<Activity className="w-4 h-4 text-emerald-400" />}>
                <div className="flex flex-col gap-2 h-[150px] overflow-y-auto custom-scrollbar pr-2">
                    {!voiceBounties || voiceBounties.length === 0 ? (
                        <div className="text-xs font-mono uppercase tracking-widest text-slate-500 h-full flex items-center justify-center">Awaiting Apple Hardware Uplink...</div>
                    ) : (
                        voiceBounties.map((v: any) => (
                            <div key={v.id} className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase font-bold">{v.intent || v.status}</span>
                                        <span className="text-[9px] font-mono text-slate-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-white text-sm font-sans italic">"{v.transcript}"</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Panel>
        </div>

        {/* Singularity Engine Sandbox */}
        <div className="mt-6">
            <Panel title="Singularity Engine Sandbox (Staging Queue)" icon={<ShieldAlert className="w-4 h-4 text-purple-400" />}>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {!proposals || proposals.length === 0 ? (
                        <div className="text-xs font-mono uppercase tracking-widest text-slate-500 p-8 text-center border border-dashed border-slate-700/50 rounded-xl bg-black/20">
                            Awaiting Autonomous Code Proposals...
                        </div>
                    ) : (
                        proposals.map(proposal => (
                            <div key={proposal.id} className="bg-purple-900/10 border border-purple-500/30 p-4 rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="font-mono text-xs text-purple-300 font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded">PROPOSAL: {proposal.file_path.split('/').pop()}</span>
                                    </div>
                                    <span className="text-[10px] py-0.5 px-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-mono uppercase tracking-widest">
                                        {proposal.status || 'staging:broadcast'}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-xs font-mono bg-black/50 p-3 rounded-lg border border-slate-700">
                                    "{proposal.description}"
                                </p>
                                
                                <div className="rounded-lg overflow-hidden border border-slate-700 mt-2 text-[10px] [&_td]:font-mono">
                                    <ReactDiffViewer 
                                        oldValue={proposal.original_content} 
                                        newValue={proposal.proposed_content} 
                                        splitView={true} 
                                        useDarkTheme={true}
                                        hideLineNumbers={false}
                                    />
                                </div>

                                <div className="flex items-center gap-3 mt-3">
                                    <button 
                                        onClick={() => handleMergeProposal(proposal)}
                                        className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors font-mono hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        Approve (Merge to Live)
                                    </button>
                                    <button 
                                        onClick={() => handleRejectProposal(proposal)}
                                        className="bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-400 px-4 py-2 rounded text-[10px] uppercase font-bold tracking-widest transition-colors font-mono hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                        Reject & Immolate
                                    </button>
                                    <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest ml-auto px-2">Pending Human Authorization</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Panel>
        </div>

        {/* Tactical God-Prompt Console */}
        <div className={`mt-6 border rounded-xl overflow-hidden flex flex-col transition-all duration-700 ${isCasting ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-amber-900/20' : 'border-slate-800 bg-black/60'}`}>
            <div className={`px-4 py-2 flex items-center justify-between border-b transition-colors ${isCasting ? 'bg-amber-900/40 border-amber-500/50' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${isCasting ? 'text-amber-400 animate-spin' : 'text-amber-500'}`} />
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${isCasting ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                        {isCasting ? 'ARCHON LEVEL CASCADE INITIATED...' : 'TACTICAL GOD-PROMPT DISPATCHER'}
                    </span>
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-widest flex items-center gap-1 ${isCasting ? 'text-amber-400' : 'text-emerald-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCasting ? 'bg-amber-400' : 'bg-emerald-500'}`} /> Mode 6 Sync
                </span>
            </div>
            <div className="p-4 flex gap-3">
                <input 
                    type="text" 
                    value={godPrompt}
                    onChange={(e) => setGodPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGodPrompt(); }}
                    disabled={isCasting}
                    placeholder="ENTER OMNISCIENT OVERRIDE... (e.g. 'Extract Zotero vectors, deploy Alchemist hedge, and draft Epoch 36 brief')" 
                    className={`flex-1 bg-slate-900/50 border rounded-lg px-4 py-3 text-white font-mono text-xs focus:outline-none transition-all uppercase tracking-wide ${isCasting ? 'border-amber-500/50 text-amber-100 placeholder-amber-900/50' : 'border-slate-800 focus:border-amber-500/50 placeholder-slate-600'}`}
                />
                <button 
                    disabled={isCasting || !godPrompt.trim()}
                    onClick={handleGodPrompt}
                    className={`px-8 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold transition-all ${isCasting ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.8)]' : 'bg-amber-600 hover:bg-amber-500 border border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                    {isCasting ? 'FRACTURING CONSCIOUSNESS...' : 'EXECUTE GOD-PROMPT'}
                </button>
            </div>
        </div>

        {/* Archon Sentinel & Singularity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="col-span-1 lg:col-span-6">
                <Panel title="Archon Lint Sweeper (PEP 2027)" icon={<ShieldAlert className="w-4 h-4 text-orange-400" />}>
                   <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                       <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                           <div>
                               <h3 className="text-white font-bold text-lg">AST Synthesis Status</h3>
                               <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mt-1">/core background worker</p>
                           </div>
                           <div className="text-right">
                               <span className="text-xl font-bold font-mono text-orange-400">72</span>
                               <span className="text-xs text-slate-500 uppercase tracking-widest ml-2">Files Scanned</span>
                           </div>
                       </div>
                       
                       <div className="flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                   <span className="font-mono text-xs text-slate-300 uppercase tracking-widest">Structurally Flawless</span>
                               </div>
                               <span className="font-mono font-bold text-emerald-400">7</span>
                           </div>
                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse" />
                                   <span className="font-mono text-xs text-slate-300 uppercase tracking-widest">Awaiting LLM Refactoring</span>
                               </div>
                               <span className="font-mono font-bold text-orange-400">65</span>
                           </div>
                       </div>
                       
                       <div className="mt-8 border border-orange-500/20 bg-orange-900/10 p-4 rounded-lg flex items-start gap-4 cursor-crosshair hover:bg-orange-900/20 transition-colors">
                           <Sparkles className="w-5 h-5 text-orange-400" />
                           <div>
                               <h4 className="text-orange-300 font-bold text-xs uppercase tracking-widest font-mono">Spawn Refactoring Matrix</h4>
                               <p className="text-orange-500/70 text-[10px] uppercase tracking-widest mt-1 font-mono">Unleash Docker safely to systematically rewrite all legacy Python structures.</p>
                           </div>
                       </div>
                   </div>
                </Panel>
            </div>
            
            <div className="col-span-1 lg:col-span-6">
                <Panel title="Singularity Autonomy Ledger (git log)" icon={<Activity className="w-4 h-4 text-purple-400" />}>
                   <div className="bg-black/60 border border-slate-800 rounded-xl h-[300px] overflow-y-auto custom-scrollbar p-1">
                      {gitLogData && gitLogData.commits ? (
                          <div className="flex flex-col gap-2">
                              {gitLogData.commits.map((commit: any) => (
                                  <div key={commit.id} className={`p-4 rounded-lg flex gap-4 ${commit.is_ai_generated ? 'bg-purple-900/10 border border-purple-500/30' : 'bg-slate-900/50 border border-slate-800'}`}>
                                      <div className={`font-mono text-xs font-bold pt-0.5 ${commit.is_ai_generated ? 'text-purple-400' : 'text-slate-500'}`}>
                                          [{commit.id}]
                                      </div>
                                      <div className="flex-1">
                                          <h4 className={`text-sm tracking-wide font-sans ${commit.is_ai_generated ? 'text-purple-300 font-bold' : 'text-slate-300'}`}>
                                              {commit.message}
                                          </h4>
                                          <div className="flex gap-4 mt-2">
                                              <span className={`font-mono text-[9px] uppercase tracking-widest ${commit.is_ai_generated ? 'text-purple-500/60' : 'text-slate-600'}`}>{commit.timestamp}</span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="h-full flex items-center justify-center font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                              Loading Canonical History...
                          </div>
                      )}
                   </div>
                </Panel>
            </div>
        </div>

      </div>
    </NexusLayout>
  );
}
