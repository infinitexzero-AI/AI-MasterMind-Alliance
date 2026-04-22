import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  goal: string;
  tools: string[];
  user_drill: string;
  alliance_path: string;
  color: string;
}

const skills: Skill[] = [
  {
    id: 'prompt',
    name: 'Prompt Engineering',
    goal: 'Write prompts that produce consistent, controllable outputs.',
    tools: ['Perplexity', 'Gemini', 'Grok', 'Ollama'],
    user_drill: 'Rewrite a messy real prompt into a structured format: Role, Task, Constraints, Examples, Output Schema.',
    alliance_path: 'Stores outcome in PromptPlay RAG; trains Prompt Coach agent to suggest real-time improvements.',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'workflow',
    name: 'Workflow Automation',
    goal: 'Chain tools and agents into repeatable, autonomous workflows.',
    tools: ['n8n', 'Activepieces', 'GitHub Actions', 'AILCC Relay'],
    user_drill: 'Design a 3-node flow: Webhook → LLM Logic → Vault Archive. Spec it in the War Room.',
    alliance_path: 'Updates Workflow Registry schema; Tuner agent analyzes run logs to suggest timeout optimizations.',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'video',
    name: 'AI Video Creation',
    goal: 'Turn scripts into high-quality explainer or social videos.',
    tools: ['CapCut', 'Pika', 'Runway', 'Sora (Waitlist)'],
    user_drill: 'Write a 60-90s script for an AILCC feature; generate draft clips and rate clarity.',
    alliance_path: 'Archives scripts in Media Narratives; Narrative Synthesizer learns tone and engagement patterns.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'rag',
    name: 'RAG Systems',
    goal: 'Connect large models to your own private notes and PDFs.',
    tools: ['LlamaIndex', 'LangChain', 'Chroma', 'AnythingLLM'],
    user_drill: 'Ingest one new research artifact; ask 3 sharp questions and refine chunking if answers drift.',
    alliance_path: 'Standardizes DocChunk schemas; Retriever agent learns query strategies via relevance feedback.',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'vibe',
    name: 'Vibe Coding',
    goal: 'Ship production apps by talking to AI while keeping full code control.',
    tools: ['Cursor', 'Codeium', 'Antigravity', 'Replit'],
    user_drill: 'Complete a 20-minute "micro-ship" refactor; capture one "aha" moment in the Scholar Log.',
    alliance_path: 'Populates Code Insight Log; Dev Mentor agent identifies recurring bug families for auto-fix patterns.',
    color: 'from-indigo-400 to-violet-500'
  },
  {
    id: 'geo',
    name: 'AI Search (GEO)',
    goal: 'Make your content easy for AI search engines to quote and surface.',
    tools: ['Perplexity', 'Vercel', 'Google Search Console'],
    user_drill: 'Write an optimized technical note with clear H2s and FAQs; verify citation ranking in Perplexity.',
    alliance_path: 'Content Curator agent tags intent/audience; Indexer agent tracks semantic retrieval metrics.',
    color: 'from-rose-400 to-red-500'
  }
];

export const SkillUplink: React.FC = () => {
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ailcc_streaks');
    if (saved) setStreaks(JSON.parse(saved));
  }, []);

  const completeDrill = async (skillId: string) => {
    setIsLogging(skillId);
    const newStreaks = { ...streaks, [skillId]: (streaks[skillId] || 0) + 1 };
    setStreaks(newStreaks);
    localStorage.setItem('ailcc_streaks', JSON.stringify(newStreaks));

    const skill = skills.find(s => s.id === skillId);
    try {
      await fetch('http://localhost:5005/api/scholar/log-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: skillId,
          skill_name: skill?.name,
          drill: skill?.user_drill,
          alliance_updates: skill?.alliance_path,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Vault uplink failed', e);
    }
    setIsLogging(null);
  };

  return (
    <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
            Alliance Uplink · Parallel Training
          </h2>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest opacity-60">
            Each drill updates my skills and the swarm’s capabilities.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Alliance Strength</div>
            <div className="text-xl font-bold font-mono text-indigo-400">
              {Object.values(streaks).reduce((a, b) => a + b, 0) * 25} XP
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map(skill => (
          <motion.div 
            key={skill.id}
            whileHover={{ y: -5 }}
            className={`relative bg-slate-900/40 border border-white/5 p-6 rounded-2xl overflow-hidden transition-all hover:border-white/20 group`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${skill.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-tight">{skill.name}</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-mono text-indigo-300">STREAK::{streaks[skill.id] || 0}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed line-clamp-2 h-8">{skill.goal}</p>

            <div className="space-y-4">
              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-[9px] font-mono text-indigo-400 uppercase mb-2">User Path: Today's Drill</div>
                <div className="text-[10px] text-slate-300 font-medium leading-relaxed italic">
                  "{skill.user_drill}"
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skill.tools.map(t => (
                  <span key={t} className="text-[8px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{t}</span>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[8px] font-mono text-emerald-400 uppercase mb-1">Alliance Path</div>
                  <div className="text-[9px] text-slate-500 line-clamp-1">{skill.alliance_path}</div>
                </div>
                <button 
                  onClick={() => completeDrill(skill.id)}
                  disabled={isLogging === skill.id}
                  className={`px-4 py-2 rounded-lg text-[9px] font-bold font-mono uppercase tracking-widest transition-all ${
                    isLogging === skill.id 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {isLogging === skill.id ? 'SYNKED' : 'LOG DRILL'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
