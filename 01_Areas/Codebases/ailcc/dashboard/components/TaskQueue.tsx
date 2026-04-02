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
        <div className="text-center py-10 text-slate-400 bg-white/5 rounded-lg border-2 border-dashed border-white/5">
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
  const statusStyles = {
    pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100',
    running: 'border-blue-500/40 bg-blue-500/10 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    completed: 'border-green-500/30 bg-green-500/10 text-green-100',
    failed: 'border-red-500/30 bg-red-500/10 text-red-100'
  };

  const statusIcon = {
    pending: '⏳', running: '⚙️', completed: '✅', failed: '❌'
  }[task.status];

  return (
    <div className={`p-3 rounded-lg border flex items-center justify-between transition-all hover:scale-[1.02] ${statusStyles[task.status]}`}>
      <div className="flex items-center gap-3">
        <div className="text-xl bg-black/20 p-2 rounded-md">{statusIcon}</div>
        <div className="flex flex-col">
          <h4 className="font-bold text-xs tracking-wide font-mono">{task.taskId.split('-')[0]}...</h4>
          <span className="text-[10px] uppercase font-bold opacity-60 bg-black/20 px-1.5 py-0.5 rounded self-start mt-1">
            {task.taskType}
          </span>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end gap-1">
        <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest text-white/40">
           {task.agentAssigned}
        </span>
        {task.startTime && (
            <span className="text-[10px] font-mono opacity-80 bg-black/20 px-1 rounded">
               {new Date(task.startTime).toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'})}
            </span>
        )}
      </div>
    </div>
  );
}
