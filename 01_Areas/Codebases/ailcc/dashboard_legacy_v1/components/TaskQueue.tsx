import React from 'react';
import { useTaskQueue, TaskMetric } from './hooks/useTaskQueue';

export default function TaskQueue() {
  const { pipeline, loading } = useTaskQueue();

  if (loading) return (
    <div className="glass-panel p-6 rounded-xl animate-pulse h-64">
      <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
    </div>
  );

  return (
    <section className="glass-panel p-6 rounded-xl h-full overflow-hidden flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Pipeline Queue</h2>
        <div className="flex gap-4 text-xs font-mono text-slate-400">
           <span>ACTIVE: <b className="text-blue-400">{pipeline?.stats.active || 0}</b></span>
           <span>PENDING: <b className="text-yellow-400">0</b></span>
           <span>DONE: <b className="text-green-400">{pipeline?.stats.completed || 0}</b></span>
        </div>
      </header>

      {!pipeline || pipeline.tasks.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-white/5 rounded-lg border-2 border-dashed border-white/5">
          Awaiting tasks...
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {pipeline.tasks.map(task => (
            <TaskCard key={task.taskId} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}

function TaskCard({ task }: { task: TaskMetric }) {
  const statusColor = {
    pending: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-200',
    running: 'border-blue-500/20 bg-blue-500/5 text-blue-200',
    completed: 'border-green-500/20 bg-green-500/5 text-green-200',
    failed: 'border-red-500/20 bg-red-500/5 text-red-200'
  }[task.status];
  
  const statusIcon = {
    pending: '⏳', running: '⚙️', completed: '✅', failed: '❌'
  }[task.status];

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors hover:bg-white/5 ${statusColor}`}>
      <div className="flex items-center gap-4">
        <span className="text-lg opacity-80">{statusIcon}</span>
        <div>
          <h4 className="font-bold text-sm tracking-wide">{task.taskId}</h4>
          <p className="text-[10px] opacity-70 uppercase font-mono tracking-wider">{task.taskType} • {task.agentAssigned}</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-[10px] font-mono opacity-50">
           {new Date(task.startTime).toLocaleTimeString([], {hour12: false})}
        </div>
        {task.duration && (
            <div className="text-xs font-bold opacity-90">
                {(task.duration / 1000).toFixed(2)}s
            </div>
        )}
      </div>
    </div>
  );
}
