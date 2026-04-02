import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { useAuth } from '../src/contexts/AuthContext';
import { Target, Flag, CircleDot, Network, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import { MilestoneSchema } from '../types/api';
import { motion } from 'framer-motion';

const MOCK_MILESTONES: MilestoneSchema[] = [
    {
        id: 'M1',
        type: 'ACADEMIC',
        title: 'Complete Biopsych Core',
        target_date: '2026-04-30',
        status: 'PENDING',
        dependencies: { courses: ['HLTH1011'], skills: [] }
    },
    {
        id: 'M2',
        type: 'ACADEMIC',
        title: 'Achieve 3.8+ GPA Year 3',
        target_date: '2026-05-15',
        status: 'PENDING',
        dependencies: { courses: [], skills: [] }
    },
    {
        id: 'M3',
        type: 'CAREER',
        title: 'Secure Clinical Research Internship',
        target_date: '2026-06-01',
        status: 'PENDING',
        dependencies: { courses: [], skills: ['S_RESEARCH_1'] }
    },
    {
        id: 'M4',
        type: 'PERSONAL',
        title: 'Establish Painting Business LLC',
        target_date: '2025-12-01',
        status: 'ACHIEVED',
        dependencies: { courses: [], skills: [] }
    }
];

export default function VisionBoard() {
    const { hasAccess } = useAuth();
    
    // Sort milestones by date
    const sortedMilestones = [...MOCK_MILESTONES].sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());

    if (!hasAccess('vision')) {
        return (
            <NexusLayout>
                <div className="flex h-full items-center justify-center p-20">
                    <div className="text-center space-y-4">
                        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto opacity-50 mb-2" />
                        <h1 className="text-xl font-bold tracking-widest text-rose-400 uppercase">Clearance Denied</h1>
                        <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">You lack clearance for the Vanguard Vision Matrix.</p>
                    </div>
                </div>
            </NexusLayout>
        );
    }

    return (
        <NexusLayout>
            <Head>
                <title>Vision Matrix | NEXUS</title>
            </Head>

            <div className="w-full flex flex-col gap-8 max-w-[90rem] mx-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                {/* Header Strip */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-rose-400">
                            Vision Matrix
                        </h1>
                        <p className="font-mono text-[10px] text-amber-400/80 tracking-[0.2em] uppercase mt-2">
                            Long-Arc Outcomes // Scholar Convergence 2027
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 relative overflow-hidden hidden md:block">
                     {/* Horizontal Timeline Rail for Desktop */}
                     <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-indigo-500/20 -translate-y-1/2" />
                     
                     <div className="flex justify-between items-center relative z-10 overflow-x-auto pb-4 custom-scrollbar">
                         {sortedMilestones.map((milestone, idx) => (
                             <motion.div 
                                 key={milestone.id} 
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ duration: 0.4, delay: idx * 0.1 }}
                                 className="flex flex-col items-center min-w-[200px] gap-4"
                             >
                                 <div className="text-[10px] font-mono text-slate-400">
                                     {new Date(milestone.target_date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                 </div>
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 ${
                                     milestone.status === 'ACHIEVED' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' :
                                     milestone.status === 'MISSED' ? 'bg-rose-500/20 border-rose-400 text-rose-400' :
                                     'bg-slate-800 border-amber-400/50 text-amber-400'
                                 }`}>
                                     {milestone.status === 'ACHIEVED' ? <CheckCircle2 className="w-3 h-3" /> : <CircleDot className="w-3 h-3" />}
                                 </div>
                                 <div className="bg-black/50 border border-white/5 p-4 rounded-xl text-center w-48 shadow-lg hover:border-amber-400/30 transition-colors">
                                     <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block ${
                                          milestone.type === 'ACADEMIC' ? 'bg-indigo-500/20 text-indigo-400' :
                                          milestone.type === 'CAREER' ? 'bg-emerald-500/20 text-emerald-400' :
                                          'bg-rose-500/20 text-rose-400'
                                     }`}>
                                         {milestone.type}
                                     </span>
                                     <h3 className="text-xs font-bold text-white leading-tight">{milestone.title}</h3>
                                 </div>
                             </motion.div>
                         ))}
                     </div>
                </div>

                {/* Mobile / Vertical List View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
                     {sortedMilestones.map((milestone, idx) => (
                          <motion.div 
                              key={milestone.id} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.1 }}
                              className="bg-slate-900/40 rounded-2xl border border-white/5 p-6 flex flex-col gap-4 hover:border-amber-500/30 transition-colors"
                          >
                               <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {milestone.status === 'ACHIEVED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-500" />}
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            milestone.type === 'ACADEMIC' ? 'bg-indigo-500/20 text-indigo-400' :
                                            milestone.type === 'CAREER' ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-rose-500/20 text-rose-400'
                                        }`}>
                                            {milestone.type}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">{new Date(milestone.target_date).toLocaleDateString()}</span>
                               </div>
                               <h3 className="text-lg font-bold text-white">{milestone.title}</h3>

                               {/* Linkages */}
                               <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                                   {milestone.dependencies.courses.length > 0 && (
                                       <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded flex items-center gap-1">
                                           <Network className="w-3 h-3" /> Corequisite Courses Logged
                                       </span>
                                   )}
                                   {milestone.dependencies.skills.length > 0 && (
                                       <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded flex items-center gap-1">
                                           <Flag className="w-3 h-3" /> Target Skills Required
                                       </span>
                                   )}
                               </div>
                          </motion.div>
                     ))}
                </div>

            </div>
        </NexusLayout>
    );
}
