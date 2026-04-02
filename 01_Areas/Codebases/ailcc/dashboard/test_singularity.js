const io = require("socket.io-client");
const socket = io("http://localhost:5005");

socket.on("connect", () => {
    console.log("Connected to Neural Relay. Injecting Singularity Proposal...");
    
    const proposal = {
        id: "prop-" + Date.now(),
        file_path: "/Users/infinite27/AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/test_dummy.ts",
        description: "Autonomous Agent Intent: Re-writing active telemetry streams to fix severe performance bottleneck.",
        original_content: "export const telemetry = () => {\n  console.log('Running inefficient polling...');\n  setInterval(fetchData, 1000);\n}\n",
        proposed_content: "export const telemetry = () => {\n  console.log('Singularity Native WebSockets Active.');\n  const ws = new WebSocket('ws://localhost:5005');\n  ws.onmessage = (e) => processBuffer(e.data);\n}\n",
        status: "PENDING",
        timestamp: new Date().toISOString()
    };

    // Attempting direct socket.io event mimicking internal relay patterns 
    // Dashboard listens for 'SWARM_PROPOSAL'
    // Send standard stringified engine.io or let socket.io wrap it natively
    socket.emit('broadcast', {
        event: 'SWARM_PROPOSAL',
        payload: proposal
    });
    
    // Also try direct emit just in case the relay behaves as a dumb pipe
    socket.emit('SWARM_PROPOSAL', proposal);

    // And try the standard format used in AILCC
    socket.emit('action', {
        type: 'SWARM_PROPOSAL',
        data: proposal
    });

    console.log("Payload Injected. The Nexus Dashboard should now display the React Code-Diff UI natively inside the War Room!");
    setTimeout(() => { socket.disconnect(); process.exit(0); }, 1000);
});
