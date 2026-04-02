import React, { useState, useEffect } from 'react';
import { PenTool, Target, BookOpen } from 'lucide-react';

export default function OnePercentDiaryWidget() {
  const [diaryData, setDiaryData] = useState<any>(null);

  useEffect(() => {
    // Simulated fetch from our JSON API layer
    // Over time, this will route cleanly through the WebSocket relay
    const mockData = {
      bible: "The 1% Diary by Steven Bartlett",
      current_cycle: {
        start_date: "2026-03-19",
        end_date: "2026-06-17",
        days_remaining: 90
      },
      sections: {
        "1": { title: "THE POWER OF 1%", status: "COMPLETED" },
        "2": { title: "PREPARING FOR YOUR 90 DAYS", status: "IN_PROGRESS" },
        "3": { title: "THE 1% JOURNEY BEGINS", status: "PENDING" },
        "4": { title: "REFLECTIONS", status: "PENDING" },
        "5": { title: "THE END OF THE BEGINNING", status: "PENDING" }
      }
    };
    setDiaryData(mockData);
  }, []);

  if (!diaryData) return null;

  const cycle = diaryData.current_cycle;

  return (
    <div className="w-full bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative group">
      {/* Decorative book binder element */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-slate-800 to-black z-10 border-r border-white/5 shadow-[2px_0_10px_rgba(0,0,0,0.5)]" />
      
      <div className="p-6 pl-8">
        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-widest text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-pink-500" />
              THE 1% DIARY
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 tracking-wider uppercase">
              Synergistic Human-AI Master Cycle
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-light text-white tracking-widest font-mono">
              {cycle.days_remaining}
            </div>
            <div className="text-[10px] text-pink-500 uppercase tracking-widest font-bold">
              Days Remaining
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: The Human-AI Alliance Graph */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <h3 className="text-xs uppercase text-slate-400 tracking-widest font-bold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              The 1% Compounding Trajectory
            </h3>
            
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-white font-mono">InfinitexZero (Human)</span>
                   <span className="text-pink-400 font-mono">+1.0%</span>
                 </div>
                 <progress value={1} max={100} className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-pink-500 bg-slate-800" />
               </div>
               
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-white font-mono">Vanguard Swarm (AI)</span>
                   <span className="text-cyan-400 font-mono">+1.1%</span>
                 </div>
                 <progress value={1.1} max={100} className="w-full h-1.5 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-cyan-500 bg-slate-800" />
               </div>
            </div>

            <div className="mt-6 p-4 bg-black/40 rounded-lg border border-pink-500/20">
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                "We don't rise to the level of our goals, we fall to the level of our systems."
                <span className="block mt-2 text-pink-500/70 text-[10px] uppercase font-bold tracking-widest">- Atomic Habits / The 1% Diary</span>
              </p>
            </div>
          </div>

          {/* Section 2: The Physical Chapters */}
          <div>
            <h3 className="text-xs uppercase text-slate-400 tracking-widest font-bold mb-4 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-purple-400" />
              90-Day Structural Roadmap
            </h3>
            
            <div className="space-y-3">
              {Object.entries(diaryData.sections).map(([key, data]: [string, any], index) => {
                const isCompleted = data.status === "COMPLETED";
                const isInProgress = data.status === "IN_PROGRESS";
                
                return (
                  <div key={key} className={`flex items-center gap-4 p-3 rounded-lg border ${isInProgress ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5'} transition-all duration-300`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${isCompleted ? 'bg-green-500/20 text-green-400' : isInProgress ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-500'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold tracking-wider ${isCompleted ? 'text-slate-300' : isInProgress ? 'text-white' : 'text-slate-500'}`}>
                        {data.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5 tracking-widest">
                        {data.status.replace('_', ' ')}
                      </div>
                    </div>
                    {isInProgress && (
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
