import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cortexAPI } from '../services/cortexAPI';

export const AgentChat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m Cortex. How can I assist you today?', timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await cortexAPI.sendMessage(input);
            const agentMessage = {
                role: 'assistant',
                content: response.response,
                timestamp: response.timestamp
            };
            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="glass-panel rounded-2xl p-0 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-orbitron tracking-widest">AGENT CHAT</span>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0a10]"
            >
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user'
                                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100'
                                        : 'bg-purple-500/10 border border-purple-500/20 text-purple-100'
                                    }`}
                            >
                                <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                                <span className="text-[10px] text-slate-600 mt-1 block">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/10 focus-within:border-purple-500/50 focus-within:shadow-[0_0_15px_rgba(188,19,254,0.1)] transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Cortex anything..."
                        className="bg-transparent border-none outline-none text-white flex-1 font-mono text-sm placeholder:text-slate-600"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="text-slate-500 hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
