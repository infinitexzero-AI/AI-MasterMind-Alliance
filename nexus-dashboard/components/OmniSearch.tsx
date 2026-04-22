import React, { useState, useEffect } from 'react';
import { useCommandDispatcher } from './hooks/useCommandDispatcher';
import { Sparkles, Zap, Search, FileText } from 'lucide-react';
import { useRouter } from 'next/router';
import { uiAudio } from '../lib/audio';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function OmniSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { dispatchCommand, loading: dispatchLoading } = useCommandDispatcher();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const handleVoiceCommand = async (e: any) => {
      if (e.detail?.query) {
        const voiceQuery = e.detail.query;
        setQuery(voiceQuery);
        setIsOpen(true);
        setStatusMessage(null);
        uiAudio.playDispatch();

        // Auto-dispatch voice commands via Local-First (airGap = true) Ollama Pipeline
        const data = await dispatchCommand(voiceQuery, true);

        if (data) {
          setStatusMessage(`Routed to [${data.role?.toUpperCase() || 'AGENT'}] (Local Voice)`);
          uiAudio.playSuccess();
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
    window.addEventListener('NEXUS_VANGUARD_COMMAND' as any, handleVoiceCommand);
    return () => window.removeEventListener('NEXUS_VANGUARD_COMMAND' as any, handleVoiceCommand);
  }, [dispatchCommand]);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/intelligence/search?limit=3&q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        console.error("OmniSearch sync failed", e);
      } finally {
        setSearchLoading(false);
      }
    }
    performSearch();
  }, [debouncedQuery]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setStatusMessage(null);
      setIsOpen(true);
      uiAudio.playDispatch();
      const data = await dispatchCommand(query);
      if (data) {
        setStatusMessage(`Routed to [${data.role?.toUpperCase() || 'AGENT'}]`);
        uiAudio.playSuccess();
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
      <div className={`relative flex items-center bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-lg transition-all duration-300 ${isOpen ? 'ring-2 ring-cyan-500/50 bg-slate-800/90 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'hover:bg-slate-800/50 hover:border-slate-600/50'}`}>
        <div className="pl-4 text-cyan-400">
          {dispatchLoading || searchLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-slate-100 px-4 py-2 text-sm placeholder-slate-500 font-medium tracking-wide focus:outline-none"
          placeholder="Search Intelligence Vault or Dispatch Command..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            if (!dispatchLoading && !statusMessage) {
              setTimeout(() => setIsOpen(false), 200);
            }
          }}
        />
        <div className="pr-4 text-xs text-slate-400 font-mono hidden sm:block">
          CMD + K
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (query || statusMessage) && (
        <div className="absolute top-14 left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[400px]">

          {dispatchLoading && (
            <div className="px-4 py-3 flex items-center text-cyan-400 border-b border-white/5">
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

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {searchResults.length > 0 && !dispatchLoading && !statusMessage && (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Intelligence Vault Matches</div>
                {searchResults.map((result, idx) => (
                  <div key={idx} className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 rounded-lg group transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                        <FileText className="w-3 h-3 group-hover:text-cyan-300" />
                        <span className="truncate max-w-[200px] group-hover:text-cyan-300">{result.path.split('/').pop()}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Sc: {result.score}</span>
                    </div>
                    <div className="text-sm text-slate-300 line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {result.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!dispatchLoading && !statusMessage && query && searchResults.length === 0 && !searchLoading && (
              <div className="p-6 text-center text-slate-500 font-mono text-xs uppercase tracking-widest opacity-60 flex flex-col gap-2 items-center">
                <Search className="w-6 h-6 mb-2 opacity-50" />
                No semantic matches in Vault
                <span className="text-[10px] opacity-70">Press Enter to dispatch as a task to the Swarm</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
