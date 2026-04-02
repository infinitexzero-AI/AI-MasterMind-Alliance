import React, { useEffect, useState } from 'react';
import { TaskClassification } from '../types/DashboardInterfaces';
import { AgentMonitor } from './AgentMonitor';
import { OrchestrationPanel } from './OrchestrationPanel';
import { TelemetryCharts } from './TelemetryCharts';
import { ScholarTracker } from './widgets/ScholarTracker';
import { Activity } from 'lucide-react';
import { useNeuralSync } from './NeuralSyncProvider';

const SystemHUDBase: React.FC = () => {
    const { agents: globalAgents, logs: globalLogs, isConnected, sendMessage } = useNeuralSync();

    // 2. Orchestration Data (Local to this view for now)
    const [currentIntent, setCurrentIntent] = useState<string>("");
    const [taskType, setTaskType] = useState<TaskClassification | undefined>(undefined);
    const [activeStep, setActiveStep] = useState<'ROUTER' | 'DISPATCH' | 'EXECUTE' | 'VERIFY' | 'COMPLETE'>('ROUTER');
    const [traceLog, setTraceLog] = useState<string[]>([]);

    // 3. Telemetry Data
    const [fps] = useState(60);
    const [latency] = useState(45);
    const [totalCost, setTotalCost] = useState(0.0000);
    const [budget] = useState(5.00);

    // Message Router (still needed for Cortex-specific orchestration state)
    useEffect(() => {
        const lastLog = globalLogs[globalLogs.length - 1];
        if (!lastLog || !lastLog.payload) return;

        const msg = lastLog.payload;

        switch (msg.type) {
            case 'INTENT_ROUTER':
                if (msg.status === 'CLASSIFIED') {
                    setCurrentIntent("Processing Task...");
                    if (msg.payload.includes("DESKTOP")) setTaskType('TYPE_B_DESKTOP');
                    else if (msg.payload.includes("BROWSER")) setTaskType('TYPE_A_BROWSER');
                    setActiveStep('DISPATCH');
                    addToTrace(`Router classified intent: ${msg.payload}`);
                }
                break;
            case 'COST_UPDATE':
                setTotalCost(prev => prev + (msg.cost || 0));
                break;
            case 'AGENT_UPDATE': {
                const { thought, agent } = msg.payload;
                const source = agent ? `[${agent.toUpperCase()}]` : '[AGENT]';
                if (thought) addToTrace(`${source} ${thought}`);
                break;
            }
            default:
                break;
        }
    }, [globalLogs]);

    const addToTrace = (msg: string) => {
        setTraceLog(prev => [...prev.slice(-4), msg]);
    };

    // Dispatch Handler (From Orchestration Panel)
    const handleDispatch = (command: string) => {
        sendMessage('PROCESS_TASK', {
            prompt: command,
            source: 'DASHBOARD_UI'
        });

        addToTrace(`User initiated task: ${command}`);

        // Optimistic UI Update
        setCurrentIntent(command);
        setActiveStep('ROUTER');
    };

    // --- RENDER (12-Column Grid) ---
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="mb-4 flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/50">
                        <Activity className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">AILCC CORTEX <span className="text-indigo-500">V3</span></h1>
                        <div className="text-xs text-slate-400 font-mono flex gap-2">
                            <span>PHASE 3 EXECUTION</span>
                            <span className="text-slate-700">|</span>
                            <span className={`flex items-center gap-2 ${isConnected ? 'text-emerald-400' : 'text-amber-500'}`}>
                                CORPUS CALLOSUM:
                                <span className={isConnected ? "animate-pulse font-bold" : "animate-bounce"}>
                                    {isConnected ? 'LINKED' : 'SEEKING...'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout from Manifest */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-140px)]">

                {/* ZONE 1: Scholar Tracker (Moved to top for visibility) */}
                <div className="md:col-span-3 md:row-span-2 h-[400px] md:h-auto">
                    <ScholarTracker />
                </div>

                {/* ZONE 2: Orchestration Panel (6 Cols) */}
                <div className="md:col-span-6 md:row-span-2 h-[400px] md:h-auto">
                    <OrchestrationPanel
                        currentIntent={currentIntent}
                        classification={taskType as TaskClassification}
                        activeStep={activeStep}
                        traceLog={traceLog}
                        onDispatch={handleDispatch}
                    />
                </div>

                {/* ZONE 3: Telemetry Charts (3 Cols, 1 Row) */}
                <div className="md:col-span-3 md:row-span-1 h-[200px] md:h-auto">
                    <TelemetryCharts
                        fps={fps}
                        latencyMs={latency}
                        totalCost={totalCost}
                        dailyBudget={budget}
                        gateStatus={{
                            research: true,
                            analysis: true,
                            codegen: true,
                            deploy: isConnected
                        }}
                    />
                </div>

                {/* ZONE 4: Agent Monitor (Moved to bottom) */}
                <div className="md:col-span-3 md:row-span-1 h-[200px] md:h-auto md:col-start-10 md:row-start-2">
                    <AgentMonitor
                        agents={globalAgents}
                        onAgentSelect={(_id) => { /* TODO: open agent detail */ }}
                        networkStatus={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    />
                </div>

            </div>
        </div>
    );
};

export const SystemHUD = React.memo(SystemHUDBase);
SystemHUD.displayName = 'SystemHUD';
