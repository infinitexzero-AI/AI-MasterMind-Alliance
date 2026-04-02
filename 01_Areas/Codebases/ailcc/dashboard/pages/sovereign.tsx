import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { Card } from '../components/ui/Card';
import { Activity, Brain, Target, ShieldCheck, HeartPulse, Zap } from 'lucide-react';

const WEF_2025_CORE_SKILLS = [
    { name: 'Analytical thinking', wefTarget: 69, current: 72, icon: <Brain />, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { name: 'Resilience, flexibility and agility', wefTarget: 67, current: 85, icon: <Activity />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { name: 'Leadership and social influence', wefTarget: 61, current: 40, icon: <Target />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { name: 'Creative thinking', wefTarget: 57, current: 65, icon: <Zap />, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { name: 'Technological literacy', wefTarget: 51, current: 95, icon: <ShieldCheck />, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    { name: 'Motivation and self-awareness', wefTarget: 52, current: 80, icon: <HeartPulse />, color: 'text-rose-400', bg: 'bg-rose-500/20' }
];

const SOVEREIGN_HABITS = [
    { name: 'Exercise (Weights & Yoga)', status: 'ACTIVE', streak: 12 },
    { name: 'Gratitude Reflection', status: 'ACTIVE', streak: 45 },
    { name: 'Reading Synthesis', status: 'ACTIVE', streak: 21 },
    { name: 'Waking Up Early (06:00)', status: 'ACTIVE', streak: 8 },
    { name: 'Daily Planning', status: 'ACTIVE', streak: 124 },
    { name: 'Meditation (15m)', status: 'PENDING', streak: 0 }
];

export default function SovereignDomain() {

  return (
    <NexusLayout>
      <Head>
        <title>Sovereign Symbiosis | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-emerald-400 flex items-center gap-3 drop-shadow-lg">
                    <Activity className="w-8 h-8" /> Sovereign Symbiosis
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Epoch 35: WEF 2025 Core Skill Analytics & Biological Tracking
                </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest px-2 group-hover:animate-pulse">Telemetry Active</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="flex flex-col gap-6">
               <Panel title="WEF 2025 Cognitive Skill Matrix" icon={<Brain className="w-4 h-4 text-blue-400" />} className="h-[450px]">
                  <div className="space-y-4 pr-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                      {WEF_2025_CORE_SKILLS.map((skill) => (
                          <Card key={skill.name} padding="sm" className={`bg-black/40 border-l-2 border-y-0 border-r-0 border-slate-700 hover:bg-slate-800/50 transition-all`}>
                             <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${skill.bg}`}>{React.cloneElement(skill.icon, { className: `w-4 h-4 ${skill.color}` })}</div>
                                  <span className="font-bold text-xs text-white tracking-wide">{skill.name}</span>
                                </div>
                                <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${skill.current >= skill.wefTarget ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {skill.current >= skill.wefTarget ? 'EXCEEDS TARGET' : 'LAGGING'}
                                </span>
                             </div>
                             
                             <div className="w-full bg-slate-900 rounded-full h-1.5 mb-1 relative overflow-hidden">
                                <style jsx>{`
                                    .w-dynamic-${skill.name.replace(/[^a-zA-Z0-9]/g, '')} { width: ${skill.current}%; }
                                    .left-dynamic-${skill.name.replace(/[^a-zA-Z0-9]/g, '')} { left: ${skill.wefTarget}%; }
                                `}</style>
                                <div className={`h-1.5 rounded-full w-dynamic-${skill.name.replace(/[^a-zA-Z0-9]/g, '')} ${skill.current >= skill.wefTarget ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <div className={`absolute top-0 bottom-0 w-1 bg-white left-dynamic-${skill.name.replace(/[^a-zA-Z0-9]/g, '')}`} title={`WEF Target: ${skill.wefTarget}%`}></div>
                             </div>
                             <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase mt-2">
                                 <span>Current: {skill.current}%</span>
                                 <span>WEF Target: {skill.wefTarget}%</span>
                             </div>
                          </Card>
                      ))}
                  </div>
               </Panel>
           </div>

           <div className="flex flex-col gap-6">
               <Panel title="Biological Habits Ledger" icon={<HeartPulse className="w-4 h-4 text-rose-400" />} className="h-[450px]">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {SOVEREIGN_HABITS.map((habit, idx) => (
                           <Card key={idx} padding="sm" className="bg-slate-900/40 border border-slate-800 flex flex-col items-center text-center justify-center p-4 hover:border-slate-600 transition-colors">
                               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 h-8">{habit.name}</span>
                               <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded mb-3 border ${habit.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                   {habit.status}
                               </span>
                               <div className="text-2xl font-black tracking-tighter text-white font-mono flex items-baseline gap-1">
                                   {habit.streak} <span className="text-[9px] text-slate-500 tracking-widest uppercase">DAYS</span>
                               </div>
                           </Card>
                       ))}
                   </div>
               </Panel>
           </div>
        </div>

      </div>
    </NexusLayout>
  );
}
