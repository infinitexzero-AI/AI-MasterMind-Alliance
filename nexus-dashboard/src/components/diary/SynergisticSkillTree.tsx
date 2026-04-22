import React, { useState, useEffect } from 'react';
import { Network, BrainCircuit, Activity, ChevronRight } from 'lucide-react';

interface SkillNode {
  id: string;
  category: string;
  human_dimension: {
    skill_name: string;
    current_score: number;
    daily_1_percent_action: string;
  };
  ai_dimension: {
    skill_name: string;
    current_score: number;
    daily_1_percent_action: string;
  };
  days_compounded: number;
}

export default function SynergisticSkillTree() {
  const [skills, setSkills] = useState<SkillNode[]>([]);

  useEffect(() => {
    // Simulated JSON retrieval for skills_matrix.json
    const mockSkills: SkillNode[] = [
      {
        id: "skill_med_ethics_01",
        category: "Medical Pathway",
        human_dimension: {
          skill_name: "Medical Ethics Argumentation",
          current_score: 15.0,
          daily_1_percent_action: "Complete 1 MMI scenario verbally."
        },
        ai_dimension: {
          skill_name: "Ethical Literature Parsing (RAG)",
          current_score: 15.0,
          daily_1_percent_action: "Ingest 1 new CMAJ article into JSON."
        },
        days_compounded: 4
      },
      {
        id: "skill_code_arch_02",
        category: "Systems Engineering",
        human_dimension: {
          skill_name: "Autonomous Architecture",
          current_score: 42.0,
          daily_1_percent_action: "Architect 1 new Daemon concept."
        },
        ai_dimension: {
          skill_name: "Daemon Fault Tolerance",
          current_score: 42.0,
          daily_1_percent_action: "Static analyze 1 core logic file."
        },
        days_compounded: 21
      }
    ];
    setSkills(mockSkills);
  }, []);

  return (
    <div className="w-full bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative group mt-6">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-3">
              <Network className="w-5 h-5 text-indigo-400" />
              THE SYNERGISTIC SKILL TREE
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">
              Parallel Mastery: Human vs. Swarm Alliance
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-300 font-mono tracking-widest uppercase">
              {skills.length} Active Nodes
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {skills.map((skill) => (
            <div key={skill.id} className="relative">
              {/* Category Ribbon */}
              <div className="absolute -top-3 left-4 px-2 py-0.5 bg-black border border-white/20 rounded-full text-[9px] text-slate-300 uppercase font-mono tracking-widest z-10">
                {skill.category}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-5 rounded-xl pt-6">
                
                {/* Human Branch */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Human Capability
                    </span>
                    <span className="text-sm font-mono text-white">{skill.human_dimension.current_score.toFixed(1)} <span className="text-[10px] text-slate-500">/ 100</span></span>
                  </div>
                  
                  <div className="text-sm text-slate-200 font-bold tracking-wide">
                    {skill.human_dimension.skill_name}
                  </div>
                  
                  <div className="text-[11px] text-slate-400 font-mono border-l-2 border-pink-500/30 pl-3">
                    <span className="text-pink-500/80 uppercase mb-1 block">Daily 1% Target:</span>
                    {skill.human_dimension.daily_1_percent_action}
                  </div>
                  
                  <progress value={skill.human_dimension.current_score} max={100} className="w-full h-1 mt-auto rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-pink-500 bg-slate-800" />
                </div>

                {/* AI Center Line Divider (Desktop only) */}
                <div className="hidden md:flex absolute left-1/2 top-8 bottom-4 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent -translate-x-1/2" />

                {/* AI Branch */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-3 h-3" />
                      Swarm Capability
                    </span>
                    <span className="text-sm font-mono text-white">{skill.ai_dimension.current_score.toFixed(1)} <span className="text-[10px] text-slate-500">/ 100</span></span>
                  </div>
                  
                  <div className="text-sm text-slate-200 font-bold tracking-wide">
                    {skill.ai_dimension.skill_name}
                  </div>
                  
                  <div className="text-[11px] text-slate-400 font-mono border-l-2 border-cyan-500/30 pl-3">
                    <span className="text-cyan-500/80 uppercase mb-1 block">Daily 1% Target:</span>
                    {skill.ai_dimension.daily_1_percent_action}
                  </div>
                  
                  <progress value={skill.ai_dimension.current_score} max={100} className="w-full h-1 mt-auto rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-cyan-500 bg-slate-800" />
                </div>

              </div>

              {/* Compounding Node Graphic */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(50%+12px)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black border-2 border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">{skill.days_compounded}d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
