class MessageBus {
  private queue: any[] = [];
  private subscribers: Function[] = [];

  constructor() {}

  publish(message: any) {
    this.queue.push({ message, ts: Date.now() });
    this.subscribers.forEach(cb => cb(message));
  }

  subscribe(cb: Function) {
    this.subscribers.push(cb);
  }

  drain() {
    const drained = [...this.queue];
    this.queue = [];
    return drained;
  }
}

const bus = new MessageBus();
export default bus;
