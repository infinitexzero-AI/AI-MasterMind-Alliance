import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Star, Zap, Target, TrendingUp, GitBranch, Database, Shield } from 'lucide-react';

export default function AIMastermindTracker() {
  const [activeView, setActiveView] = useState('progression');
  const [achievements, setAchievements] = useState({
    // Phase 1: Foundation (Unlocked)
    crossCloudSync: { unlocked: true, level: 3, date: '2024-10' },
    webhookIntegration: { unlocked: true, level: 3, date: '2024-11' },
    multiAgentConcept: { unlocked: true, level: 2, date: '2024-11' },
    taskTracking: { unlocked: true, level: 2, date: '2024-12' },
    
    // Phase 2: Integration (Partial)
    valentineCore: { unlocked: false, level: 0, date: null },
    n8nWorkflows: { unlocked: true, level: 2, date: '2024-11' },
    agentRoles: { unlocked: true, level: 2, date: '2024-12' },
    sharedMemory: { unlocked: false, level: 0, date: null },
    
    // Phase 3: Orchestration (Locked)
    centralRouter: { unlocked: false, level: 0, date: null },
    messageQueue: { unlocked: false, level: 0, date: null },
    stateManagement: { unlocked: false, level: 0, date: null },
    errorRecovery: { unlocked: false, level: 0, date: null },
    
    // Phase 4: Advanced (Locked)
    ragSystem: { unlocked: false, level: 0, date: null },
    autonomousDelegate: { unlocked: false, level: 0, date: null },
    feedbackLoops: { unlocked: false, level: 0, date: null },
    selfOptimizing: { unlocked: false, level: 0, date: null }
  });

  const [tasks, setTasks] = useState([
    // URGENT & IMPORTANT (Do First)
    { id: 'T-UI-01', name: 'Deploy Valentine Core Gateway', priority: 'urgent-important', status: 'not-started', agent: 'ChatGPT', phase: 2 },
    { id: 'T-UI-02', name: 'Implement Shared Memory Database', priority: 'urgent-important', status: 'not-started', agent: 'Claude', phase: 2 },
    { id: 'T-UI-03', name: 'Create Message Queue System', priority: 'urgent-important', status: 'not-started', agent: 'ChatGPT', phase: 3 },
    
    // NOT URGENT BUT IMPORTANT (Schedule)
    { id: 'T-NUI-01', name: 'Design Agent Communication Protocol', priority: 'not-urgent-important', status: 'in-progress', agent: 'Claude', phase: 2 },
    { id: 'T-NUI-02', name: 'Build n8n Task Router Workflow', priority: 'not-urgent-important', status: 'not-started', agent: 'ChatGPT', phase: 2 },
    { id: 'T-NUI-03', name: 'Setup Vector Database (RAG)', priority: 'not-urgent-important', status: 'planning', agent: 'Perplexity', phase: 4 },
    { id: 'T-NUI-04', name: 'Create eastcoast-fresh-coats Repo', priority: 'not-urgent-important', status: 'not-started', agent: 'Human', phase: 1 },
    
    // URGENT BUT NOT IMPORTANT (Delegate)
    { id: 'T-UNI-01', name: 'Document Current System State', priority: 'urgent-not-important', status: 'in-progress', agent: 'Claude', phase: 1 },
    { id: 'T-UNI-02', name: 'Test Existing Zap Integrations', priority: 'urgent-not-important', status: 'not-started', agent: 'Human', phase: 1 },
    
    // NOT URGENT & NOT IMPORTANT (Eliminate/Later)
    { id: 'T-NUNI-01', name: 'Explore Additional AI Tools', priority: 'not-urgent-not-important', status: 'backlog', agent: 'Perplexity', phase: 4 },
    { id: 'T-NUNI-02', name: 'Optimize Legacy Automations', priority: 'not-urgent-not-important', status: 'backlog', agent: 'ChatGPT', phase: 4 }
  ]);

  const progressionMap = [
    {
      phase: 1,
      name: 'Foundation Layer',
      color: 'bg-blue-500',
      achievements: ['crossCloudSync', 'webhookIntegration', 'multiAgentConcept', 'taskTracking'],
      description: 'Basic integrations and agent concepts'
    },
    {
      phase: 2,
      name: 'Integration Layer',
      color: 'bg-purple-500',
      achievements: ['valentineCore', 'n8nWorkflows', 'agentRoles', 'sharedMemory'],
      description: 'Agent coordination and data flow'
    },
    {
      phase: 3,
      name: 'Orchestration Layer',
      color: 'bg-orange-500',
      achievements: ['centralRouter', 'messageQueue', 'stateManagement', 'errorRecovery'],
      description: 'Central control and reliability'
    },
    {
      phase: 4,
      name: 'Advanced Intelligence',
      color: 'bg-green-500',
      achievements: ['ragSystem', 'autonomousDelegate', 'feedbackLoops', 'selfOptimizing'],
      description: 'AI-driven optimization'
    }
  ];

  const getAchievementDetails = (key) => {
    const details = {
      crossCloudSync: { name: 'Cross-Cloud Sync', icon: Database, desc: 'Google Drive ↔ OneDrive ↔ iCloud' },
      webhookIntegration: { name: 'Webhook Integration', icon: Zap, desc: 'Linear, Notion, GitHub webhooks' },
      multiAgentConcept: { name: 'Multi-Agent Concept', icon: GitBranch, desc: 'Grok, Claude, ChatGPT, Perplexity roles' },
      taskTracking: { name: 'Task Tracking', icon: Target, desc: 'Dashboard and CSV system' },
      valentineCore: { name: 'Valentine Core Gateway', icon: Shield, desc: 'Central API orchestrator' },
      n8nWorkflows: { name: 'n8n Workflows', icon: TrendingUp, desc: '28 active automations' },
      agentRoles: { name: 'Agent Roles', icon: Star, desc: 'Specialized agent assignments' },
      sharedMemory: { name: 'Shared Memory', icon: Database, desc: 'Persistent state across agents' },
      centralRouter: { name: 'Central Router', icon: GitBranch, desc: 'Task delegation system' },
      messageQueue: { name: 'Message Queue', icon: Clock, desc: 'Async agent communication' },
      stateManagement: { name: 'State Management', icon: Database, desc: 'Transaction tracking' },
      errorRecovery: { name: 'Error Recovery', icon: AlertCircle, desc: 'Failure handling & rollback' },
      ragSystem: { name: 'RAG System', icon: Database, desc: 'Vector database knowledge base' },
      autonomousDelegate: { name: 'Autonomous Delegation', icon: Zap, desc: 'AI-driven task routing' },
      feedbackLoops: { name: 'Feedback Loops', icon: TrendingUp, desc: 'Quality scoring & improvement' },
      selfOptimizing: { name: 'Self-Optimizing', icon: Star, desc: 'Continuous evolution' }
    };
    return details[key] || { name: key, icon: Circle, desc: 'Unknown' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent-important': 'bg-red-100 border-red-500 text-red-800',
      'not-urgent-important': 'bg-yellow-100 border-yellow-500 text-yellow-800',
      'urgent-not-important': 'bg-blue-100 border-blue-500 text-blue-800',
      'not-urgent-not-important': 'bg-gray-100 border-gray-400 text-gray-600'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'urgent-important': 'DO FIRST',
      'not-urgent-important': 'SCHEDULE',
      'urgent-not-important': 'DELEGATE',
      'not-urgent-not-important': 'ELIMINATE'
    };
    return labels[priority];
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const totalAchievements = Object.keys(achievements).length;
  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked).length;
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">AI Mastermind Command Center</h1>
          <p className="text-purple-100 mb-6">Multi-Agent Orchestration Progress Tracker</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-3xl font-bold text-white">{unlockedAchievements}/{totalAchievements}</div>
              <div className="text-sm text-purple-100">Achievements Unlocked</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-3xl font-bold text-white">{completionPercentage}%</div>
              <div className="text-sm text-purple-100">System Completion</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-3xl font-bold text-white">{tasks.filter(t => t.status === 'in-progress').length}</div>
              <div className="text-sm text-purple-100">Active Tasks</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-3xl font-bold text-white">{tasks.filter(t => t.priority === 'urgent-important').length}</div>
              <div className="text-sm text-purple-100">Critical Items</div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveView('progression')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'progression' 
                ? 'bg-white text-purple-900 shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Progression Map
          </button>
          <button
            onClick={() => setActiveView('eisenhower')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeView === 'eisenhower' 
                ? 'bg-white text-purple-900 shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Eisenhower Matrix
          </button>
        </div>

        {/* Progression Map View */}
        {activeView === 'progression' && (
          <div className="space-y-6">
            {progressionMap.map((phase) => (
              <div key={phase.phase} className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${phase.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                    {phase.phase}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{phase.name}</h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {phase.achievements.map((key) => {
                    const achievement = achievements[key];
                    const details = getAchievementDetails(key);
                    const Icon = details.icon;
                    
                    return (
                      <div
                        key={key}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          achievement.unlocked
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-100 border-gray-300 opacity-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`} />
                          {achievement.unlocked ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1 text-sm">{details.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{details.desc}</p>
                        {achievement.unlocked && (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < achievement.level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{achievement.date}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Eisenhower Matrix View */}
        {activeView === 'eisenhower' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'].map((priority) => (
              <div key={priority} className={`rounded-lg shadow-xl p-6 border-4 ${getPriorityColor(priority)}`}>
                <h3 className="text-xl font-bold mb-4">{getPriorityLabel(priority)}</h3>
                <div className="space-y-3">
                  {tasks
                    .filter(task => task.priority === priority)
                    .map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-1">{task.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-mono text-xs">{task.id}</span>
                              <span>•</span>
                              <span>Phase {task.phase}</span>
                              <span>•</span>
                              <span>{task.agent}</span>
                            </div>
                          </div>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="complete">Complete</option>
                          <option value="backlog">Backlog</option>
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Steps Recommendations */}
        <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Recommended Next Actions
          </h3>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="font-bold text-red-800 mb-1">CRITICAL: Deploy Valentine Core</h4>
              <p className="text-sm text-red-700">This is your missing orchestration layer. All other improvements depend on this.</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-bold text-yellow-800 mb-1">HIGH PRIORITY: Implement Shared Memory</h4>
              <p className="text-sm text-yellow-700">Prevents context loss between agent handoffs. Use Redis or PostgreSQL.</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-bold text-blue-800 mb-1">MEDIUM PRIORITY: Create Message Queue</h4>
              <p className="text-sm text-blue-700">Enables async communication between agents. Foundation for reliability.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}