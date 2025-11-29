class MessageBus {
  constructor() {
    this.queue = [];
    this.subscribers = [];
  }

  publish(message) {
    this.queue.push({ message, ts: Date.now() });
    this.subscribers.forEach(cb => cb(message));
  }

  subscribe(cb) {
    this.subscribers.push(cb);
  }

  drain() {
    const drained = [...this.queue];
    this.queue = [];
    return drained;
  }
}

const bus = new MessageBus();
module.exports = bus;
