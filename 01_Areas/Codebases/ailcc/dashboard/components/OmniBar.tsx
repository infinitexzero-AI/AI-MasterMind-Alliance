import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Sparkles, Terminal, Zap, ArrowRight, X, Mic, Wifi, WifiOff } from 'lucide-react';
import { useCommandDispatcher } from './hooks/useCommandDispatcher';
import { BiometricConsentModal } from './BiometricConsentModal';
import { PersonaSwitcher, PersonaType } from './PersonaSwitcher';

interface OmniBarProps {
  onDispatch?: (_result: any) => void;
}

export const OmniBar: React.FC<OmniBarProps> = ({ onDispatch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activePersona, setActivePersona] = useState<PersonaType>('general');
  const [localResult, setLocalResult] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingCommand, setPendingCommand] = useState('');
  const [isAirGapActive, setIsAirGapActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const { dispatchCommand, loading } = useCommandDispatcher();
  const [currentContext, setCurrentContext] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      const res = await fetch('/api/context');
      if (res.ok) setCurrentContext(await res.json());
    };
    fetchContext();
  }, [isOpen]);

  // Toggle on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setLocalResult(null);
      setQuery('');
      if (isRecording) stopRecording();
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');

        try {
          // Note: In dev, the API runs on :8000 or :8090, but dashboard routes everything via rewrites/cors or absolute URL
          // Let's use the absolute URL for the hippocampus API since it's containerized or running locally on 8090
          const res = await fetch('http://localhost:8090/voice/transcribe', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.status === 'success') {
            setLocalResult(`Voice Command Processed: ${data.ticket_id}`);
            if (onDispatch) onDispatch(data);
            setTimeout(() => setIsOpen(false), 3000);
          } else {
            setLocalResult(`Voice Error: ${data.error}`);
          }
        } catch (err: any) {
          setLocalResult(`Network Error connecting to transcription server.`);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setLocalResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setLocalResult("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const executeDispatch = async (cmd: string) => {
    setLocalResult(null);
    const data = await dispatchCommand(cmd, isAirGapActive);

    if (data) {
      setLocalResult(`Routed to [${data.role?.toUpperCase() || 'UNKNOWN'}] - Task Created`);
      if (onDispatch) onDispatch(data);

      setTimeout(() => {
        setIsOpen(false);
        setPendingCommand('');
      }, 2000);
    } else {
      setLocalResult('Error dispatching task.');
      setPendingCommand('');
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const lowerQuery = query.toLowerCase();
    const highRiskKeywords = ['purge', 'delete', 'destroy', 'format', 'shutdown', 'nuke'];
    const isHighRisk = highRiskKeywords.some(kw => lowerQuery.includes(kw));

    if (isHighRisk) {
      setPendingCommand(query);
      setShowBiometric(true);
    } else {
      const finalQuery = activePersona !== 'general' ? `@${activePersona} ${query}` : query;
      await executeDispatch(finalQuery);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showBiometric && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed z-50 w-full max-w-2xl px-4 top-[20vh]"
            >
              <div className="renaissance-panel border-cyan-500/50 shadow-[0_0_50px_rgba(14,165,233,0.3)] bg-slate-900/90 relative overflow-hidden">

                {/* Header / Input Area */}
                <form onSubmit={handleCommand} className="relative flex items-center p-4">
                  <Command className="w-6 h-6 text-cyan-400 mr-4 animate-pulse" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What is your command?"
                    className="w-full bg-transparent text-xl text-white placeholder-slate-500 focus:outline-none font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`absolute right-12 top-4 transition-colors ${isRecording ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400 hover:text-white'}`}
                    title={isRecording ? "Stop Recording (Esc to cancel)" : "Start Voice Task (Press & click)"}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>

                <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />

                {/* Suggestions / Results */}
                <div className="border-t border-slate-700/50 bg-slate-950/30 min-h-[60px] p-2">
                  {loading ? (
                    <div className="flex items-center justify-center p-4 text-cyan-400">
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      <span className="font-mono text-sm">Processing Intent...</span>
                    </div>
                  ) : localResult ? (
                    <div className="flex items-center justify-center p-4 text-emerald-400">
                      <Zap className="w-5 h-5 mr-2" />
                      <span className="font-mono text-sm font-bold">{localResult}</span>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      <div className="flex items-center text-slate-400 text-sm px-3 py-2 hover:bg-white/5 rounded cursor-pointer transition-colors"
                        onClick={() => setQuery("Research the latest agentic patterns")}>
                        <Search className="w-4 h-4 mr-3" />
                        <span>"Research the latest agentic patterns"</span>
                      </div>
                      <div className="flex items-center text-slate-400 text-sm px-3 py-2 hover:bg-white/5 rounded cursor-pointer transition-colors"
                        onClick={() => setQuery("Fix the bug in the navbar")}>
                        <Terminal className="w-4 h-4 mr-3" />
                        <span>"Fix the bug in the navbar"</span>
                      </div>
                      {isRecording && (
                        <div className="flex items-center justify-center p-4 bg-red-500/10 rounded-lg mt-2 border border-red-500/20">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-3" />
                          <span className="text-red-400 font-mono text-sm tracking-widest uppercase">Listening for Voice Task...</span>
                        </div>
                      )}
                      <div className="pt-2 pb-1 border-t border-slate-800/50 mt-2">
                        <p className="text-[10px] text-slate-400 font-mono px-3 uppercase tracking-wider mb-1">System Actions</p>
                        <div className="flex items-center text-red-400/80 text-sm px-3 py-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                          onClick={() => setQuery("Purge System Cache")}>
                          <Zap className="w-3 h-3 mr-3" />
                          <span>Purge System Cache</span>
                        </div>
                        <div className="flex items-center text-emerald-400/80 text-sm px-3 py-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                          onClick={() => setQuery("Optimize Agent Database")}>
                          <Sparkles className="w-3 h-3 mr-3" />
                          <span>Optimize Agent Database</span>
                        </div>
                        <div className="flex items-center text-purple-400/80 text-sm px-3 py-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                          onClick={() => setQuery("Deploy System Hotfix")}>
                          <ArrowRight className="w-3 h-3 mr-3" />
                          <span>Deploy System Hotfix</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-slate-950/50 px-4 py-2 flex justify-between items-center text-xs text-slate-400 font-mono uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse
                        ${currentContext?.active_mode === 'SCHOLAR' ? 'bg-cyan-500' :
                        currentContext?.active_mode === 'CODE' ? 'bg-purple-500' :
                          currentContext?.active_mode === 'STRATEGY' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                    />
                    {currentContext?.mode_info?.name || 'Mode 6: Online'}
                  </span>
                  <span className="flex flex-wrap items-center">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                           const res = await fetch('/api/xbox/launch', { method: 'POST' });
                           const data = await res.json();
                           setLocalResult(data.message);
                        } catch(e) { setLocalResult("ThinkPad Bridge Error") }
                      }}
                      className="mr-3 px-2 py-1 flex items-center gap-1 rounded bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                      title="Remote deploy Dashboard to Xbox via ThinkPad Bridge"
                      aria-label="Deploy to Xbox"
                    >
                      <Zap className="w-3 h-3" />
                      XBOX LINK
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAirGapActive(!isAirGapActive)}
                      className={`mr-4 px-2 py-1 flex items-center gap-1 rounded border transition-colors ${isAirGapActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800/50 text-slate-500 border-transparent hover:text-slate-300'}`}
                      title="Toggle Tactical Air-Gap (Local models only)"
                      aria-label="Toggle Tactical Air-Gap"
                    >
                      {isAirGapActive ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                      AIR-GAP
                    </button>
                    Dispatch <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <BiometricConsentModal
        isOpen={showBiometric}
        command={pendingCommand}
        onConsent={() => {
          setShowBiometric(false);
          executeDispatch(pendingCommand);
        }}
        onCancel={() => {
          setShowBiometric(false);
          setPendingCommand('');
        }}
      />
    </>
  );
};
