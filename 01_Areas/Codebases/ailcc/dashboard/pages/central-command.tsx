import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Terminal, Database } from 'lucide-react';
import NexusLayout from '../components/NexusLayout';
import MissionControl from '../components/MissionControl';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import SwarmStatusPanel, { SwarmSession } from '../src/components/AILCC_V2/SwarmStatusPanel';
import CostTrackingPanel from '../src/components/AILCC_V2/CostTrackingPanel';
import ErrorAggregationPanel from '../src/components/AILCC_V2/ErrorAggregationPanel';
import WorkloadDistributionChart from '../src/components/AILCC_V2/WorkloadDistributionChart';

export default function CentralCommand() {
  const { actionPlan, signals, isConnected } = useSwarmTelemetry();
  const [status, setStatus] = useState('OPTIMAL');
  const [swarmSession, setSwarmSession] = useState<SwarmSession | null>(null);
  const [taskSummary, setTaskSummary] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Hydration fix: only show dynamic values after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Phase 72: Real-time map of actionPlan to the presentation SwarmSession
  useEffect(() => {
    if (actionPlan) {
      setSwarmSession({
        id: actionPlan.id || 'live-session',
        goal: actionPlan.title || 'Mastermind Alliance Execution',
        status: actionPlan.status === 'COMPLETED' ? 'COMPLETED' : 'EXECUTING',
        steps: (actionPlan.steps || []).map((s: any) => ({
          id: s.id,
          description: s.title,
          targetAgent: s.title.includes('comet') ? 'comet' : (s.title.includes('grok') ? 'grok' : 'neural_mesh'),
          status: s.status,
          requiresApproval: false,
          riskLevel: 'low'
        })),
        currentStepId: (actionPlan.steps || []).find((s: any) => s.status === 'in_progress')?.id,
        metrics: {
          totalCost: 1.57,
          dailyBudget: 10.0,
          agentCosts: [
            { agent: 'comet', cost: 0.12, tokens: 450, percentage: 8 },
            { agent: 'grok', cost: 1.45, tokens: 2800, percentage: 92 }
          ],
          workloads: []
        },
        errors: []
      });
    } else {
        setSwarmSession(null);
    }
  }, [actionPlan]);

  // Fetch static task history for the Mission Archive
  useEffect(() => {
    const fetchTaskSummary = async () => {
      try {
        const res = await fetch('/data/task_summary.json');
        if (res.ok) {
          const data = await res.json();
          setTaskSummary(data);
        }
      } catch (error) {
        console.error('Failed to fetch task summary:', error);
      }
    };
    fetchTaskSummary();
  }, []);

  const handleApprove = async (stepId: string, comment?: string) => {
    try {
      const res = await fetch('/api/swarm/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, approved: true, comment, approvedBy: 'joel' }),
      });
      await res.json();
      // Refetch session to update UI
      const sessionRes = await fetch('/api/swarm/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSwarmSession(sessionData.session);
      }
    } catch (error) {
      console.error('Failed to approve step:', error);
    }
  };

  const handleReject = async (stepId: string, comment?: string) => {
    try {
      const res = await fetch('/api/swarm/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, approved: false, comment, rejectedBy: 'joel' }),
      });
      await res.json();
      // Refetch session to update UI
      const sessionRes = await fetch('/api/swarm/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSwarmSession(sessionData.session);
      }
    } catch (error) {
      console.error('Failed to reject step:', error);
    }
  };

  const performanceMetrics = [
    { label: 'Neural Sync', value: mounted ? (isConnected ? '100%' : 'OFFLINE') : '—', icon: Zap, color: 'text-cyan-400' },
    { label: 'Vault Latency', value: '1ms', icon: Activity, color: 'text-green-400' },
    { label: 'Active Targets', value: mounted ? (actionPlan ? [...new Set((actionPlan.steps || []).map((s:any) => s.title.split(' ')[0]))].length.toString() : '0') : '—', icon: Shield, color: 'text-purple-400' },
  ];

  const handlePerformanceBoost = async () => {
    setStatus('OPTIMIZING...');
    try {
      const res = await fetch('/api/system/optimize', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || 'OPTIMAL');
      } else {
        setStatus('DEGRADED');
      }
    } catch {
      setStatus('ERROR');
    }
    setTimeout(() => setStatus('OPTIMAL'), 5000); // Reset to baseline after display
  };

  return (
    <NexusLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b border-slate-700/30 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Central Command</h1>
            <p className="text-slate-400 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'OPTIMAL' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
              System Status: <span className="font-mono text-slate-100">{status}</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePerformanceBoost}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          >
            <Zap className="w-4 h-4" />
            PERFORMANCE BOOST
          </motion.button>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="renaissance-panel p-6 rounded-2xl border border-slate-700/20 bg-slate-900/40 relative overflow-hidden group">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                </div>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Agent Pulse & Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="renaissance-panel h-96 p-8 rounded-3xl border border-slate-700/20 bg-slate-900/60 relative flex flex-col justify-center items-center">
            <div className="absolute top-6 left-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Agent Pulse</span>
            </div>

            {/* Abstract Pulse Visualization */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 border border-cyan-500/30 rounded-full"
                />
              ))}
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10" />
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm font-mono text-cyan-400">SYNCING WITH VALENTINE</p>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    className="w-8 h-1 bg-cyan-500/50 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Swarm Status Panel */}
          <SwarmStatusPanel
            session={swarmSession}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          <div className="renaissance-panel p-8 rounded-3xl border border-slate-700/20 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-8">
              <Terminal className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Execution Stream</span>
            </div>

            <div className="space-y-4 font-mono text-xs max-h-64 overflow-y-auto">
              {signals.slice(0, 10).map((sig, i) => {
                // Determine severity color safely
                let colorClass = 'text-cyan-400';
                if (sig.severity === 'CRITICAL') colorClass = 'text-red-400';
                else if ((sig.severity as any) === 'WARNING' || (sig.severity as any) === 'HIGH') colorClass = 'text-amber-400';

                return (
                  <p key={sig.signal_id || i} className={`${colorClass} flex gap-4`}>
                      <span className="opacity-50">[{new Date(sig.timestamp).toLocaleTimeString()}]</span>
                      <span>{sig.message}</span>
                  </p>
                );
              })}
              {signals.length === 0 && (
                <p className="text-slate-400 flex gap-4 italic opacity-50">
                  <span>[-]</span>
                  <span>Awaiting task delegation from Prime...</span>
                </p>
              )}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-4 bg-slate-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Mission Archive Status */}
        {taskSummary && (
          <div className="renaissance-panel p-8 rounded-3xl border border-slate-700/20 bg-slate-900/60">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Mission Archive Status (Last 100 Tasks)</span>
              </div>
              <div className="flex gap-4 text-[10px] font-mono">
                <span className="text-emerald-400">SUCCESS: {taskSummary.successful_tasks}</span>
                <span className="text-rose-400">FAILED: {taskSummary.failed_tasks}</span>
                <span className="text-blue-400">MOCK: {taskSummary.mock_tasks}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {taskSummary.recent_history.slice(0, 50).map((task: { taskId: string; success: boolean; mode: string }, idx: number) => (
                <div key={idx} className={`p-2 border rounded-md font-mono text-[9px] flex items-center justify-between ${task.success ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'
                  }`}>
                  <span className="text-slate-400 truncate mr-2" title={task.taskId}>{task.taskId.split('-')[0]}</span>
                  <span className={task.success ? 'text-emerald-400' : 'text-rose-400'}>
                    {task.mode === 'mock' ? 'MOCK' : (task.success ? 'OK' : 'ERR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Tabs Integration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Research', 'Code', 'Finance', 'Scholar'].map((skill) => (
            <button key={skill} className="p-4 rounded-xl border border-slate-700/10 bg-white/5 hover:bg-white/10 transition-all text-left group">
              <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">{skill} Module</p>
              <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400">ACTIVE</p>
            </button>
          ))}
        </div>

        {/* Track 3: Observability Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CostTrackingPanel
              costs={swarmSession?.metrics?.agentCosts}
              totalCost={swarmSession?.metrics?.totalCost}
              dailyBudget={swarmSession?.metrics?.dailyBudget}
            />
          </div>
          <div className="lg:col-span-2">
            <WorkloadDistributionChart
              workloads={swarmSession?.metrics?.workloads}
            />
          </div>
        </div>

        {/* Error Aggregation */}
        <ErrorAggregationPanel
          errors={swarmSession?.errors}
        />

        {/* Mission Control Integration */}
        <div className="w-full">
          <MissionControl />
        </div>
      </div>
    </NexusLayout>
  );
}
