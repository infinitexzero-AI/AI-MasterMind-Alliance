import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
        setGeneratedImage(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`);
        setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="glass-panel p-0 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="panel-header mb-0 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Neural_Image_Synth
        </h3>
        <div className="flex gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_currentColor]" />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        {/* Display Area */}
        <div className="flex-1 min-h-[240px] bg-black/40 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden group">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="text-xs text-cyan-500 font-mono animate-pulse tracking-widest">SYNTHESIZING...</span>
                    </div>
                ) : generatedImage ? (
                    <div className="relative w-full h-full">
                         <img src={generatedImage} alt="Generated" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <p className="text-xs font-mono text-white truncate w-full">{prompt}</p>
                         </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-slate-700 mx-auto" />
                        <span className="text-slate-600 text-xs font-mono uppercase block">Awaiting Visual Parameters</span>
                    </div>
                )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Enter visualization parameters..."
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-cyan-100 font-mono focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all placeholder:text-slate-600"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="glass-button bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
