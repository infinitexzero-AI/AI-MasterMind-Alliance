import React from 'react';
import AgentControlPanel from '../components/AgentControlPanel';
import AgentGrid from '../components/AgentGrid';
import PipelineView from '../components/PipelineView';

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Alignment Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <AgentGrid />
          <PipelineView />
        </div>
        <div>
          <AgentControlPanel />
        </div>
      </div>
    </div>
  );
}
