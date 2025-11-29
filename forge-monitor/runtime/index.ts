/**
 * Forge runtime scaffold - TypeScript
 * Exposes start/stop/status and emits telemetry events via EventEmitter
 */
import { EventEmitter } from "events";

class ForgeRuntime extends EventEmitter {
  private running = false;
  private interval: NodeJS.Timeout | null = null;

  start() {
    if (this.running) return;
    this.running = true;
    this.emit("started", { ts: Date.now() });
    this.interval = setInterval(() => {
      this.emit("telemetry", {
        ts: Date.now(),
        latency: Math.floor(25 + Math.random() * 50),
        load: Math.round(Math.random() * 100) / 100
      });
    }, 3000);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.emit("stopped", { ts: Date.now() });
  }

  status() {
    return { running: this.running, ts: Date.now() };
  }
}

const runtime = new ForgeRuntime();
export default runtime;
