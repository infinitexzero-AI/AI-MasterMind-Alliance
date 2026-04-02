import { useState, useEffect } from 'react';
import { MessageSquare, Search, Download, Trash2, Clock, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';

export const AgentChatHistory = () => {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadChatHistory();
        loadStats();
    }, [selectedAgent]);

    const loadChatHistory = async () => {
        setIsLoading(true);
        try {
            const result = await cortexAPI.getAllChat(100, 0, selectedAgent);
            setMessages(result.conversations || []);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await cortexAPI.getChatStats();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load chat stats:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadChatHistory();
            return;
        }

        try {
            const result = await cortexAPI.searchChat(searchQuery, selectedAgent);
            setMessages(result.results || []);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleExport = async (format = 'json') => {
        try {
            const blob = await cortexAPI.exportChat(selectedAgent, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_history_${selectedAgent || 'all'}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleDelete = async (agentId) => {
        if (!confirm(`Delete all chat history for ${agentId}?`)) return;

        try {
            await cortexAPI.deleteAgentChat(agentId);
            loadChatHistory();
            loadStats();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'user': return <User className="w-4 h-4" />;
            case 'assistant': return <Bot className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'user': return 'text-blue-400 bg-blue-500/10';
            case 'assistant': return 'text-green-400 bg-green-500/10';
            case 'system': return 'text-purple-400 bg-purple-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const agentList = stats?.agents ? Object.keys(stats.agents) : [];

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-cyan-400">
                        <MessageSquare className="w-4 h-4" /> CHAT HISTORY
                    </h2>
                    {stats && (
                        <div className="text-[10px] text-slate-500 font-mono">
                            {stats.total_messages} messages
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('json')}
                        className="px-2 py-1 text-[10px] rounded font-mono bg-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-1"
                        title="Export as JSON"
                    >
                        <Download className="w-3 h-3" />
                        JSON
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="px-2 py-1 text-[10px] rounded font-mono bg-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-1"
                        title="Export as CSV"
                    >
                        <Download className="w-3 h-3" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search messages..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
                <select
                    value={selectedAgent || ''}
                    onChange={(e) => setSelectedAgent(e.target.value || null)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                >
                    <option value="">All Agents</option>
                    {agentList.map(agent => (
                        <option key={agent} value={agent}>{agent}</option>
                    ))}
                </select>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">
                        Loading chat history...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-mono">NO CHAT HISTORY</span>
                        <span className="text-[10px] text-slate-700">
                            {searchQuery ? 'No results found' : 'No messages yet'}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx(
                                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                                getRoleColor(msg.role)
                                            )}>
                                                {getRoleIcon(msg.role)}
                                            </div>
                                            <div>
                                                <div className="text-xs font-mono text-white font-bold">
                                                    {msg.agent_id}
                                                </div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "px-2 py-1 text-[9px] rounded font-mono uppercase",
                                            getRoleColor(msg.role)
                                        )}>
                                            {msg.role}
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </div>
                                    {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/5">
                                            <div className="text-[10px] text-slate-600 font-mono">
                                                Metadata: {JSON.stringify(msg.metadata)}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {stats && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <div>
                        Total: {stats.total_messages} messages • {Object.keys(stats.agents || {}).length} agents
                    </div>
                    {stats.by_role && (
                        <div className="flex gap-3">
                            {Object.entries(stats.by_role).map(([role, count]) => (
                                <div key={role} className="flex items-center gap-1">
                                    {getRoleIcon(role)}
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
