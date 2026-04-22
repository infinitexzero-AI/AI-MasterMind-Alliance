import { Monitor, Laptop, Gamepad2, Signal, Clock, Server, Terminal, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAllianceData } from '../hooks/useAllianceData';

export const VanguardPanel: React.FC = () => {
    const { stats } = useAllianceData();

    // Default metadata for known nodes
    const METADATA: Record<string, any> = {
        'ThinkPad27': { os: 'Windows 11 Pro', role: 'Compute Mule', icon: <Laptop className="w-4 h-4" /> },
        'XBOX': { os: 'Xbox OS', role: 'Strategic Wall', icon: <Gamepad2 className="w-4 h-4" /> }
    };

    const discoveredNodes = stats.vanguard.map((node: any) => ({
        name: node.node,
        os: node.os || METADATA[node.node]?.os || 'Unknown OS',
        role: node.role || METADATA[node.node]?.role || 'Remote Node',
        status: node.status,
        sync: typeof stats.onedriveSync !== 'undefined' ? `${stats.onedriveSync}%` : 'Waiting...',
        icon: METADATA[node.node]?.icon || <Monitor className="w-4 h-4" />
    }));

    const thinkpadFallback = { name: 'ThinkPad27', os: 'Windows 11 Pro', role: 'Compute Mule', status: 'offline', sync: typeof stats.onedriveSync !== 'undefined' ? `${stats.onedriveSync}%` : 'Offline', icon: <Laptop className="w-4 h-4" /> };
    const thinkpadNode = discoveredNodes.find((n: any) => n.name === 'ThinkPad27') || thinkpadFallback;

    const xboxNode = stats.xbox ? {
        name: 'SCARLETT',
        os: stats.xbox.device || 'Xbox OS',
        role: stats.xbox.title || 'Strategic Wall',
        status: stats.xbox.online ? 'online' : 'offline',
        sync: ' LIVE',
        icon: <Gamepad2 className="w-4 h-4" />
    } : {
        name: 'SCARLETT',
        os: 'Xbox OS',
        role: 'Strategic Wall',
        status: 'offline',
        sync: 'DISCONNECT',
        icon: <Gamepad2 className="w-4 h-4" />
    };

    const nodes = [thinkpadNode, xboxNode];

    const activeAgents = Object.values(stats.activeAgents || {});

    const handleKillAgent = async (pid: string) => {
        try {
            await fetch('http://localhost:5005/api/system/agents/kill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid })
            });
        } catch (e) {
            console.error('Failed to kill agent', e);
        }
    };

    return (
        <div className="renaissance-panel p-5 bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl border-l-4 border-l-blue-500/50 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Vanguard Hardware
                </h2>
                <div className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-blue-500" />
                    <span className="text-[8px] font-mono text-blue-500 uppercase tracking-widest">UCP-P Active</span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {nodes.map((node) => (
                    <motion.div
                        key={node.name}
                        whileHover={{ x: 5 }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 transition-all cursor-crosshair"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-400">{node.icon}</span>
                                <span className="text-[11px] font-bold text-white tracking-widest">{node.name}</span>
                            </div>
                            <span className={`text-[8px] font-mono px-1.5 rounded-full ${node.status === 'online' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                {node.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono mb-2">{node.role} • {node.os || 'Xbox OS'}</p>
                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                            <div className="flex items-center gap-1">
                                <Signal className="w-2.5 h-2.5" />
                                <span>SYNC: {node.sync}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>LIVE: ONEDRIVE</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Phase 33: Autonomous Sub-Agents Radar */}
            <div className="flex items-center justify-between mt-2 mb-3 pt-4 border-t border-white/10">
                <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Active Orchestrator Swarm
                </h2>
                <span className="text-[8px] font-mono text-emerald-500">{activeAgents.length} ENGAGED</span>
            </div>

            <div className="space-y-2">
                {activeAgents.length === 0 ? (
                    <div className="text-[9px] font-mono text-slate-500 italic px-2">No dynamic daemons spawned.</div>
                ) : (
                    activeAgents.map((agent: any) => {
                        // Find the PID by looking up the key in the original stats.activeAgents object, or pass it from the backend if available
                        const pid = Object.keys(stats.activeAgents || {}).find(key => stats.activeAgents[key].name === agent.name);
                        return (
                        <div key={agent.name} className="flex items-center justify-between p-2 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-emerald-300 font-bold">{agent.name}</span>
                                <span className="text-[8px] text-emerald-600 font-mono">PID: {pid} | {agent.status}</span>
                            </div>
                            <button 
                                onClick={() => pid && handleKillAgent(pid)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 bg-red-500/10 rounded"
                                title={`Kill ${agent.name}`}
                                aria-label={`Kill ${agent.name}`}
                            >
                                <XCircle className="w-3 h-3" />
                            </button>
                        </div>
                    )})
                )}
            </div>
        </div>
    );
};
