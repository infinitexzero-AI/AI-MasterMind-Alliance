import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, MessageSquare, Sparkles } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  source: 'GEMINI' | 'SYSTEM' | 'USER';
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export const GeminiConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock connecting to a stream
  useEffect(() => {
    const addLog = (msg: string, source: LogEntry['source'] = 'SYSTEM') => {
      setLogs(prev => [...prev.slice(-50), {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        source,
        message: msg,
        type: 'info'
      }]);
    };

    addLog('Gemini Uplink Established...', 'GEMINI');
    addLog('Calibrating Neural Net...', 'SYSTEM');

    const interval = setInterval(() => {
        const events = [
            "Optimizing query paths...",
            "Agent [Researcher] reports status: IDLE",
            "Memory bank synchronization complete",
            "Analyzing intent vectors...",
            "Gemini Agent heartbeat detected"
        ];
        if (Math.random() > 0.7) {
            addLog(events[Math.floor(Math.random() * events.length)], 'GEMINI');
        }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="renaissance-panel w-full h-96 flex flex-col overflow-hidden relative border-purple-500/30">
        
        {/* Header */}
        <div className="h-10 bg-slate-900/80 border-b border-purple-500/20 flex items-center px-4 justify-between">
            <div className="flex items-center text-purple-400">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="font-mono text-sm font-bold tracking-wider">GEMINI // CONSOLE</span>
            </div>
            <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            </div>
        </div>

        {/* Terminal Body */}
        <div ref={scrollRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-slate-950/50">
            {logs.map(log => (
                <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start opacity-80 hover:opacity-100 transition-opacity"
                >
                    <span className="text-slate-400 mr-2">[{log.timestamp}]</span>
                    <span className={`mr-2 font-bold ${
                        log.source === 'GEMINI' ? 'text-purple-400' : 'text-cyan-400'
                    }`}>
                        {log.source}:
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                </motion.div>
            ))}
        </div>

        {/* Input Area */}
        <div className="h-12 border-t border-purple-500/20 bg-slate-900/50 flex items-center px-4">
             <span className="text-purple-500 mr-2">❯</span>
             <input 
                type="text" 
                placeholder="Enter command to Gemini..."
                className="bg-transparent w-full focus:outline-none text-purple-100 font-mono text-sm placeholder-purple-500/30"
             />
        </div>
    </div>
  );
};
