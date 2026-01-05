import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Download, ExternalLink } from 'lucide-react';

export default function ImplementationTracker() {
  const [tasks, setTasks] = useState([
    // Phase 1: Setup
    { id: 1, phase: 'Setup', title: 'Download & run quick-start script', status: 'pending', time: '5 min', priority: 'high' },
    { id: 2, phase: 'Setup', title: 'Verify Node.js installation', status: 'pending', time: '2 min', priority: 'high' },
    { id: 3, phase: 'Setup', title: 'Create project directory', status: 'pending', time: '1 min', priority: 'high' },
    
    // Phase 2: API Tokens
    { id: 4, phase: 'Tokens', title: 'Generate GitHub token', status: 'pending', time: '5 min', priority: 'critical', link: 'https://github.com/settings/tokens' },
    { id: 5, phase: 'Tokens', title: 'Generate Linear API key', status: 'pending', time: '3 min', priority: 'critical', link: 'https://linear.app/settings/api' },
    { id: 6, phase: 'Tokens', title: 'Generate Notion token', status: 'pending', time: '5 min', priority: 'critical', link: 'https://www.notion.so/my-integrations' },
    { id: 7, phase: 'Tokens', title: 'Generate OpenAI key', status: 'pending', time: '3 min', priority: 'high', link: 'https://platform.openai.com/api-keys' },
    { id: 8, phase: 'Tokens', title: 'Generate Anthropic key', status: 'pending', time: '3 min', priority: 'high', link: 'https://console.anthropic.com/settings/keys' },
    { id: 9, phase: 'Tokens', title: 'Generate Perplexity key', status: 'pending', time: '3 min', priority: 'high', link: 'https://www.perplexity.ai/settings/api' },
    
    // Phase 3: Configuration
    { id: 10, phase: 'Config', title: 'Edit .env file with tokens', status: 'pending', time: '5 min', priority: 'critical' },
    { id: 11, phase: 'Config', title: 'Update valentine.config.js (org/team/db IDs)', status: 'pending', time: '5 min', priority: 'critical' },
    { id: 12, phase: 'Config', title: 'Verify .gitignore includes .env', status: 'pending', time: '1 min', priority: 'critical' },
    
    // Phase 4: Testing
    { id: 13, phase: 'Testing', title: 'Run test-connection.js', status: 'pending', time: '3 min', priority: 'high' },
    { id: 14, phase: 'Testing', title: 'Verify GitHub connection', status: 'pending', time: '2 min', priority: 'high' },
    { id: 15, phase: 'Testing', title: 'Verify Notion connection', status: 'pending', time: '2 min', priority: 'medium' },
    { id: 16, phase: 'Testing', title: 'Verify Linear connection', status: 'pending', time: '2 min', priority: 'medium' },
    
    // Phase 5: AI Integration
    { id: 17, phase: 'AI Setup', title: 'Configure Claude Desktop MCP', status: 'pending', time: '10 min', priority: 'high' },
    { id: 18, phase: 'AI Setup', title: 'Configure Grok webhooks', status: 'pending', time: '10 min', priority: 'high' },
    { id: 19, phase: 'AI Setup', title: 'Configure Perplexity integration', status: 'pending', time: '10 min', priority: 'medium' },
    { id: 20, phase: 'AI Setup', title: 'Configure ChatGPT custom GPT', status: 'pending', time: '15 min', priority: 'medium' },
    
    // Phase 6: Advanced
    { id: 21, phase: 'Advanced', title: 'Choose data flow strategy (Context vs RAG)', status: 'pending', time: '5 min', priority: 'medium' },
    { id: 22, phase: 'Advanced', title: 'Set up monitoring & logging', status: 'pending', time: '20 min', priority: 'low' },
    { id: 23, phase: 'Advanced', title: 'Test cross-platform workflow', status: 'pending', time: '15 min', priority: 'high' },
    { id: 24, phase: 'Advanced', title: 'Document custom workflows', status: 'pending', time: '30 min', priority: 'low' },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: task.status === 'complete' ? 'pending' : 'complete' }
        : task
    ));
  };

  const phases = ['Setup', 'Tokens', 'Config', 'Testing', 'AI Setup', 'Advanced'];
  
  const getPhaseProgress = (phase) => {
    const phaseTasks = tasks.filter(t => t.phase === phase);
    const completed = phaseTasks.filter(t => t.status === 'complete').length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  const totalProgress = Math.round((tasks.filter(t => t.status === 'complete').length / tasks.length) * 100);
  const totalTime = tasks.filter(t => t.status === 'pending').reduce((sum, task) => {
    const time = parseInt(task.time);
    return sum + time;
  }, 0);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎯 Valentine Core Implementation</h1>
              <p className="text-purple-300">AI Mastermind Network - Complete Setup Tracker</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-white mb-1">{totalProgress}%</div>
              <div className="text-sm text-purple-300">Complete</div>
              <div className="text-xs text-purple-400 mt-2">
                {totalTime} min remaining
              </div>
            </div>
          </div>
          
          <div className="mt-6 w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-4 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <a 
            href="https://grok.com/project/4f32c776-4273-4386-9792-16e4349a1647"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold">View Grok Dashboard</div>
              <div className="text-sm text-purple-100">Project control center</div>
            </div>
            <ExternalLink size={24} />
          </a>
          
          <button 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-between"
            onClick={() => {
              const script = document.createElement('a');
              script.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('See Quick Start Script artifact');
              script.download = 'valentine-setup.sh';
              script.click();
            }}
          >
            <div>
              <div className="font-bold">Download Setup Script</div>
              <div className="text-sm text-blue-100">Automated installation</div>
            </div>
            <Download size={24} />
          </button>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
            <div className="font-bold">Estimated Time</div>
            <div className="text-3xl font-bold mt-1">{Math.round(totalTime / 60)}h {totalTime % 60}m</div>
            <div className="text-sm text-green-100">Total setup time</div>
          </div>
        </div>

        {/* Phase Progress Bars */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {phases.map(phase => {
            const progress = getPhaseProgress(phase);
            return (
              <div key={phase} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-white font-semibold text-sm mb-2">{phase}</div>
                <div className="text-3xl font-bold text-white mb-2">{progress}%</div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Task List by Phase */}
        {phases.map(phase => (
          <div key={phase} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{phase}</h2>
              <div className="text-purple-300 font-semibold">{getPhaseProgress(phase)}% Complete</div>
            </div>
            
            <div className="space-y-3">
              {tasks.filter(t => t.phase === phase).map(task => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    task.status === 'complete'
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-white/5 border-white/20 hover:border-purple-400'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {task.status === 'complete' ? (
                        <CheckCircle2 className="text-green-400 flex-shrink-0" size={24} />
                      ) : (
                        <Circle className="text-white/40 flex-shrink-0" size={24} />
                      )}
                      
                      <div className="flex-1">
                        <div className={`font-semibold ${task.status === 'complete' ? 'text-green-300 line-through' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-purple-300">
                            <Clock size={12} />
                            {task.time}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)} text-white font-semibold`}>
                            {task.priority}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Generate
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {totalProgress === 100 && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl p-8 backdrop-blur-lg text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Implementation Complete!</h2>
            <p className="text-green-200 text-lg mb-6">
              Your Valentine Core gateway is fully configured and ready to orchestrate multi-AI workflows.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-semibold">Next: Test Workflows</div>
                <div className="text-purple-200 text-sm">Run cross-platform automation tests</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-semibold">Monitor & Scale</div>
                <div className="text-purple-200 text-sm">Set up logging and performance tracking</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}