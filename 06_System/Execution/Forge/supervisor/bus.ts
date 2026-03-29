/**
 * Simple in-process message bus for supervisor to exchange simple commands.
 */
export type Cmd = { cmd: string; args?: any; ts?: number };

class MessageBus {
  private subs: ((c: Cmd) => void)[] = [];

  publish(c: Cmd) {
    c.ts = Date.now();
    for (const s of this.subs) {
      try { s(c); } catch (e) { console.error("bus handler error", e); }
    }
  }

  subscribe(cb: (c: Cmd) => void) {
    this.subs.push(cb);
    return () => { this.subs = this.subs.filter(s => s !== cb); };
  }
}

const bus = new MessageBus();
export default bus;
