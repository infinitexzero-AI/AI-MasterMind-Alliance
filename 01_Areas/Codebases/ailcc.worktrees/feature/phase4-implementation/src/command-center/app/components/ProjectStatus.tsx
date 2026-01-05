'use client';

import React, { useState } from 'react';
import { GitPullRequest, Layout, CheckCircle2, Clock, AlertTriangle, Plus, X, Loader2 } from 'lucide-react';
import { createLinearIssue } from '../actions/linear';
import { motion } from 'framer-motion';

interface TaskItem {
    title: string;
    state?: { name: string };
    url: string;
    html_url?: string;
}

interface Props {
    linear?: { connected: boolean; issues: TaskItem[] };
    github?: { connected: boolean; prs: TaskItem[] };
}

interface StatusItem {
    source: string;
    name: string;
    status: string;
    url?: string;
    icon: React.ElementType;
    color: string;
    containerClass?: string;
}

export default function ProjectStatus({ linear, github }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(0); // 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleCreate = async () => {
      if (!title.trim()) return;
      
      setIsSubmitting(true);
      setFeedback(null);

      try {
          const res = await createLinearIssue(title, undefined, priority);
          if (res.success && res.issue) {
              setFeedback({ type: 'success', msg: `Issue created: ${res.issue.title}` });
              setTitle('');
              setTimeout(() => {
                  setIsCreating(false);
                  setFeedback(null);
              }, 2000);
          } else {
              setFeedback({ type: 'error', msg: res.error || 'Failed to create issue' });
          }
      } catch {
          setFeedback({ type: 'error', msg: 'An error occurred' });
      } finally {
          setIsSubmitting(false);
      }
  };

  const items: StatusItem[] = [];

  if (linear?.issues) {
      linear.issues.forEach(issue => {
          // Mock logic for demonstration until real assignee data flows through
          const isUser = issue.title.toLowerCase().includes('approve') || issue.title.toLowerCase().includes('review');
          const assignColor = isUser ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-blue-400 border-slate-800 bg-slate-950/50';

          items.push({
              source: 'Linear',
              name: issue.title,
              status: issue.state?.name || 'Unknown',
              url: issue.url,
              icon: Layout,
              color: isUser ? 'text-amber-400' : 'text-blue-400',
              containerClass: assignColor
          });
      });
  }

  if (github?.prs) {
      github.prs.forEach(pr => {
           items.push({
              source: 'GitHub',
              name: pr.title,
              status: 'Open PR',
              url: pr.html_url,
              icon: GitPullRequest,
              color: 'text-purple-400',
              containerClass: 'text-purple-400 border-slate-800 bg-slate-950/50'
          });
      });
  }

  // Fallback if empty but connected
  if (items.length === 0 && (linear?.connected || github?.connected)) {
      items.push({ source: 'System', name: 'No active tasks found', status: 'Idle', icon: CheckCircle2, color: 'text-slate-500' });
  }

  // Fallback if not connected
  if (!linear && !github) {
       items.push({ source: 'System', name: 'Connecting to Bridge...', status: 'Pending', icon: Clock, color: 'text-yellow-500' });
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="p-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/80">
        <h3 className="text-slate-300 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Active Operations
        </h3>
        <div className="flex gap-1 items-center">
             <button 
                onClick={() => setIsCreating(true)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                title="Create Linear Issue"
             >
                <Plus className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-slate-700 mx-1" />
             <div className="w-2 h-2 rounded-full bg-slate-600" />
        </div>
      </div>

      <div className="flex-1 p-2 overflow-y-auto space-y-2 max-h-[400px]">
        {items.map((p, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => p.url && window.open(p.url, '_blank')}
                className={`p-3 rounded flex justify-between items-center group hover:border-slate-600 transition-colors cursor-pointer border ${p.containerClass || 'border-slate-800 bg-slate-950/50'}`}
            >
                <div className="flex items-center gap-3">
                    <p.icon className={`w-4 h-4 ${p.color}`} />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                            {p.name.length > 28 ? p.name.substring(0, 28) + '...' : p.name}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.source} • {p.status}</span>
                    </div>
                </div>
                {p.containerClass?.includes('amber') && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded animate-pulse">ACTION</span>
                )}
            </motion.div>
        ))}
        
        {(!linear?.connected || !github?.connected) && (
            <div className="text-center p-2">
                <span className="text-[10px] text-red-400 font-mono flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Some bridges offline
                </span>
            </div>
        )}
      </div>


      {/* Creation Modal / Overlay */}
      {isCreating && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur z-20 flex flex-col p-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-wider">New Linear Issue</h4>
                  <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white" aria-label="Close modal">
                      <X className="w-4 h-4" />
                  </button>
              </div>
              
              <div className="space-y-3 flex-1">
                   <div>
                       <label className="block text-[10px] text-slate-500 mb-1">TITLE</label>
                       <input 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none placeholder:text-slate-700"
                          placeholder="What needs to be done?"
                          autoFocus
                       />
                   </div>
                   
                   <div>
                       <label className="block text-[10px] text-slate-500 mb-1">PRIORITY</label>
                       <div className="flex gap-2">
                           {[ {v:0, l:'None'}, {v:1, l:'Urgent'}, {v:2, l:'High'}, {v:3, l:'Normal'} ].map(p => (
                               <button 
                                  key={p.v}
                                  onClick={() => setPriority(p.v)}
                                  className={`px-2 py-1 text-[10px] rounded border ${priority === p.v ? 'border-cyan-500 bg-cyan-950 text-cyan-400' : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-600'}`}
                               >
                                   {p.l}
                               </button>
                           ))}
                       </div>
                   </div>

                   {feedback && (
                       <div className={`p-2 rounded text-[10px] ${feedback.type === 'success' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' : 'bg-red-950/50 text-red-400 border border-red-900'}`}>
                           {feedback.msg}
                       </div>
                   )}
              </div>

              <button 
                  disabled={isSubmitting || !title.trim()}
                  onClick={handleCreate}
                  className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layout className="w-3 h-3" />}
                  CREATE ISSUE
              </button>
          </div>
      )}
    </div>
  );
}

