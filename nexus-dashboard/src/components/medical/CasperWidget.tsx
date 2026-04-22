import { useState, useEffect, useRef } from 'react';
import { Activity, Clock, ShieldAlert, Award } from 'lucide-react';

export default function CasperWidget() {
  const [scenario, setScenario] = useState<{ scenario: string; generated_at: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<{ Empathy?: number; Professionalism?: number; Communication?: number; Feedback?: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateScenario = async () => {
    setLoading(true);
    setResult(null);
    setResponse('');
    try {
      const res = await fetch('/api/medical/casper');
      const data = await res.json();
      setScenario(data);
      setTimeLeft(300);
      setTimerActive(true);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      submitResponse();
    }
    return () => clearTimeout(timerRef.current as NodeJS.Timeout);
  }, [timeLeft, timerActive]);

  const submitResponse = async () => {
    if (!scenario) return;
    setTimerActive(false);
    setGrading(true);
    try {
      const res = await fetch('/api/medical/casper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.scenario, response })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    setGrading(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-red-500">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">CASPer Simulator</h2>
        </div>
        {timerActive && (
          <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 font-mono">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {!scenario && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-slate-500">
          <Activity className="w-12 h-12 opacity-50" />
          <p className="text-center font-mono text-sm max-w-sm">Test your clinical empathy under extreme time pressure. A novel Canadian ethical dilemma will be forged via LLM.</p>
          <button 
            onClick={generateScenario}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded border border-slate-700 transition"
          >
            INITIALIZE SCENARIO
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-cyan-500 animate-pulse">Synthesizing Ethical Dilemma...</span>
        </div>
      )}

      {scenario && !result && !grading && (
        <div className="flex flex-col flex-1 space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
            <p className="text-slate-300 font-serif leading-relaxed text-sm">{scenario.scenario}</p>
          </div>
          <textarea
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-slate-200 font-mono text-sm focus:outline-none focus:border-red-500/50 resize-none transition-colors"
            placeholder="Type your response here. The system will auto-submit when the timer hits 00:00..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={!timerActive}
          />
          <button 
            onClick={submitResponse}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-sm uppercase tracking-wider rounded border border-red-500/20 transition-all"
          >
            SUBMIT EARLY
          </button>
        </div>
      )}

      {grading && (
        <div className="flex flex-col flex-1 items-center justify-center space-y-4">
          <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="font-mono text-sm text-slate-400">CanMEDS Evaluator grading response...</span>
        </div>
      )}

      {result && (
        <div className="flex flex-col flex-1 space-y-6">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Award className="w-5 h-5" />
            <h3 className="font-mono font-bold">Grading Rubric Complete</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 border border-slate-800 rounded flex flex-col items-center">
              <span className="text-slate-500 text-xs font-mono uppercase">Empathy</span>
              <span className="text-2xl font-bold text-cyan-400">{result.Empathy}/10</span>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-800 rounded flex flex-col items-center">
              <span className="text-slate-500 text-xs font-mono uppercase">Professionalism</span>
              <span className="text-2xl font-bold text-emerald-400">{result.Professionalism}/10</span>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-800 rounded flex flex-col items-center">
              <span className="text-slate-500 text-xs font-mono uppercase">Communication</span>
              <span className="text-2xl font-bold text-purple-400">{result.Communication}/10</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 bg-slate-800/30 border border-slate-800 rounded overflow-y-auto">
            <p className="text-slate-300 text-sm leading-relaxed">{result.Feedback}</p>
          </div>

          <button 
            onClick={generateScenario}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded transition"
          >
            RUN ANOTHER SIMULATION
          </button>
        </div>
      )}
    </div>
  );
}
