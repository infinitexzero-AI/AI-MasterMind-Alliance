import React, { useState } from 'react';
import { useCommandDispatcher } from './hooks/useCommandDispatcher';
import { Sparkles, Zap, Search } from 'lucide-react';

export default function OmniSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { dispatchCommand, loading } = useCommandDispatcher();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
        setStatusMessage(null);
        setIsOpen(true);
        const data = await dispatchCommand(query);
        if (data) {
            setStatusMessage(`Routed to [${data.role?.toUpperCase()}]`);
            setTimeout(() => {
                setIsOpen(false);
                setStatusMessage(null);
                setQuery('');
            }, 3000);
        } else {
            setStatusMessage('Dispatch Failed');
        }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      {/* Search Bar */}
      <div className={`relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'ring-2 ring-purple-500/50 bg-slate-800/90' : 'hover:bg-slate-800/50'}`}>
        <div className="pl-4 text-purple-400">
           {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-slate-100 px-4 py-3 placeholder-slate-500 font-light tracking-wide focus:outline-none"
          placeholder="OmniSearch: Type command and press Enter..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
              if (!loading && !statusMessage) {
                  setTimeout(() => setIsOpen(false), 200);
              }
          }}
        />
        <div className="pr-4 text-xs text-slate-500 font-mono hidden sm:block">
          CMD + K
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (query || statusMessage) && (
        <div className="absolute top-14 left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {loading && (
             <div className="px-4 py-3 flex items-center text-cyan-400">
                 <Sparkles className="w-4 h-4 mr-3 animate-spin" />
                 <span className="font-mono text-sm">Processing Intent...</span>
             </div>
          )}

          {statusMessage && (
              <div className="px-4 py-3 flex items-center text-emerald-400 border-b border-white/5">
                  <Zap className="w-4 h-4 mr-3" />
                  <span className="font-mono text-sm font-bold">{statusMessage}</span>
              </div>
          )}

          {!loading && !statusMessage && query && (
             <div className="px-4 py-2 text-xs text-slate-500 italic">
                 Press Enter to dispatch command to agent swarm.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
