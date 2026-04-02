import { useState } from 'react';
import { Database, FileText, CheckCircle2 } from 'lucide-react';

export default function McatAnkiDrop() {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultPath, setResultPath] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic || !text) return;
    setLoading(true);
    setResultPath(null);

    try {
      const res = await fetch('/api/medical/mcat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, syllabusText: text })
      });
      
      const data = await res.json();
      if (data.csv_path) {
        setResultPath(data.csv_path);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col space-y-4">
      <div className="flex items-center space-x-3 text-cyan-500 mb-2">
        <Database className="w-5 h-5" />
        <h2 className="text-xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Autonomous Anki Generator</h2>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase">Deck Topic</label>
        <input 
          className="bg-slate-950 border border-slate-800 rounded p-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
          placeholder="e.g. Neuroscience 101: Action Potentials"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col flex-1 space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase">Input Syllabus / Lecture Text</label>
        <textarea 
          className="flex-1 min-h-[150px] bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-400 focus:outline-none focus:border-cyan-500/50 resize-none"
          placeholder="Paste pure raw lecture notes or textbook excerpts here. The LLM will autonomously scrub, structure, and synthesize them into Anki CSV format..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      </div>

      {!resultPath ? (
        <button 
          onClick={handleGenerate}
          disabled={loading || !topic || !text}
          className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-sm uppercase tracking-wider rounded border border-cyan-500/20 transition-all disabled:opacity-50"
        >
          {loading ? 'Synthesizing Deck...' : 'Generate Flashcards'}
        </button>
      ) : (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-mono truncate max-w-[200px]">{resultPath}</span>
          </div>
          <button 
            onClick={() => {
              setResultPath(null);
              setText('');
            }}
            className="text-xs font-mono text-slate-400 hover:text-white"
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}
