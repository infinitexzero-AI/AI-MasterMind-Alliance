import React, { useState, useEffect } from 'react';
import { ClipboardItem } from '../lib/clipboard';

const ClipboardHistory: React.FC = () => {
    const [history, setHistory] = useState<ClipboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/clipboard/history');
            const result = await response.json();
            if (result.success) {
                setHistory(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch clipboard history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const copyToLocal = (content: string) => {
        navigator.clipboard.writeText(content);
        // Optional: show a toast or feedback
    };

    if (loading && history.length === 0) {
        return (
            <div className="p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📋</span> Clipboard Sync
                </h2>
                <button
                    onClick={fetchHistory}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="text-red-400 text-sm mb-4">
                    Error: {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {history.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 italic">
                        No items in history
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white/5 border border-white/5 hover:border-white/20 rounded-lg p-3 transition-all cursor-pointer relative"
                            onClick={() => copyToLocal(item.content)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.source === 'macbook' ? 'bg-blue-500/20 text-blue-400' :
                                        item.source === 'iphone' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-green-500/20 text-green-400'
                                    }`}>
                                    {item.source}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-200 line-clamp-3 break-all">
                                {item.content}
                            </p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-blue-400 text-xs font-bold">CLICK TO COPY</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClipboardHistory;
