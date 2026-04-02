import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Lock, Zap, GitBranch, Database, Shield, Clock, Target, Mic, MicOff, AudioLines } from 'lucide-react';
import styles from '../styles/WarRoom.module.css';

export default function WarRoom() {
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [judgeVerdict, setJudgeVerdict] = useState<any>(null);
  const [intelReport, setIntelReport] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const [directives, setDirectives] = useState([
    {
      id: 'T-UI-01',
      name: 'Deploy Valentine Core',
      assignedTo: 'ChatGPT',
      status: 'DONE',
      priority: 'CRITICAL',
      layer: 'Connective Tissue',
      x: 45,
      y: 40,
      blocksCount: 0,
      icon: Shield
    },
    {
      id: 'T-UI-02',
      name: 'Design Shared Memory',
      assignedTo: 'Grok',
      status: 'IN-PROGRESS',
      priority: 'HIGH',
      layer: 'Foundation',
      x: 30,
      y: 75,
      blocksCount: 3,
      icon: Database
    },
    {
      id: 'T-UI-03',
      name: 'Create Message Queue',
      assignedTo: 'ChatGPT',
      status: 'IN-PROGRESS',
      priority: 'HIGH',
      layer: 'Connective Tissue',
      x: 65,
      y: 45,
      blocksCount: 0,
      icon: GitBranch
    },
    {
      id: 'T-NUI-01',
      name: 'Design Agent Protocol',
      assignedTo: 'Grok',
      status: 'IN-PROGRESS',
      priority: 'MEDIUM',
      layer: 'Swarm',
      x: 50,
      y: 60,
      blocksCount: 0,
      icon: Zap
    }
  ]);

  const [layers, setLayers] = useState([
    {
      id: 'mission-control',
      name: 'Mission Control',
      depth: 0,
      color: 'from-red-600 to-orange-600',
      blocked: false,
      health: 95,
      blockReason: ''
    },
    {
      id: 'scholar',
      name: 'Scholar',
      depth: 10,
      color: 'from-amber-500 to-yellow-600',
      blocked: true,
      health: 95,
      blockReason: '6 Credits Remaining (MATH/HLTH)'
    },
    {
      id: 'connective-tissue',
      name: 'Connective Tissue',
      depth: 25,
      color: 'from-purple-600 to-pink-600',
      blocked: false,
      health: 98,
      blockReason: ''
    },
    {
      id: 'swarm',
      name: 'Swarm',
      depth: 50,
      color: 'from-blue-600 to-cyan-600',
      blocked: false,
      health: 70,
      blockReason: ''
    },
    {
      id: 'foundation',
      name: 'Foundation',
      depth: 75,
      color: 'from-green-600 to-emerald-600',
      blocked: true,
      health: 30,
      blockReason: 'Shared Memory not configured'
    }
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const final = event.results[i][0].transcript.toLowerCase();
            setTranscript(final);
            handleVoiceCommand(final);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceCommand = (cmd: string) => {
    console.log('[Valentine] Voice Command Received:', cmd);
    if (cmd.includes('analyze') || cmd.includes('scan')) {
      fetch('/api/system/dependency-graph').then(() => console.log('Scan re-triggered'));
    }
    if (cmd.includes('vault') || cmd.includes('intelligence')) {
      const el = document.getElementById('intel-report');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    if (cmd.includes('lock') || cmd.includes('secure')) {
      // Future: Trigger Biometric Lock UI
      alert('SINGULARITY PROTOCOL: Access Restricted.');
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, scholarRes, judgeRes, intelRes] = await Promise.all([
          fetch('/api/monitor/health'),
          fetch('/api/scholar'),
          fetch('/api/judge_verdict'),
          fetch('/api/intelligence/report')
        ]);

        const healthData = await healthRes.json();
        const scholarData = await scholarRes.json();

        if (judgeRes.ok) setJudgeVerdict(await judgeRes.json());
        if (intelRes.ok) setIntelReport((await intelRes.json()).content || '');

        if (healthData.status === 'ok') {
          setLayers(prev => prev.map(layer => {
            if (layer.id === 'foundation') {
              return {
                ...layer,
                blocked: healthData.layers.foundation.blocked,
                health: healthData.services.redis.health,
                blockReason: healthData.layers.foundation.reason
              };
            }
            if (layer.id === 'connective-tissue') {
              return {
                ...layer,
                health: healthData.services.valentine.health > 0 ? 98 : 40
              };
            }
            if (layer.id === 'scholar' && scholarData.degree_progress) {
              const remainingCourses = scholarData.degree_progress.remaining_courses_needed || [];
              return {
                ...layer,
                health: scholarData.degree_progress.graduation_readiness,
                blockReason: `${120 - scholarData.degree_progress.credits_earned} Credits Remaining (${remainingCourses.length} courses)`
              };
            }

            return layer;
          }));

          setDirectives(prev => prev.map(d => {
            if (d.id === 'T-UI-02') { // Design Shared Memory
              return {
                ...d,
                status: healthData.layers.foundation.blocked ? 'BLOCKED' : 'DONE',
                blocksCount: healthData.layers.foundation.blocked ? 3 : 0
              };
            }
            if (d.id === 'T-UI-01') { // Deploy Valentine Core
              return {
                ...d,
                status: healthData.services.valentine.status === 'ONLINE' ? 'DONE' : 'IN-PROGRESS'
              };
            }
            return d;
          }));
        }
      } catch (e) {
        console.error('Failed to fetch tactical data:', e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (directive: any) => {
    setDraggedTask(directive);
  };

  const handleDrop = (layerName: string, e: React.DragEvent) => {
    if (!draggedTask) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDirectives(directives.map(d =>
      d.id === draggedTask.id
        ? { ...d, layer: layerName, x, y }
        : d
    ));
    setDraggedTask(null);
  };

  // Calculate system health with NaN safety checks
  const systemHealth = (() => {
    if (!layers || layers.length === 0) return 0;
    const validHealthValues = layers
      .map(l => l.health)
      .filter(h => typeof h === 'number' && !isNaN(h));
    if (validHealthValues.length === 0) return 0;
    return Math.round(
      validHealthValues.reduce((sum, h) => sum + h, 0) / validHealthValues.length
    );
  })();

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6 rounded-xl border border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* War Room Header */}
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-lg p-6 mb-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${isListening ? styles.valentinePulse : 'bg-red-500/10'}`}>
                <Target className={`w-12 h-12 ${isListening ? 'text-red-500' : 'text-red-400'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Strategic War Room</h1>
                <div className="flex items-center gap-3">
                  <p className="text-red-300/80 font-mono text-sm uppercase tracking-wider">Task Geography // System Cartography</p>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleVoice}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                      {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                      {isListening ? 'Valentine Active' : 'Voice Offline'}
                    </button>
                    {transcript && isListening && (
                      <span className="text-[10px] text-red-400 font-mono animate-in fade-in slide-in-from-left-2 italic">
                        "{transcript}..."
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-orange-400">{systemHealth}%</div>
              <div className="text-orange-300/60 text-sm italic">Cognitive Integrity</div>
              <div className="text-xs text-red-400 mt-1 uppercase tracking-widest font-bold">
                {directives.filter(d => d.status === 'BLOCKED').length} Critical Latencies
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* System Cartography Map */}
          <div className="lg:col-span-3 relative">
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-mono">SYSTEM LAYERS - TACTICAL VIEW</h2>

              {/* Layer Stack */}
              <div className="relative space-y-2">
                {layers.map((layer) => {
                  const layerDirectives = directives.filter(d => d.layer === layer.name);

                  return (
                    <div
                      key={layer.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setHoveredLayer(layer.name);
                      }}
                      onDragLeave={() => setHoveredLayer(null)}
                      onDrop={(e) => handleDrop(layer.name, e)}
                      className={`relative rounded-lg transition-all duration-300 min-h-[180px] ${hoveredLayer === layer.name ? 'ring-4 ring-cyan-500' : ''
                        } ${layer.blocked
                          ? 'bg-gradient-to-br from-red-600/20 to-red-500/10'
                          : 'bg-gradient-to-br from-blue-500/10 to-blue-400/5'
                        }`}
                    >
                      {/* Layer Background Pattern */}
                      <div
                        className={styles.gridPattern}
                      />

                      {/* Layer Header */}
                      <div className="relative border-b border-white/10 pb-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${layer.blocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                              }`} />
                            <h3 className="text-lg font-bold text-white font-mono">{layer.name}</h3>
                            <span className="text-xs text-white/60 font-mono">DEPTH: {layer.depth}m</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-white/80">{layer.health}%</span>
                            <div className="w-24 bg-white/10 rounded-full h-2">
                              <div
                                className={`${styles.healthBar} ${styles['w' + Math.round(layer.health)]} ${layer.health > 70 ? 'bg-green-500' :
                                  layer.health > 40 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Blockade Warning */}
                        {layer.blocked && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded px-3 py-2">
                            <Lock className="w-4 h-4 animate-pulse" />
                            <span className="font-mono">BLOCKED: {layer.blockReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Task Nodes on Layer */}
                      <div className="relative h-32">
                        {layerDirectives.map((directive) => {
                          const Icon = directive.icon;

                          return (
                            <div
                              key={directive.id}
                              draggable
                              onDragStart={() => handleDragStart(directive)}
                              className={`${styles.taskNode} ${styles['left' + Math.round(directive.x)]} ${styles['top' + Math.round(directive.y)]} group`}
                            >
                              {/* Task Node */}
                              <div className={`relative ${directive.status === 'BLOCKED'
                                ? 'ring-4 ring-red-500'
                                : 'ring-2 ring-blue-500'
                                } rounded-lg bg-black/80 backdrop-blur-sm p-3 min-w-[200px]`}>
                                {/* Status Indicator */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center">
                                  {directive.status === 'BLOCKED' ? (
                                    <Lock className="w-4 h-4 text-red-500 animate-pulse" />
                                  ) : directive.status === 'IN-PROGRESS' ? (
                                    <Clock className="w-4 h-4 text-blue-500 animate-spin duration-[3000ms]" />
                                  ) : (
                                    <Zap className="w-4 h-4 text-green-500" />
                                  )}
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${directive.status === 'BLOCKED'
                                    ? 'bg-red-600'
                                    : directive.status === 'IN-PROGRESS'
                                      ? 'bg-blue-600'
                                      : 'bg-green-600'
                                    }`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs text-white/60 font-mono mb-1">{directive.id}</div>
                                    <div className="text-sm font-bold text-white mb-1">{directive.name}</div>
                                    <div className="text-xs text-white/80">→ {directive.assignedTo}</div>
                                    {directive.blocksCount > 0 && (
                                      <div className="text-xs text-red-400 mt-1">
                                        🔒 Blocks {directive.blocksCount} services
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Hover Details */}
                                <div className="hidden group-hover:block absolute top-full left-0 mt-2 bg-black/95 border border-cyan-500/50 rounded-lg p-3 w-64 z-50">
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-white/60">Status:</span>
                                      <span className={`font-mono ${directive.status === 'BLOCKED' ? 'text-red-400' :
                                        directive.status === 'IN-PROGRESS' ? 'text-blue-400' :
                                          'text-green-400'
                                        }`}>
                                        {directive.status}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/60">Priority:</span>
                                      <span className="text-orange-400 font-mono">{directive.priority}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/60">Assigned:</span>
                                      <span className="text-cyan-400">{directive.assignedTo}</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/10">
                                      <span className="text-white/80">Drag to reassign layer</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Connection Lines to blocked services */}
                              {directive.status === 'BLOCKED' && directive.blocksCount > 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                  {[...Array(directive.blocksCount)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`${styles.connectionLine} ${styles['rot' + (Math.round(((i * 360) / directive.blocksCount) / 10) * 10) % 360]}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-white/60">Blocked Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-500" />
                  <span className="text-white/60">Blocked Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-white/60">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">Drag tasks to reassign</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live System Directives & Intelligence */}
          <div className="space-y-4">

            {/* Judge Verdict Panel */}
            <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Judge Verdict
              </h3>
              {judgeVerdict ? (
                <div className="space-y-3">
                  <div className="bg-orange-900/20 border border-orange-500/50 rounded p-3">
                    <div className="text-[10px] text-orange-400 font-mono mb-1 uppercase">Executive Summary</div>
                    <div className="text-sm text-white font-semibold leading-relaxed">{judgeVerdict.summary}</div>
                  </div>
                  <div className="bg-black/50 border border-white/5 rounded p-3">
                    <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Analysis</div>
                    <div className="text-xs text-slate-300 whitespace-pre-wrap">{judgeVerdict.analysis}</div>
                  </div>
                  {judgeVerdict.directives && judgeVerdict.directives.length > 0 && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
                      <div className="text-[10px] text-emerald-400 font-mono mb-2 uppercase">Active Directives</div>
                      <ul className="space-y-1">
                        {judgeVerdict.directives.map((dir: string, idx: number) => (
                          <li key={idx} className="text-xs text-emerald-300 font-mono flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">{'>'}</span> {dir}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-[9px] text-slate-400 font-mono text-right">
                    LATEST: {new Date(judgeVerdict.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 font-mono animate-pulse">Awaiting judgment...</div>
              )}
            </div>

            {/* Intelligence Report Snippet */}
            <div className="bg-black/40 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-4 flex flex-col max-h-96">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Intelligence Report
              </h3>
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-3 flex-1 overflow-y-auto custom-scrollbar">
                {intelReport ? (
                  <div className="text-[11px] font-mono text-indigo-200/80 whitespace-pre-wrap leading-relaxed">
                    {intelReport}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 font-mono animate-pulse flex items-center gap-2">
                    <Database className="w-4 h-4" /> Fetching Vault Data...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
