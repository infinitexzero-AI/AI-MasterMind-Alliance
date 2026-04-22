import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Archive,
  Terminal,
  Bug,
  Zap,
  CheckCircle,
  AlertOctagon,
  BookOpen,
  Plus,
  Search,
  GitBranch
} from 'lucide-react';
import Tooltip from './Tooltip';
import { sanitizeId } from '../utils/formatters';

interface Macro {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  prompt: string;
  color: string;
}

const DEFAULT_MACROS: Macro[] = [
  {
    id: 'launch_cc',
    label: 'Launch Cortex',
    icon: <Play className="w-4 h-4" />,
    prompt: '/launch_command_center',
    color: 'hover:bg-indigo-500/20 text-indigo-400'
  },
  {
    id: 'scholar_mode',
    label: 'Scholar Mode',
    icon: <BookOpen className="w-4 h-4" />,
    prompt: '/scholar_mode',
    color: 'hover:bg-cyan-500/20 text-cyan-400'
  },
  {
    id: 'sys_status',
    label: 'System Status',
    icon: <Terminal className="w-4 h-4" />,
    prompt: '/system_status',
    color: 'hover:bg-emerald-500/20 text-emerald-400'
  },
  {
    id: 'fix_dashboard',
    label: 'Heal Dashboard',
    icon: <RotateCcw className="w-4 h-4" />,
    prompt: '/fix_dashboard',
    color: 'hover:bg-amber-500/20 text-amber-400'
  },
  {
    id: 'batch_sync',
    label: 'Intelligence Sync',
    icon: <Zap className="w-4 h-4" />,
    prompt: '/sync_intelligence',
    color: 'hover:bg-purple-500/20 text-purple-400'
  },
  {
    id: 'comet_scout',
    label: 'Comet Scout',
    icon: <Search className="w-4 h-4" />,
    prompt: '/comet_scout topic=AILCC_Phase4',
    color: 'hover:bg-blue-500/20 text-blue-400'
  },
  {
    id: 'gemini_pr',
    label: 'Gemini PR',
    icon: <GitBranch className="w-4 h-4" />,
    prompt: '/gemini_pr directive="Optimize telemetry chart rendering"',
    color: 'hover:bg-pink-500/20 text-pink-400'
  },
];

const iconMap: Record<string, React.ReactNode> = {
  'terminal': <Terminal className="w-4 h-4" />,
  'play': <Play className="w-4 h-4" />,
  'rotate-ccw': <RotateCcw className="w-4 h-4" />,
  'book-open': <BookOpen className="w-4 h-4" />,
  'zap': <Zap className="w-4 h-4" />,
  'bug': <Bug className="w-4 h-4" />
};

const MacrosWidget: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [customMacros, setCustomMacros] = useState<Macro[]>([]);

  useEffect(() => {
    fetch('/api/macros')
      .then(res => res.json())
      .then(data => setCustomMacros(data))
      .catch(err => console.error("Failed to load custom macros", err));
  }, []);

  const triggerMacro = async (macro: Macro) => {
    setActiveId(macro.id);
    setLastStatus(null);

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: macro.prompt }),
      });

      if (res.ok) {
        setLastStatus(`Dispatched: ${macro.label}`);
        setTimeout(() => setLastStatus(null), 3000);
      } else {
        setLastStatus('Failed to Dispatch');
      }
    } catch (e) {
      setLastStatus('Error connecting to Dispatcher');
    } finally {
      setTimeout(() => setActiveId(null), 500);
    }
  };

  const allMacros = [...DEFAULT_MACROS, ...customMacros];

  return (
    <div className="flex flex-col h-full font-mono text-xs overflow-y-auto custom-scrollbar pr-1">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <span className="flex items-center text-slate-400">
          <Zap className="w-3 h-3 mr-2" />
          AUTOMATION LIBRARY
        </span>
        {lastStatus && (
          <span className="text-emerald-400 animate-pulse text-[10px]">
            {lastStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {allMacros.map((macro) => (
          <Tooltip key={sanitizeId(macro.id)} content={macro.prompt} position="top">
            <button
              onClick={() => triggerMacro(macro)}
              disabled={activeId !== null}
              className={`
                            w-full flex items-center p-3 rounded-lg border border-slate-800
                            transition-all duration-200 bg-slate-900/50
                            ${macro.color}
                            ${activeId === macro.id ? 'scale-95 ring-1 ring-white/20' : 'hover:scale-105 active:scale-95'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
            >
              <div className="mr-3">
                {activeId === macro.id ? <LoaderIcon /> :
                  (typeof macro.icon === 'string' ? iconMap[macro.icon] || <Zap className="w-4 h-4" /> : macro.icon)}
              </div>
              <span className="truncate">{macro.label}</span>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

const LoaderIcon = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default MacrosWidget;
