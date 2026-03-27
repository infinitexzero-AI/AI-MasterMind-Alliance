import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function UnifiedTaxonomyHUD() {
  const [agentStatus, setAgentStatus] = useState({
    scholar: 'Offline',
    pubmed: 'Offline',
    anki: 'Offline'
  });

  // Polling Port 5012 and local PM2 Daemons
  useEffect(() => {
    const pollAgents = setInterval(() => {
      // Mock Data Updates for Phase 3 Taxonomy Mapping
      setAgentStatus({
        scholar: 'Awaiting Prompt',
        pubmed: 'Scanning arXiv',
        anki: 'Syncing Decks'
      });
    }, 5000);
    return () => clearInterval(pollAgents);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      
      {/* Pillar V: Executive Operations (Thesis / Scholar) */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-blue-400">Thesis Synthesizer (Local Ollama)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-2">Pillar: The Scholar Pipeline</p>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${agentStatus.scholar === 'Offline' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-slate-200">{agentStatus.scholar}</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-md border border-blue-500/30 w-full hover:bg-blue-600/40 transition">
            Trigger Document Synthesis
          </button>
        </CardContent>
      </Card>

      {/* Pillar V: Medical / Scraper */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-teal-400">PubMed/arXiv Scraper</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-2">Pillar: The Scholar Pipeline</p>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${agentStatus.pubmed === 'Offline' ? 'bg-red-500' : 'bg-teal-500 animate-pulse'}`} />
            <span className="text-slate-200">{agentStatus.pubmed}</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-teal-600/20 text-teal-400 rounded-md border border-teal-500/30 w-full hover:bg-teal-600/40 transition">
            Force Academic Ingest
          </button>
        </CardContent>
      </Card>

      {/* Pillar V: Active Recall / Anki */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-purple-400">Anki Medical Forge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-2">Pillar: Active Recall Optimization</p>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${agentStatus.anki === 'Offline' ? 'bg-red-500' : 'bg-purple-500 animate-pulse'}`} />
            <span className="text-slate-200">{agentStatus.anki}</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-md border border-purple-500/30 w-full hover:bg-purple-600/40 transition">
            Generate Flashcard Deck
          </button>
        </CardContent>
      </Card>

    </div>
  );
}
