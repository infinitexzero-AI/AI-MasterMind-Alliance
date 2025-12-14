'use client'
/* eslint-disable react-dom/no-unsafe-inline-style */
import { useEffect, useState } from 'react'

export default function StorageHealthWidget() {
  const [health, setHealth] = useState<{ status: string; free_gb: number; free_pct: number; thresholds: { yellow_pct: number } } | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(err => console.error("Failed to fetch health:", err))
  }, [])

  if (!health) return <div className="glass-card p-6 text-cyber-blue font-mono animate-pulse">Initializing Interface...</div>

  const statusColors: Record<string, { color: string; glow: string }> = {
    GREEN: { color: '#39ff14', glow: '0 0 20px #39ff14' },
    YELLOW: { color: '#ffdd00', glow: '0 0 20px #ffdd00' },
    RED: { color: '#ff006e', glow: '0 0 20px #ff006e' }
  }

  const statusKey = health.status as keyof typeof statusColors
  const { color, glow } = statusColors[statusKey] || { color: '#00d9ff', glow: '0 0 20px #00d9ff' }

  // Dynamic CSS variables for Matrix effects
  // eslint-disable-next-line react-dom/no-unsafe-inline-style
  const dynamicStyle = {
    '--status-color': color,
    '--status-glow': glow,
    '--progress-pct': `${health.free_pct}%`,
    '--gradient-start': color,
    '--gradient-end': '#39ff14'
  } as React.CSSProperties

  return (
    <div
      className="glass-card scanlines p-6 relative overflow-hidden bg-void-black border border-cyber-blue/20 rounded-xl group hover:border-cyber-blue/50 transition-colors duration-500"
      // eslint-disable-next-line react-dom/no-unsafe-inline-style
      style={dynamicStyle}
    >
      {/* Scanline Overlay via CSS class 'scanlines' */}

      <div className="terminal-header flex items-center gap-2 mb-3 pb-2 border-b border-cyber-blue/20">
        <div className="w-3 h-3 rounded-full bg-[var(--status-color)] shadow-[var(--status-glow)]" />
        <span className="font-display text-cyber-blue tracking-widest text-sm uppercase">SYSTEM STORAGE</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="holographic text-4xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[var(--status-color)] to-electric-purple">
          {health.status}
        </span>
        <span className="font-mono text-cyber-blue text-2xl shadow-neon-blue">
          {health.free_gb} GB
        </span>
      </div>

      <div className="space-y-3 font-mono text-sm text-gray-400">
        <div className="flex justify-between items-center bg-terminal-dark/50 p-2 rounded">
          <span>FREE SPACE</span>
          <span className="font-bold text-[var(--status-color)]">{health.free_pct}%</span>
        </div>
        <div className="flex justify-between items-center bg-terminal-dark/50 p-2 rounded">
          <span>THRESHOLD</span>
          <span className="text-cyber-blue font-bold">{health.thresholds?.yellow_pct || 20}%</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-6 h-2 bg-terminal-dark rounded-full overflow-hidden relative">
        <div
          className="h-full transition-all duration-1000 ease-out w-[var(--progress-pct)] bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] shadow-[var(--status-glow)]"
        />
        {/* Animated sheen on bar */}
        <div className="absolute inset-0 bg-white/20 w-full animate-pulse-slow"></div>
      </div>
    </div>
  )
}
