import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

// Helper Class defined at module scope
class Agent {
    constructor(name, type, x, y) {
        this.name = name;
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = type === 'Router' ? 40 : 25;
        this.color = this.getColor(type);
        this.pulse = 0;
    }

    getColor(type) {
        switch(type) {
            case 'Router': return '#22d3ee'; // Cyan
            case 'Proponent': return '#4ade80'; // Green
            case 'Critic': return '#f87171'; // Red
            case 'Judge': return '#facc15'; // Yellow
            case 'Discovery': return '#c084fc'; // Purple
            default: return '#94a3b8';
        }
    }
}

const AntiGravityCanvas = () => {
    const canvasRef = useRef(null);
    const [agentCount, setAgentCount] = useState(0);
    const [logs, setLogs] = useState([]);
    
    // Mutable state for the physics engine
    const engineRef = useRef({
        agents: [],
        connections: [],
        gravity: 0,
        draggedAgent: null,
        animationId: null,
        width: 0,
        height: 0,
        socket: null
    });

    const log = (msg) => {
        setLogs(prev => [`> ${msg}`, ...prev].slice(0, 50));
    };

    const spawnDebate = () => {
        sendAction("SPAWN_DEBATE", { topic: "AI Safety" });
    };

    const spawnDiscovery = () => {
        sendAction("START_DISCOVERY", { domain: "Bio-Tech" });
    };

    const toggleGravity = () => {
        engineRef.current.gravity = engineRef.current.gravity === 0 ? 0.5 : 0;
        log(engineRef.current.gravity > 0 ? "Gravity ENABLED (Heavy Mode)" : "Anti-Gravity RESTORED (Float Mode)");
    };

    // --- WebSocket Integration ---
    useEffect(() => {
        // Connect to FastAPI Backend
        let socket;
        try {
            socket = new WebSocket('ws://localhost:8000/ws');
            
            socket.onopen = () => {
                log("Connected to Neural Backend [ws://localhost:8000/ws]");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'LOG') {
                        log(data.message);
                    } else if (data.type === 'SPAWN_AGENT') {
                        const { name, type, x, y } = data.agent;
                        const newAgent = new Agent(name, type, x, y); 
                        engineRef.current.agents.push(newAgent);
                        setAgentCount(engineRef.current.agents.length);
                        
                        // Connect to Router if exists
                        if (engineRef.current.agents[0] && engineRef.current.agents.length > 1) {
                             engineRef.current.connections.push({source: engineRef.current.agents[0], target: newAgent});
                        }

                    } else if (data.type === 'PULSE_AGENT') {
                        const agent = engineRef.current.agents.find(a => a.name === data.name);
                        if (agent) agent.pulse += 0.5; // Big pulse
                    } else if (data.type === 'CONNECT_AGENTS') {
                         const source = engineRef.current.agents.find(a => a.name === data.source);
                         const target = engineRef.current.agents.find(a => a.name === data.target);
                         if (source && target) {
                             engineRef.current.connections.push({source, target});
                         }
                    } else if (data.type === 'ERROR') {
                        log(`ERROR: ${data.message}`);
                    }
                } catch (e) {
                    console.error("Error parsing WS message", e);
                }
            };

            socket.onclose = () => {
                 log("Disconnected from Neural Backend");
            };

            engineRef.current.socket = socket;
        } catch (e) {
            log("Failed to connect to backend");
        }

        return () => {
            if (socket) socket.close();
        };
    }, []);

    const sendAction = (action, payload = {}) => {
        if (engineRef.current.socket && engineRef.current.socket.readyState === WebSocket.OPEN) {
            engineRef.current.socket.send(JSON.stringify({ action, ...payload }));
        } else {
            log("Backend Offline. Running Simulation Mode.");
            // Fallback to local simulation if desired
            if (action === "SPAWN_DEBATE") {
                 const { width, height } = engineRef.current;
                 const agents = engineRef.current.agents;
                 const pro = new Agent("Alpha (Pro)", "Proponent", width/2 - 100, height/2);
                 const critic = new Agent("Beta (Con)", "Critic", width/2 + 100, height/2);
                 const judge = new Agent("Omega (Judge)", "Judge", width/2, height/2 - 100);
                 agents.push(pro, critic, judge);
                 setAgentCount(agents.length);
            }
        }
    };

    // --- Canvas Animation Loop ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight; 
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
            
            engineRef.current.width = canvas.width;
            engineRef.current.height = canvas.height;
        };

        window.addEventListener('resize', resize);
        resize();

        // Initialize Master Router if empty
        if (engineRef.current.agents.length === 0) {
            engineRef.current.agents.push(new Agent("Master Router", "Router", engineRef.current.width/2, engineRef.current.height/2));
            setAgentCount(1);
        }

        const animate = () => {
            const { width, height, agents, connections, gravity } = engineRef.current;
            
            ctx.clearRect(0, 0, width, height);

            // Draw Connections
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            connections.forEach((conn, index) => {
                ctx.beginPath();
                ctx.moveTo(conn.source.x, conn.source.y);
                ctx.lineTo(conn.target.x, conn.target.y);
                ctx.stroke();
                // Randomly drop connections for effect
                if (Math.random() < 0.005) connections.splice(index, 1);
            });

            // Update & Draw Agents
            agents.forEach(agent => {
                agent.x += agent.vx;
                agent.y += agent.vy;

                if (gravity > 0) {
                    agent.vy += gravity;
                }

                // Bounce
                if (agent.x < agent.radius || agent.x > width - agent.radius) agent.vx *= -1;
                if (agent.y < agent.radius || agent.y > height - agent.radius) {
                    agent.vy *= -1;
                    if (gravity > 0) agent.vy *= 0.8;
                }

                // Bounds
                agent.x = Math.max(agent.radius, Math.min(width - agent.radius, agent.x));
                agent.y = Math.max(agent.radius, Math.min(height - agent.radius, agent.y));

                agent.pulse += 0.05;

                // Draw
                ctx.beginPath();
                ctx.arc(agent.x, agent.y, agent.radius + Math.sin(agent.pulse)*2, 0, Math.PI * 2);
                ctx.fillStyle = agent.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = agent.color;
                ctx.fill();
                ctx.closePath();
                ctx.shadowBlur = 0;

                ctx.fillStyle = "white";
                ctx.font = "12px Courier New";
                ctx.textAlign = "center";
                ctx.fillText(agent.type, agent.x, agent.y - 5);
                ctx.font = "10px Courier New";
                ctx.fillStyle = "#cbd5e1";
                ctx.fillText(agent.name, agent.x, agent.y + 10);
            });
            
            engineRef.current.animationId = requestAnimationFrame(animate);
        };

        animate();

        // Canvas Interaction
        const handleMouseDown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            engineRef.current.agents.forEach(agent => {
                const dist = Math.hypot(agent.x - mouseX, agent.y - mouseY);
                if (dist < agent.radius) {
                    engineRef.current.draggedAgent = agent;
                }
            });
        };

        const handleMouseMove = (e) => {
            if (engineRef.current.draggedAgent) {
                const rect = canvas.getBoundingClientRect();
                engineRef.current.draggedAgent.x = e.clientX - rect.left;
                engineRef.current.draggedAgent.y = e.clientY - rect.top;
                engineRef.current.draggedAgent.vx = 0;
                engineRef.current.draggedAgent.vy = 0;
            }
        };

        const handleMouseUp = () => {
            if (engineRef.current.draggedAgent) {
                const agent = engineRef.current.draggedAgent;
                agent.vx = (Math.random() - 0.5) * 5;
                agent.vy = (Math.random() - 0.5) * 5;
                engineRef.current.draggedAgent = null;
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove); // Window for smoother drag out of canvas
        window.addEventListener('mouseup', handleMouseUp); 

        return () => {
            window.removeEventListener('resize', resize);
            if (engineRef.current.animationId) cancelAnimationFrame(engineRef.current.animationId);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div className="relative w-full h-full bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            {/* HUD Overlay */}
            <div className="absolute top-6 left-6 pointer-events-none select-none z-50">
                <h1 className="text-3xl font-bold text-cyan-400 font-orbitron">ANTI-GRAVITY <span className="text-xs text-gray-400">PROTOCOL</span></h1>
                <p className="text-sm text-gray-300 font-mono mt-1">Status: <span className="text-green-400">ACTIVE</span></p>
                <p className="text-sm text-gray-300 font-mono">Agent Nodes: <span className="text-purple-400 font-bold">{agentCount}</span></p>
            </div>

            {/* Logs Panel */}
            <div className="absolute top-6 right-6 w-80 max-h-60 bg-black/60 backdrop-blur-md border border-slate-700 p-3 rounded-lg overflow-y-auto font-mono text-xs scrollbar-thin">
                <div className="text-cyan-400 font-bold mb-2 sticky top-0 bg-black/60 pb-1 border-b border-white/10">Neural Stream</div>
                <div className="space-y-1">
                    {logs.map((msg, i) => (
                        <div key={i} className="text-slate-300 border-b border-white/5 pb-1">{msg}</div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 right-6 flex gap-3">
                <button onClick={spawnDebate} className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500 backdrop-blur text-white rounded font-bold text-sm shadow-lg border border-blue-400/30 transition-all font-orbitron">
                    SPAWN DEBATE
                </button>
                <button onClick={spawnDiscovery} className="px-4 py-2 bg-purple-600/80 hover:bg-purple-500 backdrop-blur text-white rounded font-bold text-sm shadow-lg border border-purple-400/30 transition-all font-orbitron">
                    START DISCOVERY
                </button>
                <button onClick={toggleGravity} className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 backdrop-blur text-white rounded font-bold text-sm shadow-lg border border-white/10 transition-all font-orbitron">
                    TOGGLE PHYSICS
                </button>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
        </div>
    );
};

export { AntiGravityCanvas };
