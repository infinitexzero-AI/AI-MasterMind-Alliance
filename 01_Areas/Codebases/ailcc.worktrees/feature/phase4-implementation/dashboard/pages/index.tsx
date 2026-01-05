import React from 'react';
import NexusLayout from '../components/NexusLayout';
import RuntimePanel from '../components/RuntimePanel';
import AgentControlPanel from '../components/AgentControlPanel';
import ArtifactTimeline from '../components/ArtifactTimeline';
import ImageGenerator from '../components/ImageGenerator';
import PipelineView from '../components/PipelineView';

export default function Page() {
  return (
    <NexusLayout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Telemetry & History */}
        <div className="xl:col-span-2 space-y-6">
          <RuntimePanel />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ArtifactTimeline />
             <ImageGenerator />
          </div>
        </div>

        {/* Right Column: Control & Pipeline */}
        <div className="space-y-6">
          <AgentControlPanel />
          <PipelineView />
        </div>

      </div>
    </NexusLayout>
  );
}
