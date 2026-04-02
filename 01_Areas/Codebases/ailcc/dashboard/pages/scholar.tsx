import React from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { Panel } from '../components/ui/Panel';
import { Card } from '../components/ui/Card';
import KnowledgeGraph from '../components/ui/KnowledgeGraph';
import SynthesisWidget from '../components/ui/SynthesisWidget';
import { GraduationCap, BookMarked, BrainCircuit, ShieldAlert, Play, RotateCw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface SubTask {
    title: string;
    type: string;
    author?: string;
    year?: number;
}

interface ResearchThread {
    title: string;
    course: string;
    status: string;
    subTasks: SubTask[];
}

const ACTIVE_RESEARCH: ResearchThread[] = [
    { title: "GENS2101 – Intro to Natural Resource Management", course: "GENS2101", status: "Active Analysis", subTasks: [
        { title: "Netukulimk and Colonial Fisheries", author: "Vasquez", year: 2021, type: "Curation" },
        { title: "Marshall Decision Breakdown", author: "Supreme Court", year: 1999, type: "Briefing" }
    ] },
    { title: "HLTH1011 – Health, Stress, and Biopsychology", course: "HLTH1011", status: "Indexing", subTasks: [
        { title: "Chapter 4: Stress and Illness", type: "Reading Queue" },
        { title: "Midterm Prep Flashcards", type: "Generation" }
    ] },
];

export default function ScholarDomain() {
  const { hasAccess, role } = useAuth();
  const [selectedThread, setSelectedThread] = React.useState<string | null>("GENS2101");
  const [studyMode, setStudyMode] = React.useState(false);
  const [currentCardIdx, setCurrentCardIdx] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);

  // Fetch local edge-compute output
  const { data: flashcards } = useSWR('/data/flashcards.json', fetcher);
  
  // Scholar has different clearance levels, if guest deny completely
  if (!hasAccess('scholar')) {
      return (
          <NexusLayout>
              <div className="flex h-full items-center justify-center p-20">
                  <div className="text-center space-y-4">
                      <ShieldAlert className="w-16 h-16 text-red-500 mx-auto opacity-50 mb-2" />
                      <h1 className="text-xl font-bold tracking-widest text-red-400 uppercase">Clearance Denied</h1>
                      <p className="font-mono text-slate-500 text-xs uppercase tracking-widest">Scholar constraints active.</p>
                  </div>
              </div>
          </NexusLayout>
      );
  }

  const activeThreadData = ACTIVE_RESEARCH.find(r => r.course === selectedThread);
  const filteredCards = flashcards ? flashcards.filter((c: any) => c.course === selectedThread || (selectedThread === "GENS2101" && c.course.includes("GENS"))) : [];
  
  const handleNextCard = () => {
      setShowAnswer(false);
      if (currentCardIdx < filteredCards.length - 1) {
          setCurrentCardIdx(prev => prev + 1);
      } else {
          setStudyMode(false);
          setCurrentCardIdx(0);
      }
  };

  return (
    <NexusLayout>
      <Head>
        <title>Scholar Domain | AILCC</title>
      </Head>
      
      <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-blue-500" /> Scholar Domain
                </h1>
                <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                    Academic Research & Insight Synthesis
                </p>
            </div>
            
            {role === 'COMMANDER' && (
                <div className="flex items-center gap-3 bg-blue-500/10 p-2 rounded-lg border border-blue-500/30">
                   <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest px-2">Auto-Ingest Enabled</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="flex flex-col gap-6">
               <Panel title="Active Research Threads" icon={<BrainCircuit className="w-4 h-4 text-blue-400" />} className="h-[400px]">
                  <div className="space-y-4">
                      {ACTIVE_RESEARCH.map((res) => (
                          <div key={res.course} onClick={() => { setSelectedThread(res.course); setStudyMode(false); setCurrentCardIdx(0); setShowAnswer(false); }}>
                            <Card padding="sm" className={`bg-black/40 border-l-2 group cursor-pointer hover:bg-slate-800/50 transition-all border-y-0 border-r-0 ${selectedThread === res.course ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800'}`}>
                               <div className="flex justify-between items-start mb-2">
                                  <span className={`font-bold text-sm ${selectedThread === res.course ? 'text-white' : 'text-slate-400'}`}>{res.title}</span>
                                  <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                      res.status === 'Active Analysis' ? 'bg-blue-500/20 text-blue-400' : 
                                      res.status === 'Indexing' ? 'bg-amber-500/20 text-amber-400' : 
                                      'bg-slate-700 text-slate-300'
                                  }`}>{res.status}</span>
                               </div>
                               <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Course ID: {res.course}</p>
                            </Card>
                          </div>
                      ))}
                  </div>
               </Panel>
               <div className="mt-[2px]">
                   <SynthesisWidget />
               </div>
           </div>

           <div className="flex flex-col gap-6">
               <Panel title={studyMode ? `Training Protocol: ${selectedThread}` : `Curation Details: ${selectedThread || 'None Selected'}`} icon={<BookMarked className="w-4 h-4 text-purple-400" />} className="h-[400px]">
                   
                   {studyMode && filteredCards.length > 0 ? (
                       <div className="h-full flex flex-col items-center justify-center space-y-6">
                           <div className="flex justify-between w-full px-4 font-mono text-xs text-slate-500 uppercase tracking-widest">
                               <span>Card {currentCardIdx + 1} of {filteredCards.length}</span>
                               <span className="text-purple-400">Edge-Compute Forged</span>
                           </div>
                           
                           <Card className={`w-full h-48 flex items-center justify-center p-6 text-center shadow-xl transition-all duration-500 ${showAnswer ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-900/50 border-slate-700'} cursor-pointer`} onClick={() => setShowAnswer(!showAnswer)}>
                               {showAnswer ? (
                                   <p className="text-sm text-purple-200 font-bold tracking-wide">{filteredCards[currentCardIdx].a}</p>
                               ) : (
                                   <p className="text-base text-white tracking-wide">{filteredCards[currentCardIdx].q}</p>
                               )}
                           </Card>
                           
                           <div className="flex gap-4 w-full">
                               {!showAnswer ? (
                                   <button onClick={() => setShowAnswer(true)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500">
                                       <RotateCw className="w-4 h-4" /> Reveal Answer
                                   </button>
                               ) : (
                                   <>
                                      <button onClick={handleNextCard} className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-rose-500/30">
                                          <XCircle className="w-4 h-4" /> Hard
                                      </button>
                                      <button onClick={handleNextCard} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-emerald-500/30">
                                          <CheckCircle className="w-4 h-4" /> Easy
                                      </button>
                                   </>
                               )}
                           </div>
                       </div>
                   ) : activeThreadData ? (
                       <div className="space-y-4">
                           <h3 className="font-mono text-[10px] tracking-widest uppercase text-slate-500 mb-2 border-b border-slate-800 pb-2">Active Syllabus Load</h3>
                           {activeThreadData.subTasks.map((task, i) => (
                               <Card key={i} padding="sm" className="bg-slate-900/30 border border-slate-800">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <span className="font-bold text-xs text-slate-300 block">{task.title}</span>
                                           {task.author && <span className="text-[10px] text-slate-500 font-mono mt-1 block">{task.author} ({task.year})</span>}
                                       </div>
                                       <span className="font-mono text-[9px] uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                           {task.type}
                                       </span>
                                   </div>
                               </Card>
                           ))}
                           
                           {/* Vanguard Flashcard Trigger */}
                           <Card className="bg-blue-500/5 border border-blue-500/20 p-4 mt-4">
                               <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                     <BrainCircuit className="w-4 h-4 text-blue-400" />
                                     <span className="text-xs font-bold text-blue-200 tracking-wide">Sentinel Study Engine</span>
                                  </div>
                                  <span className="text-[10px] font-mono tracking-widest text-slate-500 bg-black/40 px-2 rounded">{filteredCards.length} Local Cards</span>
                               </div>
                               
                               <button 
                                 onClick={() => setStudyMode(true)}
                                 disabled={filteredCards.length === 0}
                                 className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                   <Play className="w-3.5 h-3.5" /> Initialize Training Protocol
                               </button>
                           </Card>

                           {role !== 'COMMANDER' && role !== 'OPERATOR' ? (
                               <p className="text-xs text-red-500 mt-6 font-mono uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-2 rounded text-center">Curation Modifications Blocked</p>
                           ) : (
                               <button className="w-full mt-2 py-2 border border-dashed border-slate-800 text-slate-600 hover:text-white hover:border-slate-500 font-mono text-[10px] uppercase tracking-widest rounded transition-all">
                                   + Manage Syllabus
                               </button>
                           )}
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center opacity-50">
                           <BookMarked className="w-16 h-16 text-purple-400 mb-4" />
                           <p className="font-mono text-sm tracking-widest text-slate-300 uppercase">Awaiting Selection</p>
                           <p className="text-xs text-slate-500 mt-2 text-center max-w-xs">Select an Active Research Thread.</p>
                       </div>
                   )}
               </Panel>
           </div>
        </div>

        <div className="w-full mt-6">
            <KnowledgeGraph />
        </div>

      </div>
    </NexusLayout>
  );
}
