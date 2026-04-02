
import React, { useState, useEffect } from 'react';

export default function OmniSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Simulation of "Max Depth Search"
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      // Mock results based on query
      const mockData = [
        `📂 /logs/system/${query}_trace.log`,
        `🤖 Agent: ${query} (Idle)`,
        `🧠 Memory: "Pattern ${query} detected"`,
        `⚡ Task: Deploy ${query} protocol`,
        `📜 File: dashboard/components/${query}.tsx`
      ];
      setResults(mockData);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50">
      {/* Search Bar */}
      <div className={`relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'ring-2 ring-purple-500/50 bg-slate-800/90' : 'hover:bg-slate-800/50'}`}>
        <div className="pl-4 text-purple-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-slate-100 px-4 py-3 placeholder-slate-500 font-light tracking-wide"
          placeholder="OmniSearch: Query Agents, Logs, and Data..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <div className="pr-4 text-xs text-slate-500 font-mono hidden sm:block">
          CMD + K
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-14 left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 bg-white/5 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Max Depth Results
          </div>
          <div className="max-h-64 overflow-y-auto">
            {results.map((res, i) => (
              <div key={i} className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center group transition-colors border-b border-white/5 last:border-0">
                <span className="text-slate-400 mr-3 group-hover:text-purple-400">
                  ↳
                </span>
                <span className="text-slate-300 font-mono text-sm group-hover:text-white">
                  {res}
                </span>
              </div>
            ))}
            <div className="px-4 py-2 text-center text-xs text-slate-600 italic">
              Searching entire Nexus Alliance database...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
