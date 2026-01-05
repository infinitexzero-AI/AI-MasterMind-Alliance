import React from 'react';
import CommandConsole from '../components/CommandConsole';
import { Terminal } from 'lucide-react';

export default function CommandsPage() {
  return (
    <div className="p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <header className="mb-6 flex items-center gap-3 border-b border-cyan-900/30 pb-4">
        <div className="p-2 bg-slate-900 rounded-lg border border-cyan-500/30">
            <Terminal className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-cyan-100 tracking-wide">SYSTEM COMMANDS</h1>
            <p className="text-cyan-600/70 text-sm font-mono">EXECUTE MAINTENANCE PROTOCOLS & SCRIPTS</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <CommandConsole />
      </div>
    </div>
  );
}
