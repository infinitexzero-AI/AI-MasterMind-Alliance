import React, { useState } from 'react';
import { Search, Database, GraduationCap } from 'lucide-react';

export const VaultSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        const res = await fetch(`/api/vault/vault_proxy?action=search&q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
        setLoading(false);
    };


    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Vault & Academic Papers..."
                    className="w-full h-12 glass-layer-2 border border-white/10 rounded-xl px-12 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
            </form>

            <div className="h-80 w-full overflow-y-auto custom-scrollbar pr-2">
                {results.length > 0 ? (
                    <div className="space-y-2">
                        {results.map((res, i) => (
                            <div key={i} className="glass-card mb-2 p-3 group overflow-hidden">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        {res.metadata?.type === 'academic_paper' ? <GraduationCap size={12} className="text-purple-400" /> : <Database size={12} className="text-cyan-400" />}
                                        <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[180px]">{res.metadata?.title || res.metadata?.source || res.id}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-400">DIST: {res.distance?.toFixed(3)}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-2">
                                    {res.document ? res.document.substring(0, 150) + '...' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && query && (
                        <div className="text-center py-4 text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                            No semantic matches found
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

