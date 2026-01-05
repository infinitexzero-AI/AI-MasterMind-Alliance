'use client';

import React, { useState } from 'react';
import { Terminal, Play, FileJson } from 'lucide-react';
import { executeCommand } from '../actions/commands';
import commands from '../lib/commands.json';

export default function CommandConsole() {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeCmd, setActiveCmd] = useState<string | null>(null);

  const handleRun = async (id: string) => {
    setIsRunning(true);
    setActiveCmd(id);
    setOutput(`> Executing command: ${id}...\n`);

    try {
        const result = await executeCommand(id);
        setOutput(prev => prev + result.output + `\n> Exited with ${result.success ? 'success' : 'error'}.`);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setOutput(prev => prev + `\n> Error: ${message}`);
    } finally {
        setIsRunning(false);
        setActiveCmd(null);
    }
  };

  const handleLaunchTeam = async () => {
      setIsRunning(true);
      setOutput('> Initiating Team Launch Sequence (Auto-Delegation)...\n');
      try {
          const { launchTeam } = await import('../actions/orchestrator');
          const result = await launchTeam();
          
          if (result.success) {
              setOutput(prev => prev + '> Delegation Plan Generated:\n' + JSON.stringify(result.plan, null, 2) + '\n\n> Launch COMPLETE.');
          } else {
              setOutput(prev => prev + `> Error: ${result.error}`);
          }
      } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          setOutput(prev => prev + `\n> Critical Failure: ${message}`);
      } finally {
          setIsRunning(false);
      }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-cyan-100">COMMAND REGISTRY</h2>
          <button 
            onClick={handleLaunchTeam}
            disabled={isRunning}
            aria-label="Launch Team Automation"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded hover:opacity-90 transition-all font-mono font-bold text-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            LAUNCH TEAM
          </button>
      </div>
      
      {/* Registry List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commands.map(cmd => (
            <div key={cmd.id} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all group">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {cmd.type === 'script' ? <Terminal className="w-4 h-4 text-emerald-400" /> : <FileJson className="w-4 h-4 text-blue-400" />}
                        <h3 className="font-bold text-slate-200">{cmd.name}</h3>
                    </div>
                    <button 
                        onClick={() => handleRun(cmd.id)}
                        disabled={isRunning}
                        aria-label={`Run ${cmd.name}`}
                        className={`p-2 rounded-full transition-all ${isRunning && activeCmd === cmd.id ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-200'}`}
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-2 min-h-[40px]">{cmd.description}</p>
                <div className="text-[10px] bg-slate-950 p-1.5 rounded text-slate-500 font-mono truncate">
                    $ {cmd.command}
                </div>
            </div>
        ))}
      </div>

      {/* Output Terminal */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 pt-2 border-b border-slate-800 pb-2 mb-2 text-slate-500">
            <Terminal className="w-4 h-4" />
            <span>CONSOLE_OUTPUT</span>
        </div>
        <pre className="flex-1 overflow-y-auto text-emerald-500/90 whitespace-pre-wrap p-2">
            {output || "// Ready for input..."}
        </pre>
      </div>
    </div>
  );
}
