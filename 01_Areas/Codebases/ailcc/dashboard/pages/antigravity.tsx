import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import { OrchestrationPanel } from '../components/OrchestrationPanel';
import SystemGraph from '../components/SystemGraph';
import { StrategicAdvisory } from '../components/StrategicAdvisory';
import { SwarmHeartbeat } from '../components/SwarmHeartbeat';
import { TerminalStream } from '../components/TerminalStream';
import { TaskClassification, Agent } from '../types/DashboardInterfaces';

type WsMessage =
  | { type: 'INTENT_ROUTER'; status?: string; payload: string; id?: string; timestamp?: string }
  | { type: 'PROCESS_TASK'; status?: string; payload: { prompt: string }; id?: string; timestamp?: string }
  | { type: 'AGENT_ROSTER'; status?: string; payload: Agent[]; id?: string; timestamp?: string }
  | { type: 'TERMINAL_SIGNAL'; status?: string; payload: { message: string; type?: 'OUT' | 'CMD' | 'ERR' }; id?: string; timestamp?: string };

import HealthPanel from '../components/HealthPanel';

export default function AntigravityPage() {
  // --- STATE (Ported from SystemHUD) ---
  const [isConnected, setIsConnected] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<string>("");
  const [taskType, setTaskType] = useState<TaskClassification | undefined>(undefined);
  const [activeStep, setActiveStep] = useState<'ROUTER' | 'DISPATCH' | 'EXECUTE' | 'VERIFY' | 'COMPLETE'>('ROUTER');
  const [traceLog, setTraceLog] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<{ id: string; timestamp: string; message: string; type: 'OUT' | 'CMD' | 'ERR' }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // --- WEBSOCKET HANDLER ---
  useEffect(() => {
    const connect = () => {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const ws = new WebSocket(`ws://${host}:5005`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (err) {
          console.error('Parse Error', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  const handleMessage = (msg: WsMessage) => {
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
      case 'PROCESS_TASK':
        setCurrentIntent(msg.payload.prompt);
        setActiveStep('ROUTER');
        break;
      case 'AGENT_ROSTER':
        setAgents(msg.payload);
        break;
      case 'TERMINAL_SIGNAL':
        setTerminalLogs(prev => [...prev.slice(-100), {
          id: msg.id || Math.random().toString(),
          timestamp: msg.timestamp || new Date().toISOString(),
          message: msg.payload.message,
          type: msg.payload.type || 'OUT'
        }]);
        break;
    }
  };

  const addToTrace = (msg: string) => {
    setTraceLog(prev => [...prev.slice(-4), msg]);
  };

  const handleDispatch = (command: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload = { type: 'PROCESS_TASK', payload: { prompt: command, source: 'ANTIGRAVITY_UI' } };
    wsRef.current.send(JSON.stringify(payload));
    addToTrace(`User initiated task: ${command}`);
    setCurrentIntent(command);
    setActiveStep('ROUTER');
  };

  return (
    <NexusLayout>
      <Head>
        <title>Antigravity | Command Center</title>
      </Head>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)] p-2">

        {/* CENTER: Orchestration (The Brain) */}
        <div className="col-span-1 xl:col-span-8 h-full renaissance-panel overflow-hidden relative flex flex-col p-4">
          <div className="absolute top-2 right-2 text-xs text-emerald-400 font-mono opacity-50 z-10 flex gap-2">
            <span>MODULE: ORCHESTRATION</span>
            <span className={isConnected ? "text-emerald-400" : "text-red-400"}>{isConnected ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <OrchestrationPanel
            currentIntent={currentIntent}
            classification={taskType || 'TYPE_B_DESKTOP'}
            activeStep={activeStep}
            traceLog={traceLog}
            onDispatch={handleDispatch}
          />
        </div>

        {/* RIGHT: Physics/Graph + Intel */}
        <div className="col-span-1 xl:col-span-4 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="h-[300px] flex-shrink-0 renaissance-panel p-4">
            <div className="font-mono text-xs text-purple-400 mb-2 opacity-75">MODULE: GOD MODE</div>
            <SystemGraph />
          </div>

          {/* Health Panel (Option B) */}
          <div className="flex-shrink-0 h-[250px]">
            <HealthPanel />
          </div>

          <SwarmHeartbeat agents={agents} />

          <StrategicAdvisory />

          <TerminalStream logs={terminalLogs} />
        </div>

      </div>
    </NexusLayout>
  );
}
