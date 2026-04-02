import React, { useState, useEffect, useRef } from 'react';
import { Database, Cloud, HardDrive, Zap, Activity } from 'lucide-react';
import { useStealthMode } from './StealthModeProvider';
import { useNeuralSync } from './NeuralSyncProvider';

export default function DataMaterialization() {
  const { isStealthMode } = useStealthMode();
  const { storage, isConnected } = useNeuralSync();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use storage from provider, fallback to defaults if not yet synced
  const syncStats = storage || {
    icloud: { active: false, filesPerSec: 0, totalFiles: 0, synced: 0 },
    onedrive: { active: false, filesPerSec: 0, totalFiles: 0, synced: 0 },
    gdrive: { active: false, filesPerSec: 0, totalFiles: 0, synced: 0 },
    xdrive: { active: false, filesPerSec: 0, totalFiles: 0, synced: 0 }
  };

  const cloudSources = [
    {
      id: 'icloud',
      name: 'iCloud',
      x: 10,
      y: 10,
      color: '#3b82f6',
      positionClass: 'left-[10%] top-[10%]',
      colorClass: 'text-blue-500',
      borderClass: 'border-blue-500',
      bgClass: 'bg-blue-500'
    },
    {
      id: 'onedrive_biz',
      name: 'OneDrive (MTA)',
      x: 30,
      y: 10,
      color: '#0078d4',
      positionClass: 'left-[30%] top-[10%]',
      colorClass: 'text-[#0078d4]',
      borderClass: 'border-[#0078d4]',
      bgClass: 'bg-[#0078d4]'
    },
    {
      id: 'onedrive_personal',
      name: 'OneDrive (Personal)',
      x: 50,
      y: 10,
      color: '#0ea5e9',
      positionClass: 'left-[50%] top-[10%]',
      colorClass: 'text-sky-500',
      borderClass: 'border-sky-500',
      bgClass: 'bg-sky-500'
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      x: 70,
      y: 10,
      color: '#22c55e',
      positionClass: 'left-[70%] top-[10%]',
      colorClass: 'text-green-500',
      borderClass: 'border-green-500',
      bgClass: 'bg-green-500'
    },
    {
      id: 'xdrive',
      name: 'XDriveAlpha',
      x: 90,
      y: 45,
      color: '#f59e0b',
      positionClass: 'left-[90%] top-[45%]',
      colorClass: 'text-amber-500',
      borderClass: 'border-amber-500',
      bgClass: 'bg-amber-500'
    }
  ];

  const hippocampus = { x: 50, y: 85, radius: 15 };

  // Particle animation engine
  useEffect(() => {
    if (isStealthMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = 1000;
    const height = canvas.height = 600;

    let animationFrameId: number;
    let localParticles: any[] = [];

    const createParticle = (source: any) => {
      const stats = syncStats[source.id];
      if (!stats || !stats.active) return;

      const particleCount = Math.ceil(stats.filesPerSec / 10);

      for (let i = 0; i < particleCount; i++) {
        localParticles.push({
          x: (source.x / 100) * width + (Math.random() - 0.5) * 40,
          y: (source.y / 100) * height,
          targetX: (hippocampus.x / 100) * width,
          targetY: (hippocampus.y / 100) * height,
          vx: 0,
          vy: 0,
          life: 1.0,
          color: source.color,
          size: 2 + Math.random() * 3,
          speed: 0.5 + Math.random() * 1
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      localParticles = localParticles.filter(particle => {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          return false; // Remove particle
        }

        // Apply gravity towards target
        particle.vx += (dx / distance) * particle.speed;
        particle.vy += (dy / distance) * particle.speed;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.005;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        ctx.strokeStyle = particle.color + '40';
        ctx.lineWidth = particle.size * 0.5;
        ctx.stroke();

        return particle.life > 0;
      });

      // Draw connections to hippocampus
      cloudSources.forEach(source => {
        if (syncStats[source.id] && syncStats[source.id].active) {
          ctx.beginPath();
          ctx.moveTo((source.x / 100) * width, (source.y / 100) * height);
          ctx.lineTo((hippocampus.x / 100) * width, (hippocampus.y / 100) * height);
          ctx.strokeStyle = source.color + '20';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw hippocampus energy field
      const hx = (hippocampus.x / 100) * width;
      const hy = (hippocampus.y / 100) * height;
      const radius = (hippocampus.radius / 100) * width;

      // Outer rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(hx, hy, radius + i * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Spawn particles
    const spawnInterval = setInterval(() => {
      cloudSources.forEach(source => createParticle(source));
    }, 100);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
    };
  }, [syncStats, isStealthMode]);


  const totalFiles = Object.values(syncStats).reduce((sum: number, s: any) => sum + s.totalFiles, 0);
  const syncedFiles = Object.values(syncStats).reduce((sum: number, s: any) => sum + s.synced, 0);
  const overallProgress = Math.round((syncedFiles / totalFiles) * 100);

  const dynamicCSS = `
    ${cloudSources.map(source => `
      .cloud-pos-${source.id} { left: ${source.x}%; top: ${source.y}%; }
      .cloud-prog-${source.id} { width: ${syncStats[source.id] ? Math.round((syncStats[source.id].synced / syncStats[source.id].totalFiles) * 100) : 0}%; }
    `).join('')}
    .hippo-pos { left: ${hippocampus.x}%; top: ${hippocampus.y + hippocampus.radius + 8}%; }
  `;

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6 rounded-xl border border-white/10">
      <style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Database className="w-12 h-12 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Hippocampus Storage Grid</h1>
                <p className="text-cyan-300/80 font-mono text-sm">Data Materialization // Foundation Layer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-cyan-400">{overallProgress}%</div>
              <div className="text-cyan-300/60 text-sm">Sync Complete</div>
              <div className="text-xs text-cyan-400 mt-1 font-mono">
                {syncedFiles.toLocaleString()} / {totalFiles.toLocaleString()} files
              </div>
            </div>
          </div>
        </div>

        {/* Particle Canvas */}
        <div className={`border border-cyan-500/30 rounded-lg p-6 mb-6 ${isStealthMode ? 'bg-black border-slate-800' : 'bg-black/40 backdrop-blur-sm'}`}>
          <div className="relative">
            {!isStealthMode && (
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg h-[600px]"
              />
            )}

            {/* Cloud Source Labels */}
            {cloudSources.map((source) => {
              if (!syncStats[source.id]) return null;
              const syncProgress = (syncStats[source.id].synced / syncStats[source.id].totalFiles) * 100;
              return (
                <div
                  key={source.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none cloud-pos-${source.id} ${isStealthMode ? 'opacity-0' : ''}`}
                >
                  <div
                    className={`bg-black/90 border-2 rounded-lg p-3 min-w-[140px] ${source.borderClass}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className={`w-5 h-5 ${source.colorClass}`} />
                      <div className="font-bold text-white text-sm">{source.name}</div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Files:</span>
                        <span className="text-white font-mono">{syncStats[source.id].totalFiles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Synced:</span>
                        <span className={`font-mono ${source.colorClass}`}>
                          {syncStats[source.id].synced}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Speed:</span>
                        <span className="text-cyan-400 font-mono">{syncStats[source.id].filesPerSec}/s</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 w-full bg-white/10 rounded-full h-1 overflow-hidden">

                      <div
                        className={`h-1 rounded-full transition-all ${source.bgClass} cloud-prog-${source.id}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hippocampus Label */}

            <div
              className={`absolute transform -translate-x-1/2 pointer-events-none hippo-pos ${isStealthMode ? 'opacity-0' : ''}`}
            >
              <div className="bg-black/90 border-2 border-cyan-500 rounded-lg p-4 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-6 h-6 text-cyan-400" />
                  <div className="font-bold text-white">Hippocampus Core</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Stored:</span>
                    <span className="text-cyan-400 font-mono">{syncedFiles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Capacity:</span>
                    <span className="text-green-400 font-mono">2.4TB / 5TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Write Speed:</span>
                    <span className="text-yellow-400 font-mono">89 MB/s</span>
                  </div>
                </div>
                {/* Energy indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-mono">ACTIVE INGESTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cloudSources.map((source) => {
            const stats = syncStats[source.id];
            if (!stats) return null;
            const progress = Math.round((stats.synced / stats.totalFiles) * 100);

            return (
              <div
                key={source.id}
                className={`border-2 rounded-lg p-4 ${source.borderClass} ${isStealthMode ? 'bg-black' : 'bg-black/40 backdrop-blur-sm'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cloud className={`w-5 h-5 ${source.colorClass}`} />
                    <h3 className="font-bold text-white text-sm">{source.name}</h3>
                  </div>
                  {stats.active && (
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Sync Status</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">

                  <div
                    className={`h-full transition-all duration-500 ${source.bgClass} cloud-prog-${source.id}`}
                  />
                </div>

                <div className="space-y-1 text-xs mt-4">
                  <div className="flex justify-between text-white/60">
                    <span>Synced:</span>
                    <span className="font-mono">{stats.synced} / {stats.totalFiles}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Throughput:</span>
                    <span className="font-mono text-cyan-400">{stats.filesPerSec} files/s</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>ETA:</span>
                    <span className="font-mono text-green-400">
                      {stats.synced >= stats.totalFiles
                        ? 'Complete'
                        : `${Math.ceil((stats.totalFiles - stats.synced) / stats.filesPerSec)}s`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
