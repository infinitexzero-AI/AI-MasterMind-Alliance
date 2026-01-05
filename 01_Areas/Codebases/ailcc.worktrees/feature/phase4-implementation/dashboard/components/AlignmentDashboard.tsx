import React from 'react';

interface Task {
  taskId: string;
  taskType: string;
  status: string;
  agentAssigned: string;
  duration?: number;
  successIndicator?: boolean;
}

interface TelemetryData {
  timestamp: string;
  overallStatus: string;
  tasksInFlight: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageLatency: number;
  recentTasks: Task[];
}

export default function AlignmentDashboard({ data }: { data: TelemetryData | null }) {
  if (!data) return (
    <div className="glass-panel p-6 h-64 flex items-center justify-center text-slate-500 animate-pulse">
      Waiting for Alignment Data...
    </div>
  );

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold tracking-widest text-slate-100 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${
            data.overallStatus === 'ok' ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'
          }`} />
          ALIGNMENT DASHBOARD
        </h2>
        <span className="font-mono text-xs text-slate-400">{data.timestamp}</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="In Flight" value={data.tasksInFlight} color="text-cyan-400" />
        <KpiCard label="Completed" value={data.tasksCompleted} color="text-purple-400" />
        <KpiCard label="Failed" value={data.tasksFailed} color="text-red-400" />
        <KpiCard label="Avg Latency" value={`${typeof data.averageLatency === 'object' ? '---' : data.averageLatency}ms`} color="text-yellow-400" />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="panel-header">Recent Agent Tasks</h3>
        <div className="space-y-2">
          {data.recentTasks && Array.isArray(data.recentTasks) ? data.recentTasks.map((task) => (
            <div key={task.taskId || Math.random()} className="bg-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                }`} />
                <div>
                  <div className="font-mono text-sm text-slate-200">{String(task.taskId || 'UNK')}</div>
                  <div className="text-xs text-slate-500 uppercase">{String(task.taskType || 'GENERIC')} • {String(task.agentAssigned || 'SYSTEM')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-cyan-400">{task.duration ? `${task.duration}ms` : '---'}</div>
                <div className="text-xs text-slate-500">{String(task.status || 'PENDING')}</div>
              </div>
            </div>
          )) : (
            <div className="text-xs text-slate-500 italic p-2">No recent tasks or invalid data format.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string, value: any, color: string }) {
  // Safety check for value
  const displayValue = (typeof value === 'object' || value === undefined || value === null) 
    ? (value === null ? '0' : '---') 
    : String(value);

  return (
    <div className="glass-panel p-4 flex flex-col items-center justify-center bg-slate-900/40">
      <span className={`text-2xl font-bold font-mono ${color}`}>{displayValue}</span>
      <span className="text-xs uppercase tracking-wider text-slate-500 mt-1">{label}</span>
      <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
        <div className={`h-full ${color.replace('text-', 'bg-')} opacity-50 w-2/3`}></div>
      </div>
    </div>
  );
}
