/**
 * Matrix Metaverse Design System - Tailwind Extension
 * Copy this 'extend' block into your tailwind.config.ts
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        'void-black': '#0a0a0f',
        'matrix-black': '#0d0d12',
        'terminal-dark': '#1a1a24',
        'charcoal': '#2a2a3a',
        'cyber-blue': '#00d9ff',
        'electric-purple': '#b24bf3',
        'neon-green': '#39ff14',
        'hot-magenta': '#ff006e',
        'holographic-cyan': '#00fff5',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(178, 75, 243, 0.5)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(20deg)' },
        }
      }
    },
  },
}
