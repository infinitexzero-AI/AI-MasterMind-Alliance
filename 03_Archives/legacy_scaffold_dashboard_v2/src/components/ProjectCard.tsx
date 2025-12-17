export default function ProjectCard({ project }: { project: any }) {
  return (
    <div className="glass-card group cursor-pointer relative overflow-hidden rounded-xl bg-matrix-black border border-white/5 hover:border-cyber-blue/30 transition-all duration-300">
      <div className="relative p-6 z-10">
        {/* Holographic corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-purple/20 to-transparent blur-2xl opacity-50" />
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="holographic text-2xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyber-blue to-electric-purple">
            {project.name}
          </h3>
          <div className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_10px_#39ff14]"></div>
        </div>
        
        <p className="text-gray-400 font-sans text-sm mb-6 leading-relaxed border-l-2 border-cyber-blue/20 pl-3">
          {project.description}
        </p>
        
        {/* Agent badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.agents.map((agent: string) => (
            <span 
              key={agent}
              className="px-3 py-1 bg-cyber-blue/5 border border-cyber-blue/20 rounded-full font-mono text-[10px] text-cyber-blue tracking-wider uppercase backdrop-blur-sm"
            >
              @{agent}
            </span>
          ))}
        </div>
        
        {/* Status footer */}
        <div className="flex items-center justify-between text-xs font-mono text-gray-500 bg-terminal-dark/30 p-2 rounded border border-white/5">
          <span>LAST SYNC</span>
          <span className="text-holographic-cyan drop-shadow-[0_0_5px_rgba(0,255,245,0.3)]">
            {project.lastUpdated || "UNKNOWN"}
          </span>
        </div>
      </div>
      
      {/* Hover glow effect - subtle matrix rain implication */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
