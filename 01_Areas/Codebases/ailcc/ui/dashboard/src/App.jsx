
import { useState, useEffect, useRef, StrictMode } from 'react';
import { Activity, Terminal, Send, Cpu, Globe, Shield,
LayoutDashboard, Settings, ExternalLink, Zap,
AlertTriangle, CheckCircle, Info, Menu, X, MessageSquare, BarChart3, Users, CheckSquare, Heart, Atom
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import clsx from 'clsx';
import './index.css';
import { createRoot } from 'react-dom/client';

// Import New Components
import { ActivityTimeline } from './components/ActivityTimeline';
import { AgentChat } from './components/AgentChat';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AgentRegistry } from './components/AgentRegistry';
import { AgentActionPanel } from './components/AgentActionPanel';
import { LinearTasks } from './components/LinearTasks';
import { AntiGravityCanvas } from './components/AntiGravityCanvas';



// --- MOCK DATA FOR CHARTS ---
const generateMockData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
        time: i,
        cpu: 40 + Math.random() * 30,
        mem: 60 + Math.random() * 20,
        net: 20 + Math.random() * 50
    }));
};

// --- SHARED COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={clsx(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group",
            active ? "bg-white/10 text-cyan-400 border-r-2 border-cyan-400" : "text-slate-500 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon className={clsx("w-5 h-5", active && "drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]")} />
        <span className="font-orbitron text-sm tracking-widest hidden md:block">{label}</span>
        {active && <motion.div layoutId="sidebar-glow" className="absolute inset-0 bg-cyan-400/5 rounded-lg -z-10" />}
    </Link>
);

const PanelHeader = ({ title, icon: Icon, color, link }) => (
    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <h2 className={clsx("text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest", color)}>
            <Icon className="w-4 h-4" /> {title}
        </h2>
        {link && (
            <Link
                to={link}
                target="_blank"
                className="text-slate-600 hover:text-cyan-400 transition-colors"
                title="Pop-out Window"
            >
                <ExternalLink className="w-4 h-4" />
            </Link>
        )}
    </div>
);

// --- FEATURE PANELS ---

const VitalsPanel = ({ status, standalone = false }) => {
    const [data, setData] = useState(generateMockData());

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => [...prev.slice(1), {
                time: prev[prev.length - 1].time + 1,
                cpu: 40 + Math.random() * 30,
                mem: 60 + Math.random() * 20,
                net: 20 + Math.random() * 50
            }]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={clsx("glass-panel p-6 rounded-2xl flex flex-col gap-6", standalone ? "h-screen" : "h-full")}>
            <PanelHeader title="SYSTEM VITALS" icon={Activity} color="text-cyan-400" link={!standalone ? "/vitals" : null} />

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">CORE STATUS</div>
                    <div className={clsx("text-xl font-bold font-orbitron", status?.system_status === "ONLINE" ? "text-green-400 glow-text-green" : "text-red-500")}>
                        {status?.system_status || "OFFLINE"}
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">ACTIVE AGENTS</div>
                    <div className="text-xl font-bold text-purple-400 font-orbitron glow-text-purple">
                        {status?.active_agents || "0"}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="flex-1 min-h-[200px] flex flex-col gap-4">
                <div className="flex-1 bg-black/20 rounded-xl p-2 border border-white/5 relative">
                    <div className="absolute top-2 left-2 text-[10px] text-cyan-500 font-mono">CPU LOAD</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <YAxis hide domain={[0, 100]} />
                            <Area type="monotone" dataKey="cpu" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex-1 bg-black/20 rounded-xl p-2 border border-white/5 relative">
                    <div className="absolute top-2 left-2 text-[10px] text-purple-500 font-mono">MEMORY USAGE</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <YAxis hide domain={[0, 100]} />
                            <Area type="monotone" dataKey="mem" stroke="#bc13fe" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ConsolePanel = ({ consoleLog, cmdInput, setCmdInput, handleCommand, isNavigating, scrollRef, standalone = false }) => (
    <div className={clsx("glass-panel rounded-2xl p-0 flex flex-col overflow-hidden", standalone ? "h-screen" : "h-full min-h-[500px]")}>
        {/* Terminal Header */}
        <div className="bg-white/5 px-4 py-2 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">CORTEX_TERMINAL_V3</span>
            </div>
            {!standalone && (
                <Link to="/console" target="_blank" className="text-slate-600 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                </Link>
            )}
        </div>

        {/* Terminal Output */}
        <div className="flex-1 bg-[#0a0a10] p-4 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin" ref={scrollRef}>
            {consoleLog.map((log, i) => {
                const isError = log.includes("ERROR");
                const isExec = log.includes("EXEC:");
                const isSystem = log.includes("System") || log.includes("Connecting");

                return (
                    <div key={i} className="flex gap-3 hover:bg-white/5 px-2 rounded transition-colors">
                        <span className="text-slate-600 text-xs min-w-[60px] select-none">
                            {new Date().toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span className={clsx(
                            "break-all",
                            isError && "text-red-400",
                            isExec && "text-yellow-400",
                            isSystem && "text-cyan-600",
                            !isError && !isExec && !isSystem && "text-slate-300"
                        )}>
                            {isExec ? <span className="text-purple-400 mr-2">➜</span> : null}
                            {log}
                        </span>
                    </div>
                );
            })}
            {isNavigating && (
                <div className="flex gap-3 px-2 animate-pulse">
                    <span className="text-slate-600 text-xs min-w-[60px]">...</span>
                    <span className="text-cyan-400">Processing neural request...</span>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/5">
            <form onSubmit={handleCommand} className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/10 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all">
                <span className="text-cyan-500 font-bold">❯</span>
                <input
                    type="text"
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    placeholder="Enter command..."
                    className="bg-transparent border-none outline-none text-white flex-1 font-mono text-sm placeholder:text-slate-600"
                    autoFocus={standalone}
                />
                <button type="submit" className="text-slate-500 hover:text-cyan-400 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    </div>
);

const IntelPanel = ({ status, standalone = false }) => (
    <div className={clsx("glass-panel rounded-2xl p-6 flex flex-col", standalone ? "h-screen" : "h-full")}>
        <PanelHeader title="INTEL FEED" icon={Globe} color="text-yellow-400" link={!standalone ? "/intel" : null} />

        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            <AnimatePresence mode='popLayout'>
                {status?.intel_feed?.map((item, i) => {
                    const isEscalated = item.action === 'ESCALATED';
                    const isError = item.action === 'ERROR';

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={clsx(
                                "p-4 rounded-xl border transition-all cursor-default group relative overflow-hidden",
                                isEscalated ? "bg-red-500/10 border-red-500/30" :
                                    isError ? "bg-orange-500/10 border-orange-500/30" :
                                        "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            {isEscalated && <div className="absolute top-0 right-0 p-1"><AlertTriangle className="w-3 h-3 text-red-500" /></div>}

                            <div className="flex justify-between items-center mb-2">
                                <span className={clsx(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full font-orbitron tracking-wider",
                                    isEscalated ? "bg-red-500/20 text-red-400" :
                                        isError ? "bg-orange-500/20 text-orange-400" :
                                            "bg-cyan-500/10 text-cyan-400"
                                )}>
                                    {item.action}
                                </span>
                                <span className="text-[10px] text-slate-600 font-mono">{item.time}</span>
                            </div>
                            <div className="text-xs text-slate-300 leading-relaxed font-mono">
                                {item.detail}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            {(!status?.intel_feed || status.intel_feed.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                    <Globe className="w-8 h-8 opacity-20" />
                    <span className="text-xs font-mono">NO INTEL DETECTED</span>
                </div>
            )}
        </div>
    </div>
);

// --- MAIN LAYOUT ---

const MainLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="flex h-screen w-full bg-[#030308] text-white overflow-hidden relative">
            <div className="scanline" />

            {/* SIDEBAR */}
            <div className="w-20 md:w-64 flex-shrink-0 border-r border-white/5 bg-[#050510]/80 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                        <Cpu className="text-white w-5 h-5" />
                    </div>
                    <span className="font-orbitron font-bold text-lg tracking-tighter hidden md:block">
                        CORTEX<span className="text-cyan-400">.OS</span>
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="DASHBOARD" path="/" active={location.pathname === '/'} />
                    <SidebarItem icon={Activity} label="ACTIVITY" path="/activity" active={location.pathname === '/activity'} />
                    <SidebarItem icon={Heart} label="HEALTH" path="/health" active={location.pathname === '/health'} />
                    <SidebarItem icon={Users} label="AGENTS" path="/agents" active={location.pathname === '/agents'} />
                    <SidebarItem icon={CheckSquare} label="TASKS" path="/tasks" active={location.pathname === '/tasks'} />
                    <SidebarItem icon={MessageSquare} label="CHAT" path="/chat" active={location.pathname === '/chat'} />
                    <SidebarItem icon={BarChart3} label="ANALYTICS" path="/analytics" active={location.pathname === '/analytics'} />
                    <SidebarItem icon={Terminal} label="CONSOLE" path="/console" active={location.pathname === '/console'} />
                    <SidebarItem icon={Cpu} label="VITALS" path="/vitals" active={location.pathname === '/vitals'} />
                    <SidebarItem icon={Globe} label="INTEL" path="/intel" active={location.pathname === '/intel'} />
                    <SidebarItem icon={Zap} label="ACTIONS" path="/actions" active={location.pathname === '/actions'} />
                    <SidebarItem icon={Atom} label="GRAVITY" path="/antigravity" active={location.pathname === '/antigravity'} />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors cursor-pointer">
                        <Settings className="w-5 h-5" />
                        <span className="font-orbitron text-xs tracking-widest hidden md:block">SETTINGS</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm">
                    <div className="text-xs font-mono text-slate-500 tracking-[0.2em]">
                        AI MASTERMIND COMMAND HUB // v3.0
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-green-400 font-orbitron">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

const DashboardView = ({ status, consoleLog, cmdInput, setCmdInput, handleCommand, isNavigating, scrollRef }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Column: Activity Timeline */}
        <div className="lg:col-span-4 h-full">
            <ActivityTimeline limit={20} />
        </div>

        {/* Center Column: Agent Chat */}
        <div className="lg:col-span-5 h-full">
            <AgentChat />
        </div>

        {/* Right Column: Quick Analytics + Vitals + Notifications */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <AnalyticsDashboard />
            </div>
            {/* <div>
                <NotificationSettings />
            </div> */}
        </div>
    </div>
);

// --- APP CONTAINER ---

function App() {
    const [status, setStatus] = useState(null);
    const [cmdInput, setCmdInput] = useState("");
    const [consoleLog, setConsoleLog] = useState(["System initialized...", "Connecting to Cortex..."]);
    const [isNavigating, setIsNavigating] = useState(false);
    const scrollRef = useRef(null);

    // Poll Cortex Status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/cortex_status.json');
                const data = await res.json();
                setStatus(data);
            } catch (e) {
                // Silent fail
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll console
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [consoleLog]);

    // Handle Command
    const handleCommand = async (e) => {
        e.preventDefault();
        if (!cmdInput.trim()) return;

        const cmd = cmdInput;
        setCmdInput("");
        setConsoleLog(prev => [...prev, `EXEC: ${cmd}`]);
        setIsNavigating(true);

        try {
            const res = await fetch('http://localhost:8000/navigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'BROWSE', target: 'USER_CMD', payload: cmd })
            });

            if (res.ok) {
                setConsoleLog(prev => [...prev, ">> Command sent to Navigator."]);
            } else {
                setConsoleLog(prev => [...prev, ">> ERROR: Cortex refused connection."]);
            }
        } catch (err) {
            setConsoleLog(prev => [...prev, `>> ERROR: ${err.message}`]);
        }

        setTimeout(() => setIsNavigating(false), 2000);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <MainLayout>
                        <DashboardView
                            status={status}
                            consoleLog={consoleLog}
                            cmdInput={cmdInput}
                            setCmdInput={setCmdInput}
                            handleCommand={handleCommand}
                            isNavigating={isNavigating}
                            scrollRef={scrollRef}
                        />
                    </MainLayout>
                } />
                <Route path="/activity" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <ActivityTimeline limit={50} />
                    </div>
                } />
                <Route path="/chat" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <AgentChat />
                    </div>
                } />
                <Route path="/agents" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <AgentRegistry />
                    </div>
                } />
                <Route path="/tasks" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <LinearTasks />
                    </div>
                } />
                <Route path="/analytics" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <AnalyticsDashboard />
                    </div>
                } />
                <Route path="/vitals" element={<div className="bg-[#030308] min-h-screen p-4"><VitalsPanel status={status} standalone={true} /></div>} />
                <Route path="/console" element={
                    <div className="bg-[#030308] min-h-screen p-4">
                        <ConsolePanel
                            consoleLog={consoleLog}
                            cmdInput={cmdInput}
                            setCmdInput={setCmdInput}
                            handleCommand={handleCommand}
                            isNavigating={isNavigating}
                            scrollRef={scrollRef}
                            standalone={true}
                        />
                    </div>
                } />
                <Route path="/intel" element={<div className="bg-[#030308] min-h-screen p-4"><IntelPanel status={status} standalone={true} /></div>} />
                <Route path="/actions" element={<AgentActionPanel />} />
                <Route path="/health" element={
                    <MainLayout>
                    </MainLayout>
                } />
                <Route path="/antigravity" element={
                    <MainLayout>
                        <AntiGravityCanvas />
                    </MainLayout>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;



