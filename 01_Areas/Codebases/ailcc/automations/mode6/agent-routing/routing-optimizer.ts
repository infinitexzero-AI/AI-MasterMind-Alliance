import { AgentType } from '../intent-router/types';
import fs from 'fs';
import path from 'path';

export interface AgentMetric {
    agent: AgentType;
    successRate: number;
    avgLatency: number;
    activeTasks: number;
    totalTasks: number;
    lastUpdated: string;
    lastFailure?: string;
}

const METRICS_FILE = path.resolve(__dirname, '../data/routing_metrics.json');

export class RoutingOptimizer {
    private metrics: Map<AgentType, AgentMetric> = new Map();
    private initialized = false;

    constructor() {
        this.loadMetrics();
    }

    /**
     * Load metrics from persistent storage
     */
    private loadMetrics(): void {
        try {
            if (fs.existsSync(METRICS_FILE)) {
                const data = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
                Object.entries(data).forEach(([agent, metric]) => {
                    this.metrics.set(agent as AgentType, metric as AgentMetric);
                });
                this.initialized = true;
                console.log('[RoutingOptimizer] Loaded persistent metrics');
            } else {
                this.initializeMetrics();
            }
        } catch (error) {
            console.warn('[RoutingOptimizer] Failed to load metrics, initializing defaults:', error);
            this.initializeMetrics();
        }
    }

    /**
     * Save metrics to persistent storage
     */
    private saveMetrics(): void {
        try {
            const data = Object.fromEntries(this.metrics);
            const dir = path.dirname(METRICS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('[RoutingOptimizer] Failed to save metrics:', error);
        }
    }

    private initializeMetrics() {
        const agents: AgentType[] = ['claude', 'grok', 'comet', 'chatgpt', 'openai'];
        agents.forEach(agent => {
            this.metrics.set(agent, {
                agent,
                successRate: 1.0,
                avgLatency: 0,
                activeTasks: 0,
                totalTasks: 0,
                lastUpdated: new Date().toISOString()
            });
        });
        this.saveMetrics();
    }

    /**
     * Capacity Prediction Model (Grok v2 Scaffolding)
     * Predicts the best agent based on real-time metrics and load.
     */
    predictBestAgent(capabilityRequired: string, recentLatencies: Record<string, number[]>): AgentType {
        let bestAgent: AgentType = 'claude';
        let lowestScore = Infinity;

        this.metrics.forEach((metric, agent) => {
            // Scoring: Lower is better
            // Score = (ActiveTasks * 20) + AvgLatency - (SuccessRate * 50) + (1 / (totalTasks + 1) * 10)
            const history = recentLatencies[agent] || [];
            const avgLat = history.length > 0 ? history.reduce((a, b) => a + b) / history.length : 500;

            // Bonus for agents with more experience (higher totalTasks)
            const experienceBonus = Math.min(metric.totalTasks * 0.5, 20);

            const score = (metric.activeTasks * 20) + avgLat - (metric.successRate * 50) - experienceBonus;

            if (score < lowestScore) {
                lowestScore = score;
                bestAgent = agent;
            }
        });

        return bestAgent;
    }

    updateMetrics(agent: AgentType, success: boolean, duration: number): void {
        const metric = this.metrics.get(agent);
        if (metric) {
            metric.successRate = (metric.successRate * 0.9) + (success ? 0.1 : 0);
            metric.avgLatency = (metric.avgLatency * 0.8) + (duration * 0.2);
            metric.totalTasks++;
            metric.lastUpdated = new Date().toISOString();
            if (metric.activeTasks > 0) metric.activeTasks--;
            if (!success) metric.lastFailure = new Date().toISOString();
            this.saveMetrics();
        }
    }

    incrementLoad(agent: AgentType): void {
        const metric = this.metrics.get(agent);
        if (metric) {
            metric.activeTasks++;
            this.saveMetrics();
        }
    }

    getHealthReport(): Record<AgentType, AgentMetric> {
        return Object.fromEntries(this.metrics) as Record<AgentType, AgentMetric>;
    }
}
