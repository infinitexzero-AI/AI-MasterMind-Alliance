/**
 * Supervisor worker: subscribes to bus and calls runtime methods.
 */
import bus from "./bus";
import runtime from "../runtime";

bus.subscribe((c: any) => {
  if (!c || !c.cmd) return;
  switch (c.cmd) {
    case "start-runtime":
      runtime.start();
      break;
    case "stop-runtime":
      runtime.stop();
      break;
    case "status":
      console.log("runtime.status", runtime.status());
      break;
    default:
      console.log("unknown cmd", c);
  }
});

export default bus;
