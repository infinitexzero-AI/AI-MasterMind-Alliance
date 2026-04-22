import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Task {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending' | 'in-progress' | 'queued';
  agent?: string;
}

interface Phase {
  name: string;
  status: string;
  tasks: Task[];
}

interface RoadmapData {
  progression: number;
  phases: Phase[];
}

const MissionControl: React.FC = () => {
  const [data, setData] = useState<RoadmapData | null>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from an API endpoint
    // serving the processed mission_roadmap.json.
    // For now, we import the static data or mock it to ensure it renders immediately.
    const mockData: RoadmapData = {
        "progression": 75,
        "phases": [
            {
                "name": "Phase 5: Scholar Convergence",
                "status": "active",
                "tasks": [
                    { "id": 126, "label": "Scholar Roadmap Finalized (BSc Biology)", "status": "completed", "agent": "Scholar" },
                    { "id": 127, "label": "Administrative Appeals Sent", "status": "completed", "agent": "Valentine" },
                    { "id": 128, "label": "Storage Migration (XDrive Nexus)", "status": "completed", "agent": "Antigravity" },
                    { "id": 129, "label": "BSc Core Audit (3000-level vars)", "status": "pending", "agent": "Scholar" },
                    { "id": 130, "label": "Logistics Planner (Fall 2026)", "status": "pending", "agent": "Comet" }
                ]
            },
            {
                "name": "Phase 6: Hyper-Orchestration",
                "status": "pending",
                "tasks": [
                    { "id": 131, "label": "UI Unification (Seven Tabs)", "status": "completed", "agent": "Valentine" },
                    { "id": 132, "label": "Automated Report Generation", "status": "completed", "agent": "Gemini" },
                    { "id": 133, "label": "Linear Delegation Protocol", "status": "in-progress", "agent": "Comet" },
                    { "id": 134, "label": "Shared Brain Pulse (Sync)", "status": "in-progress", "agent": "Grok" },
                    { "id": 135, "label": "Financial Autonomy Protocols", "status": "queued", "agent": "Grok" }
                ]
            }
        ]
    };
    setData(mockData);
  }, []);

  if (!data) return <div className="p-8 text-cyan-500">Initializing Mission Control...</div>;

  return (
    <div className="w-full h-full bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Mission Control
          </h2>
          <p className="text-slate-400 text-sm mt-1">Operational Roadmap & Swarm Delegation</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-cyan-400">{data.progression}%</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Aggregate Completion</div>
        </div>
      </div>

      <div className="space-y-8">
        {data.phases.map((phase, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl border ${phase.status === 'active' ? 'border-cyan-500/30 bg-cyan-950/10' : 'border-slate-800 bg-slate-900/20'} p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2 h-2 rounded-full ${phase.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <h3 className={`text-lg font-semibold ${phase.status === 'active' ? 'text-cyan-100' : 'text-slate-400'}`}>
                {phase.name}
              </h3>
            </div>

            <div className="space-y-3">
              {phase.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <StatusIcon status={task.status} />
                    <span className={`text-sm ${task.status === 'completed' ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'}`}>
                      {task.label}
                    </span>
                  </div>
                  {task.agent && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/20 border border-white/5">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Agent:</span>
                      <span className={`text-xs font-medium ${getAgentColor(task.agent)}`}>{task.agent}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 text-xs">✓</div>;
    case 'in-progress':
      return <div className="w-5 h-5 rounded-full border-2 border-amber-500/50 border-t-amber-500 animate-spin" />;
    case 'active':
      return <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center"><div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" /></div>;
    default:
      return <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800" />;
  }
};

const getAgentColor = (agent: string) => {
  switch (agent) {
    case 'Valentine': return 'text-pink-400';
    case 'Antigravity': return 'text-purple-400';
    case 'Grok': return 'text-orange-400';
    case 'Comet': return 'text-teal-400';
    case 'Gemini': return 'text-blue-400';
    case 'Scholar': return 'text-yellow-400';
    case 'Grok': return 'text-gray-400';
    default: return 'text-slate-400';
  }
};

export default MissionControl;
