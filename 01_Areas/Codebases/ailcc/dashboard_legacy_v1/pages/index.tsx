import NexusLayout from '../components/NexusLayout';
import AgentPanel from '../components/AgentPanel';
import TaskQueue from '../components/TaskQueue';
import LogsTimeline from '../components/LogsTimeline';
import ControlCenter from '../components/ControlCenter';
import KnowledgeBase from '../components/KnowledgeBase';
import ImprovementTracker from '../components/ImprovementTracker';
import CodeGenerationPanel from '../components/unified/panels/CodeGenerationPanel';

export default function Page() {
  return (
    <NexusLayout>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
          {/* LEFT: Operational View */}
          <div className="col-span-1 xl:col-span-2 flex flex-col gap-6">
            <div className="flex-none">
                <AgentPanel />
            </div>
            <div className="flex-1 overflow-hidden">
               <TaskQueue />
            </div>
          </div>
          
          {/* CENTER: Timeline */}
          <div className="col-span-1 xl:col-span-1 h-full overflow-hidden">
            <LogsTimeline />
          </div>
          
          {/* RIGHT: Admin Stack */}
          <div className="col-span-1 xl:col-span-1 flex flex-col gap-4 h-full overflow-y-auto pr-1">
            <div className="flex-none">
                <ControlCenter />
            </div>
            <div className="flex-none">
                <CodeGenerationPanel />
            </div>
            <div className="flex-none">
                <KnowledgeBase />
            </div>
            <div className="flex-none">
                <ImprovementTracker />
            </div>
          </div>
        </div>
    </NexusLayout>
  );
}
