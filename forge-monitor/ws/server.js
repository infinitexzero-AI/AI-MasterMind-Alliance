const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

console.log("Forge WS running on ws://localhost:3001");

function fakeState() {
  return {
    ts: Date.now(),
    agents: {
      router: "ok",
      dispatcher: "ok",
      vector: "warn",
      memory: "ok"
    },
    pipeline: {
      stage: "idle",
      load: Math.random().toFixed(2)
    }
  };
}

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (msg) => {
    console.log("Control received:", msg.toString());
  });

  const interval = setInterval(() => {
    ws.send(JSON.stringify(fakeState()));
  }, 2000);

  ws.on("close", () => clearInterval(interval));
});
