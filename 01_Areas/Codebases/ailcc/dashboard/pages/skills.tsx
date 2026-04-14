import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { useAuth } from '../src/contexts/AuthContext';
import { Network, ShieldAlert, Star, Link as LinkIcon, BookOpen, BrainCircuit, Terminal, Play, Loader2, Code2 } from 'lucide-react';
import { SkillNodeSchema } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SkillTree() {
    const { hasAccess } = useAuth();
    const router = useRouter();
    const { query } = router;
    const { data: skillsData, mutate } = useSWR('http://localhost:8000/api/v1/skills', fetcher);
    const [selectedDomain, setSelectedDomain] = useState<SkillNodeSchema['domain'] | 'ALL'>('ALL');
    const [forgeObjective, setForgeObjective] = useState('');
    const [isForging, setIsForging] = useState(false);
    const [forgeLogs, setForgeLogs] = useState<{type: string, message?: string, content?: string}[]>([]);
    const logsEndRef = React.useRef<HTMLDivElement>(null);

    // Populate forge objective from URL query if present
    useEffect(() => {
        if (query.objective) {
            setForgeObjective(query.objective as string);
        }
    }, [query.objective]);
    
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [forgeLogs]);

    const skills = skillsData?.skills || [];

    const handleForge = () => {
        if (!forgeObjective.trim() || isForging) return;
        setIsForging(true);
        setForgeLogs([{ type: 'log', message: 'Connecting to Neural Forge Sandbox on ws://localhost:8000...' }]);
        
        const ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onopen = () => {
            ws.send(JSON.stringify({ action: 'FORGE_SKILL', objective: forgeObjective }));
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (['log', 'error', 'success', 'code'].includes(data.type)) {
                    setForgeLogs(prev => [...prev, data]);
                }
                
                if (data.type === 'success' || (data.type === 'error' && data.message?.includes('Failed to forge skill after'))) {
                    setIsForging(false);
                    mutate(); // Refresh skills list after successful forge
                    setTimeout(() => ws.close(), 1000);
                }
            } catch(e) {
                // Silently ignoring JSON parse errors for forge logs
            }
        };
        
        ws.onerror = () => {
            setForgeLogs(prev => [...prev, { type: 'error', message: 'Neural Forge Link Severed. FastAPI Core unreachable.' }]);
            setIsForging(false);
        };
    };

    if (!hasAccess('skills')) {
        return (
            <NexusLayout>
                <div className="flex h-full items-center justify-center p-20">
                    <div className="text-center space-y-4">
                        <ShieldAlert className="w-16 h-16 text-cyan-500 mx-auto opacity-50 mb-2" />
                        <h1 className="text-xl font-bold tracking-widest text-cyan-400 uppercase">Clearance Denied</h1>
                        <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">You lack clearance for the Vanguard Skill Tree.</p>
                    </div>
                </div>
            </NexusLayout>
        );
    }

    const filteredSkills = skills.filter((s: any) => selectedDomain === 'ALL' || s.domain === selectedDomain);

    const getDomainColor = (domain: string) => {
        switch(domain) {
            case 'RESEARCH': return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
            case 'BIOPSYCH': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'BUSINESS': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            case 'CODING': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
            case 'WELLNESS': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    return (
        <NexusLayout>
            <Head>
                <title>Skill Matrix | NEXUS</title>
            </Head>

            <div className="w-full flex flex-col gap-8 max-w-[90rem] mx-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                {/* Header Strip */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
                            Skill Matrix
                        </h1>
                        <p className="font-mono text-[10px] text-cyan-400/80 tracking-[0.2em] uppercase mt-2 border-l-2 border-cyan-500 pl-2">
                            Aptitude Mapping // Evidence-Based Validation
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                        {['ALL', 'BIOPSYCH', 'RESEARCH', 'CODING', 'BUSINESS', 'WELLNESS'].map(domain => (
                            <button
                                key={domain}
                                onClick={() => setSelectedDomain(domain as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-widest ${
                                    selectedDomain === domain 
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                {domain}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Neural Forge Terminal */}
                <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />
                    <div className="p-6 border-b border-white/5 bg-slate-900">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-xl font-bold tracking-widest text-white">Neural Skill Forge</h2>
                            {isForging && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-2" />}
                        </div>
                        <div className="flex gap-4">
                            <input 
                                type="text"
                                disabled={isForging}
                                placeholder="State the objective (e.g., 'Write a python script that fetches the local weather via ip-api')..."
                                className="flex-1 bg-black/40 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-cyan-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono disabled:opacity-50"
                                value={forgeObjective}
                                onChange={(e) => setForgeObjective(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleForge()}
                            />
                            <button 
                                disabled={isForging || !forgeObjective}
                                onClick={handleForge}
                                className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-6 py-3 rounded-lg font-bold tracking-widest uppercase text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                Initiate Forge
                            </button>
                        </div>
                    </div>

                    {forgeLogs.length > 0 && (
                        <div className="bg-black/80 p-6 min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-xs leading-relaxed">
                            <AnimatePresence>
                                {forgeLogs.map((log, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`mb-2 ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400 font-bold' : log.type === 'code' ? 'text-indigo-300 bg-indigo-950/30 p-4 rounded border border-indigo-500/20 my-4 overflow-x-auto whitespace-pre-wrap' : 'text-slate-400'}`}
                                    >
                                        <span className="opacity-50 select-none mr-3">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                                        {log.type === 'code' ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-500/20 pb-2 mb-2">
                                                    <Code2 className="w-4 h-4" /> Synthesized Script
                                                </div>
                                                {log.content}
                                            </div>
                                        ) : (
                                            <span>
                                                {log.type === 'error' ? '❌ ' : log.type === 'success' ? '✅ ' : '⚡ '}
                                                {log.message}
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSkills.map((skill: any, index: number) => (
                        <motion.div 
                            key={skill.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group bg-slate-900/40 rounded-2xl border border-white/5 p-6 flex flex-col gap-4 hover:border-cyan-500/30 transition-all hover:shadow-[0_4px_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 relative overflow-hidden"
                        >
                             <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                             
                             <div className="flex items-start justify-between relative z-10">
                                 <div className={`p-2 rounded-xl border ${getDomainColor(skill.domain)}`}>
                                     <BrainCircuit className="w-5 h-5" />
                                 </div>
                                 <div className="flex gap-1" title={`Mastery Level ${skill.level}`}>
                                     {[1, 2, 3].map(lvl => (
                                         <Star key={lvl} className={`w-4 h-4 ${lvl <= skill.level ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                     ))}
                                 </div>
                             </div>

                             <div className="relative z-10 mt-2">
                                 <span className="text-[8px] font-mono tracking-widest uppercase text-slate-500 mb-1 block">
                                     {skill.domain} // {skill.id}
                                 </span>
                                 <h3 className="text-lg font-bold text-white leading-tight">{skill.name}</h3>
                                 <p className="text-xs text-slate-400 mt-2 line-clamp-3">{skill.description}</p>
                             </div>

                             <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2 relative z-10">
                                  {skill.prerequisite_courses.length > 0 && (
                                      <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1.5 rounded">
                                          <BookOpen className="w-3 h-3" /> Origin: {skill.prerequisite_courses.join(', ')}
                                      </div>
                                  )}
                                  
                                  <div className={`flex flex-col gap-1 text-[10px] font-mono ${skill.evidence_links.length > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-2 py-1.5 rounded`}>
                                       <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <Network className="w-3 h-3" /> Evidence Linked ({skill.evidence_links.length})
                                            </span>
                                            {skill.evidence_links.length === 0 && <span className="uppercase text-[8px] border border-rose-500/30 px-1 rounded">Missing</span>}
                                       </div>
                                       {skill.evidence_links.map((link: string, i: number) => (
                                           <a key={i} href={link} className="truncate hover:underline text-[9px] mt-1 flex items-center gap-1 opacity-80 pl-4">
                                               <LinkIcon className="w-2 h-2" /> Ext. Object {i+1}
                                           </a>
                                       ))}
                                  </div>
                             </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </NexusLayout>
    );
}
