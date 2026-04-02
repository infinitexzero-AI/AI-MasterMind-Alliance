import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Award, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [xp, setXp] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [mode, setMode] = useState<'focus' | 'rest'>('focus');
  const [streak, setStreak] = useState(0);
  const [showXpGain, setShowXpGain] = useState(false);

  // Load state from local storage
  useEffect(() => {
    const savedXp = localStorage.getItem('neuro_xp');
    const savedStreak = localStorage.getItem('neuro_streak');
    const lastSession = localStorage.getItem('neuro_last_session_date');
    
    if (savedXp) setXp(parseInt(savedXp));
    if (savedStreak) {
        const today = new Date().toDateString();
        // If last session was yesterday, keep streak. If older, reset. 
        // For now, just simplistic persistence.
        setStreak(parseInt(savedStreak));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
      setIsActive(false);
      const xpGain = mode === 'focus' ? 100 : 20;
      const newXp = xp + xpGain;
      
      setXp(newXp);
      setSessionCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Persist
      localStorage.setItem('neuro_xp', newXp.toString());
      localStorage.setItem('neuro_streak', (streak + 1).toString());
      localStorage.setItem('neuro_last_session_date', new Date().toDateString());

      // Trigger FX
      setShowXpGain(true);
      setTimeout(() => setShowXpGain(false), 3000);

      // Switch modes
      if (mode === 'focus') {
          setMode('rest');
          setTimeLeft(5 * 60);
      } else {
          setMode('focus');
          setTimeLeft(25 * 60);
      }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
        layout
        className={`glass-panel p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-colors duration-700 ${
            mode === 'focus' ? 'border-amber-500/20 bg-amber-950/10' : 'border-blue-500/20 bg-blue-950/10'
        }`}
    >
      {/* Background Pulse */}
      <motion.div 
        animate={{ opacity: isActive ? [0.1, 0.2, 0.1] : 0.05 }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-br ${
            mode === 'focus' ? 'from-amber-500/20 to-orange-600/5' : 'from-blue-500/20 to-cyan-600/5'
        }`} 
      />
      
      <div className="relative flex justify-between items-center mb-6">
        <h3 className={`font-bold flex items-center gap-2 uppercase tracking-widest text-xs ${
            mode === 'focus' ? 'text-amber-400' : 'text-blue-400'
        }`}>
          {mode === 'focus' ? <Brain size={14} /> : <Zap size={14} />}
          {mode === 'focus' ? 'Deep_Focus_Protocol' : 'Neuro_Recovery'}
        </h3>
        <div className="text-xs text-slate-400 font-mono flex gap-3">
             <span className="flex items-center gap-1 text-yellow-500"><Award size={12} /> Lvl {Math.floor(xp / 1000) + 1}</span>
             <span>XP: {xp}</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center py-2">
        <div className={`text-6xl font-mono mb-8 tracking-wider font-light tabular-nums drop-shadow-lg ${
             mode === 'focus' ? 'text-amber-100' : 'text-blue-100'
        }`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`p-4 rounded-full transition-all shadow-lg backdrop-blur-md border ${
              isActive 
                ? 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30' 
                : mode === 'focus' 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-200 hover:bg-blue-500/30'
            }`}
          >
            {isActive ? <Pause size={28} /> : <Play size={28} offset={1} />}
          </motion.button>
          
          <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="p-4 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-lg backdrop-blur-md"
          >
            <RotateCcw size={28} />
          </motion.button>
        </div>
      </div>

      <div className="relative mt-8 pt-4 border-t border-white/5 flex justify-between text-xs text-slate-400 font-mono">
        <div className="flex flex-col">
            <span className="uppercase text-[9px] tracking-widest opacity-50">Session Streak</span>
            <span className="text-white text-lg">{streak}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="uppercase text-[9px] tracking-widest opacity-50">Today's Sessions</span>
            <div className="flex gap-1 mt-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < sessionCount ? 'bg-green-500' : 'bg-white/10'}`} />
                ))}
            </div>
        </div>
      </div>

      {/* XP GAIN POPUP */}
      <AnimatePresence>
        {showXpGain && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-2xl"
            >
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1 }}
                        className="text-yellow-400 mb-2 flex justify-center"
                    >
                        <Award size={48} />
                    </motion.div>
                    <div className="text-2xl font-bold text-white mb-1">
                        +{mode === 'focus' ? 100 : 20} XP
                    </div>
                    <div className="text-xs text-yellow-200 uppercase tracking-widest">
                        Neural Pathway Reinforced
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
