/**
 * Supervisor worker: subscribes to bus and calls runtime methods.
 */
import bus from "./bus";
import runtime from "../runtime";

bus.subscribe((c: any) => {
  if (!c || !c.cmd) return;
  switch (c.cmd) {

    case "start-runtime":
      try {
        runtime.start();
      } catch (e: any) {
        console.error("Failed to start runtime:", e.message);
      }
      break;
    case "stop-runtime":
      try {
        runtime.stop();
      } catch (e: any) {
        console.error("Failed to stop runtime:", e.message);
      }
      break;
    case "spawn-agent":
      try {
         // args: { agentId: string, config: any }
         if (!c.args || !c.args.agentId) {
             console.error("spawn-agent missing args");
             break;
         }
         runtime.spawnAgent(c.args.agentId, c.args.config || {})
            .then(() => console.log(`Agent ${c.args.agentId} spawned`))
            .catch(e => console.error(`Failed to spawn agent ${c.args.agentId}:`, e.message));
      } catch (e: any) {
         console.error("spawn-agent error:", e.message);
      }
      break;
    case "terminate-agent":
      try {
          if (!c.args || !c.args.agentId) {
              console.error("terminate-agent missing args");
              break;
          }
          runtime.terminateAgent(c.args.agentId)
            .then(() => console.log(`Agent ${c.args.agentId} terminated`))
            .catch(e => console.error(`Failed to terminate agent ${c.args.agentId}:`, e.message));
      } catch (e: any) {
          console.error("terminate-agent error:", e.message);
      }
      break;
    case "status":
      console.log("runtime.status", runtime.status());
      break;
    default:
      console.log("unknown cmd", c);
  }
});

export default bus;
