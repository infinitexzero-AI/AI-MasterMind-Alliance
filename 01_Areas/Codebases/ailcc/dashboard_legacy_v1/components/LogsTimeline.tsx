import React, { useState, useEffect, useRef } from 'react';
import { useTaskQueue } from './hooks/useTaskQueue';

interface LogEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
}

export default function LogsTimeline() {
  const { pipeline } = useTaskQueue();
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Merge Task Events from Pipeline
  useEffect(() => {
    if (!pipeline) return;
    
    const taskLogs: LogEvent[] = pipeline.tasks.flatMap(t => {
       const events: LogEvent[] = [];
       // Start Event
       events.push({
         id: `start-${t.taskId}`,
         timestamp: t.startTime,
         level: 'info',
         source: 'ORCHESTRATOR',
         message: `Task ${t.taskId} assigned to ${t.agentAssigned} (${t.taskType})`
       });
       // End Event (if complete)
       if (t.endTime) {
         events.push({
            id: `end-${t.taskId}`,
            timestamp: t.endTime,
            level: t.successIndicator ? 'info' : 'error',
            source: 'ORCHESTRATOR',
            message: `Task ${t.taskId} ${t.status} in ${t.duration}ms`
         });
       }
       return events;
    });

    setLogs(prev => {
        // Dedup based on ID
        const combined = [...prev, ...taskLogs];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).slice(-100); // Keep last 100
    });
  }, [pipeline]);

  // 2. Generate simulated "System" noise for the "Matrix" feel
  useEffect(() => {
    const interval = setInterval(() => {
        const sysEvents = [
            'System heartbeat acknowledged',
            'Memory usage stabilized',
            'Forge bus sync: OK',
            'Telemetry stream active',
            'Index compaction completed'
        ];
        const randomEvent = sysEvents[Math.floor(Math.random() * sysEvents.length)];
        
        const newLog: LogEvent = {
            id: `sys-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'debug',
            source: 'SYSTEM',
            message: randomEvent
        };

        setLogs(prev => [...prev, newLog].slice(-100));
    }, 3500); // Every 3.5s receive a system log

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="glass-panel text-slate-300 p-6 rounded-xl h-full flex flex-col font-mono text-sm relative overflow-hidden">
      {/* Matrix Glitch effect overlay */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/20 animate-pulse z-20 pointer-events-none"></div>

      <header className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
          <span className="text-blue-500">❖</span> Flight Data
        </h2>
        <div className="flex gap-2 items-center">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
           <span className="text-[10px] text-blue-400">STREAMING</span>
        </div>
      </header>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-0.5 pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logs.map((log) => (
            <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1.5 rounded transition-colors group">
                <span className="text-slate-600 group-hover:text-slate-500 whitespace-nowrap text-[10px] w-16 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </span>
                <span className={`text-[10px] font-bold w-20 whitespace-nowrap pt-0.5 ${
                    log.source === 'ORCHESTRATOR' ? 'text-purple-400' : 'text-slate-500'
                }`}>
                    {log.source}
                </span>
                <span className={`break-all leading-tight ${
                    log.level === 'error' ? 'text-red-400' : 
                    log.level === 'warn' ? 'text-yellow-400' : 
                    log.level === 'debug' ? 'text-slate-600' : 'text-slate-300'
                }`}>
                    {log.message}
                </span>
            </div>
        ))}
        {/* Anchor for auto-scroll */}
        <div style={{ float:"left", clear: "both" }}></div>
      </div>
    </section>
  );
}
