
import React, { useState } from 'react';
import { CodeGenerationTask } from '../../../services/code-orchestration/types';

export default function CodeGenerationPanel() {
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState<CodeGenerationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'planning' | 'executing' | 'done'>('idle');

  const handlePlan = async () => {
    if (!prompt) return;
    setLoading(true);
    setStatus('planning');
    try {
      const res = await fetch('/api/cortex/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setStatus('executing');
    try {
      const res = await fetch('/api/cortex/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      if (data.results) {
        setTasks(data.results);
        setStatus('done');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden glass-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
          Cortex Orchestrator
        </h2>
        <div className="text-xs text-slate-400 font-mono flex gap-2">
           <span className={status === 'planning' ? 'text-yellow-400 animate-pulse' : ''}>PLAN</span>
           <span>→</span>
           <span className={status === 'executing' ? 'text-blue-400 animate-pulse' : ''}>EXEC</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 flex gap-2">
        <textarea 
          className="flex-1 bg-slate-950/50 border border-white/10 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors placeholder-slate-600"
          placeholder="Describe your coding task (e.g., 'Create a React component for displaying agent metrics')..."
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handlePlan}
          disabled={loading || !prompt}
          className="px-4 py-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-900/20"
        >
          {status === 'planning' ? 'Thinking...' : 'Plan'}
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map((task, idx) => (
          <div key={idx} className={`p-3 rounded border ${task.status === 'completed' ? 'border-green-500/30 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-slate-200">Task {idx + 1}: {task.complexity}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                task.assignedAgent === 'claude' ? 'bg-orange-500/20 text-orange-300' :
                task.assignedAgent === 'copilot' ? 'bg-blue-500/20 text-blue-300' :
                task.assignedAgent === 'gemini' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-700'
              }`}>
                {task.assignedAgent || 'Unassigned'}
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{task.description}</p>
            <div className="text-xs text-slate-500 font-mono">Files: {task.files.join(', ')}</div>
            
            {task.code && (
              <div className="mt-3 p-2 bg-black/40 rounded text-xs font-mono text-green-300 overflow-x-auto">
                <pre>{task.code.slice(0, 150)}...</pre>
              </div>
            )}
          </div>
        ))}

        {tasks.length > 0 && status !== 'done' && status !== 'executing' && (
          <button 
            onClick={handleExecute}
            className="w-full py-3 mt-4 bg-green-600/20 border border-green-500/50 text-green-400 rounded hover:bg-green-600/30 transition-all font-mono uppercase tracking-wider"
          >
            Execute Swarm
          </button>
        )}
      </div>
    </div>
  );
}
