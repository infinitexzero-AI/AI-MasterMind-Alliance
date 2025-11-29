// AILCC Framework - Phase 4: Supervisor Bus
// Message bus for inter-agent communication

import { EventEmitter } from 'events';

export interface Message {
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: number;
}

export class SupervisorBus extends EventEmitter {
  private messageQueue: Message[];
  private running: boolean;

  constructor() {
    super();
    this.messageQueue = [];
    this.running = false;
  }

  async start(): Promise<void> {
    console.log('[SupervisorBus] Starting message bus...');
    this.running = true;
    this.emit('bus:started');
  }

  async stop(): Promise<void> {
    console.log('[SupervisorBus] Stopping message bus...');
    this.running = false;
    this.messageQueue = [];
    this.emit('bus:stopped');
  }

  send(message: Omit<Message, 'timestamp'>): void {
    if (!this.running) {
      throw new Error('Bus not running');
    }
    const fullMessage: Message = {
      ...message,
      timestamp: Date.now()
    };
    this.messageQueue.push(fullMessage);
    this.emit('message', fullMessage);
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }
}
