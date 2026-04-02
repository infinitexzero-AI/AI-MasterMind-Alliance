/* eslint-disable @typescript-eslint/no-var-requires */
const EventEmitter = require('events');

class InterAgentBus extends EventEmitter {
    constructor() {
        super();
        this.state = {};
    }

    publish(channel, message) {
        const payload = {
            channel,
            message,
            timestamp: new Date().toISOString(),
            traceId: message.traceId || 'internal'
        };
        this.state[channel] = payload;
        this.emit(channel, payload);
    }

    getState(channel) {
        return this.state[channel] || null;
    }
}

// Singleton instance
const bus = new InterAgentBus();

module.exports = bus;
