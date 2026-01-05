'use client';

import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    
    // Simulation of API call delay
    setTimeout(() => {
        // Placeholder for actual DALL-E / Stable Diffusion API
        // For now, we use a high-quality placeholder that matches the aesthetic
        setGeneratedImage(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`);
        setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-cyan-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-3 border-b border-cyan-800/50 flex justify-between items-center bg-slate-900/80">
        <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Neural_Image_Synth
        </h3>
        <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-cyan-500/20" />
             <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
             <div className="w-2 h-2 rounded-full bg-cyan-500" />
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Display Area */}
        <div className="flex-1 min-h-[200px] bg-slate-950/50 rounded-lg border border-cyan-900/30 flex items-center justify-center relative overflow-hidden group">
            <AnimatePresence mode="wait">
                {isGenerating ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <span className="text-xs text-cyan-600 font-mono animate-pulse">SYNTHESIZING...</span>
                    </motion.div>
                ) : generatedImage ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full h-full"
                    >
                         <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ) : (
                    <span className="text-cyan-800 text-xs font-mono uppercase">Awaiting Prompt Input</span>
                )}
            </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter visualization parameters..."
            className="flex-1 bg-slate-950 border border-cyan-900/50 rounded-md p-2 text-cyan-100 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-cyan-900/50"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
