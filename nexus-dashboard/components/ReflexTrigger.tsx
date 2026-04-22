import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Check, AlertTriangle, Loader } from 'lucide-react';

interface ReflexTriggerProps {
  label: string;
  workflowId?: string;
  webhookUrl?: string; // Optional direct URL override
  color?: string;
  icon?: React.ReactNode;
  onClickOverride?: () => void;
}

export const ReflexTrigger: React.FC<ReflexTriggerProps> = ({ 
  label, 
  workflowId, 
  webhookUrl, 
  color = 'bg-blue-500',
  icon,
  onClickOverride
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleTrigger = async () => {
    if (onClickOverride) {
        onClickOverride();
        return;
    }
    
    setStatus('loading');
    
    try {
      // Logic to trigger N8N via local API proxy
      const res = await fetch('/api/n8n/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId, webhookUrl, label })
      });
      
      if (!res.ok) throw new Error('Trigger failed');
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleTrigger}
      disabled={status === 'loading'}
      className={`relative w-full overflow-hidden rounded-lg group border border-white/5 p-3 flex items-center gap-3 transition-all
         ${status === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-900/40 hover:bg-slate-800/60'}
      `}
    >
      <div className={`p-2 rounded-md ${color} bg-opacity-20 text-white`}>
        {status === 'loading' ? <Loader className="animate-spin" size={16} /> :
         status === 'success' ? <Check size={16} /> :
         status === 'error' ? <AlertTriangle size={16} /> :
         icon || <Play size={16} />}
      </div>
      
      <div className="text-left flex-1">
        <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-wider">
          {label}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">
            {status === 'idle' ? 'Ready to Fire' : status.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar Visual */}
      {status === 'loading' && (
           <motion.div 
                layoutId="progress"
                className={`absolute bottom-0 left-0 h-1 ${color}`} 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5 }}
           />
      )}
    </motion.button>
  );
};
