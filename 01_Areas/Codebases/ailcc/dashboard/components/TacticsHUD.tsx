import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Zap, Shield, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNeuralSync } from './NeuralSyncProvider';

interface TacticalMetrics {
  systemHealth: number;
  agentsOnline: number;
  agentsTotal: number;
  tasksActive: number;
  criticalBlocks: number;
  dataSync: string;
  protocol: string;
}

function TacticsHUD() {
  const [time, setTime] = useState(new Date());
  const [pulseIntensity, setPulseIntensity] = useState(0.5);
  const [systemActivity, setSystemActivity] = useState(65);
  const [lastKnownMetrics, setLastKnownMetrics] = useState<TacticalMetrics | null>(null);
  const [taskSummary, setTaskSummary] = useState<any>(null);

  // Real-time data from Valentine Core via WebSocket
  const { agents, storage, isConnected, connectionHealth } = useNeuralSync();

  // Calculate metrics from real-time data
  const metrics = useMemo<TacticalMetrics>(() => {
    // System Health: Based on connection quality + errors
    let systemHealth = 0;
    if (isConnected) {
      if (connectionHealth.state === 'connected') {
        systemHealth = 98 - Math.min(connectionHealth.errors.length * 5, 30);
      } else {
        systemHealth = 45; // Degraded
      }
    }

    // Agents Online: Count active agents (IDLE, EXECUTING, THINKING)
    const agentsOnline = agents.filter(a => 
      a.status === 'IDLE' || 
      a.status === 'EXECUTING' || 
      a.status === 'THINKING'
    ).length;

    // Data Sync: Based on storage state
    const icloudActive = storage?.icloud?.active || false;
    const onedriveActive = storage?.onedrive?.active || false;
    const dataSync = (icloudActive && onedriveActive)
      ? 'ACTIVE'
      : (icloudActive || onedriveActive)
      ? 'PARTIAL'
      : 'OFFLINE';

    return {
      systemHealth,
      agentsOnline,
      agentsTotal: agents.length,
      tasksActive: 0, // TODO: Integrate Mode 6 data when available
      criticalBlocks: 0, // TODO: Integrate Mode 6 data when available
      dataSync,
      protocol: 'AILCC_SYNC_V3'
    };
  }, [agents, isConnected, connectionHealth, storage]);

  // Cache last known metrics for fallback when offline
  useEffect(() => {
    if (isConnected && metrics) {
      setLastKnownMetrics(metrics);
    }
  }, [isConnected, metrics]);

  // Use current metrics if connected, otherwise fallback to last known
  const displayMetrics = isConnected ? metrics : (lastKnownMetrics || {
    systemHealth: 0,
    agentsOnline: 0,
    agentsTotal: 0,
    tasksActive: 0,
    criticalBlocks: 0,
    dataSync: 'OFFLINE',
    protocol: 'AILCC_SYNC_V3'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const fetchTaskSummary = async () => {
      try {
        const res = await fetch('/data/task_summary.json');
        if (res.ok) {
          const data = await res.json();
          const reliability = data.total_tasks > 0 
            ? Math.round(((data.successful_tasks - data.mock_tasks) / data.total_tasks) * 100) 
            : 0;
          setTaskSummary({ ...data, reliability });
        }
      } catch (e) {
        console.error('Failed to fetch task summary:', e);
      }
    };
    fetchTaskSummary();
    const taskInterval = setInterval(fetchTaskSummary, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(taskInterval);
    };
  }, []);

  useEffect(() => {
    const pulse = setInterval(() => {
      setPulseIntensity(0.3 + Math.random() * 0.7);
      setSystemActivity(60 + Math.random() * 30);
    }, 2000);
    return () => clearInterval(pulse);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6 rounded-xl shadow-2xl border border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Main Tactical HUD */}
        <div className="relative bg-black/80 border-2 border-cyan-500/50 rounded-lg overflow-hidden mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          {/* Animated Scan Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
          </div>

          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500" />

          <div className="relative p-6">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
                <div>
                  <div className="text-cyan-400 font-mono text-xl font-bold tracking-wider">
                    NEXUS COMMAND CENTER
                  </div>
                  <div className="text-cyan-300/60 text-xs font-mono uppercase tracking-widest">
                    {displayMetrics.protocol} // TACTICAL INTERFACE
                  </div>
                </div>
              </div>

              {/* System Time */}
              <div className="text-right">
                <div className="text-emerald-400 font-mono text-2xl font-bold tabular-nums">
                  {time.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div className="text-emerald-300/60 text-xs font-mono uppercase">
                  {time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Task Reliability Metrics */}
            {taskSummary && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-400 uppercase">Mission Reliability</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">{taskSummary.reliability}%</span>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Success</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{taskSummary.successful_tasks}</span>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 uppercase">Mock Mode</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{taskSummary.mock_tasks}</span>
                </div>
                <div className="bg-rose-900/20 border border-rose-500/30 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400 uppercase">Total Tasks</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">{taskSummary.total_tasks}</span>
                </div>
              </div>
            )}

            {/* Main Pulse Line */}
            <div className="relative h-20 mb-6 bg-black/50 rounded border border-cyan-500/30 overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-10 tactical-radar-grid" />

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={pulseIntensity} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 40 Q 100 ${40 - systemActivity * 0.3} 200 40 T 400 40 T 600 40 T 800 40 T 1000 40`}
                  fill="none"
                  stroke="url(#pulseGradient)"
                  strokeWidth="3"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute bottom-2 left-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-mono text-xs font-semibold">
                  ACTIVITY: {systemActivity.toFixed(0)}%
                </span>
              </div>

              <div className="absolute bottom-2 right-4 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"
                />
                <span className="text-emerald-400 font-mono text-xs font-semibold">
                  SYNC: {displayMetrics.dataSync}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-orange-500/40 rounded-lg p-3 hover:border-orange-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  {displayMetrics.systemHealth < 80 && (
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  )}
                </div>
                <div className="text-3xl font-bold text-orange-400 font-mono tracking-tighter">
                  {displayMetrics.systemHealth}%
                </div>
                <div className="text-orange-300/60 text-xs font-mono font-bold">HEALTH</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/40 rounded-lg p-3 hover:border-emerald-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tighter">
                  {displayMetrics.agentsOnline}/{displayMetrics.agentsTotal}
                </div>
                <div className="text-emerald-300/60 text-xs font-mono font-bold">AGENTS</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 rounded-lg p-3 hover:border-cyan-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="text-3xl font-bold text-cyan-400 font-mono tracking-tighter">
                  {displayMetrics.tasksActive}
                </div>
                <div className="text-cyan-300/60 text-xs font-mono font-bold">TASKS</div>
              </div>

              <div className="bg-gradient-to-br from-rose-900/40 to-pink-900/40 border border-rose-500/40 rounded-lg p-3 hover:border-rose-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-mono font-black text-rose-400 bg-black/50 px-1 rounded">ALERT</div>
                </div>
                <div className="text-3xl font-bold text-rose-400 font-mono tracking-tighter">
                  {displayMetrics.criticalBlocks}
                </div>
                <div className="text-rose-300/60 text-xs font-mono font-bold">BLOCKS</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/40 rounded-lg p-3 hover:border-indigo-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <div className="text-lg font-black text-indigo-400 font-mono tracking-tight leading-none pt-2">
                  {displayMetrics.dataSync}
                </div>
                <div className="text-indigo-300/60 text-xs font-mono font-bold">SYNC</div>
              </div>

              <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border border-teal-500/40 rounded-lg p-3 hover:border-teal-400 transition-colors cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  <div className="text-[10px] font-mono font-black text-teal-400">READY</div>
                </div>
                <div className="text-lg font-black text-teal-400 font-mono tracking-tight leading-none pt-2">
                  {displayMetrics.protocol}
                </div>
                <div className="text-teal-300/60 text-xs font-mono font-bold">MODE</div>
              </div>
            </div>

            {/* Bottom Status Text */}
            <div className="mt-6 flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-cyan-500/40 border-t border-cyan-500/20 pt-4">
              <div className="flex items-center gap-6">
                <span className="hover:text-cyan-400 transition-colors">OS: SEQUOIA v15.1</span>
                <span>•</span>
                <span className="hover:text-cyan-400 transition-colors">CORE: VALENTINE v2.0.2</span>
                <span>•</span>
                <span className="hover:text-cyan-400 transition-colors uppercase">Status: Nominal Response</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 group cursor-default">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:shadow-[0_0_10px_#10b981]" />
                <span className="group-hover:text-emerald-300 transition-colors">ALL SYSTEMS MATERIALIZED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Log Sub-panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/20 rounded-lg p-6 group hover:border-cyan-500/40 transition-all">
            <h3 className="text-cyan-400 font-mono font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> 00 // RECENT_INTEL_STREAM
            </h3>
            <div className="space-y-2 font-mono text-[11px] text-cyan-300/60 overflow-hidden h-24">
              <p className="border-l-2 border-cyan-500/50 pl-2">SYSTEM: 114/120 Credits verified. graduation_readiness: 95%</p>
              <p className="border-l-2 border-emerald-500/50 pl-2 text-emerald-400/80">AGENT: Scholar connection established (Winter 2026 term).</p>
              <p className="border-l-2 border-amber-500/50 pl-2 text-amber-400/80">WARN: SSD critical threshold (735Mi free). Migration nexus ready.</p>
              <p className="animate-pulse pl-2 opacity-40">_ listening for neural feed output...</p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-indigo-500/20 rounded-lg p-6 group hover:border-indigo-500/40 transition-all">
            <h3 className="text-indigo-400 font-mono font-bold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 01 // ORCHESTRATION_QUOTA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-indigo-400 font-mono text-2xl font-black">{displayMetrics.agentsOnline * 12}%</div>
                <div className="text-indigo-300/40 text-[9px] font-mono leading-none font-bold">TOTAL_COMPUTE_LOAD</div>
              </div>
              <div>
                <div className="text-indigo-400 font-mono text-2xl font-black">45ms</div>
                <div className="text-indigo-300/40 text-[9px] font-mono leading-none font-bold">LATENCY_HEARTBEAT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(TacticsHUD);
