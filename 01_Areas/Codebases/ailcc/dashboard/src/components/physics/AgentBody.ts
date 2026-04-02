import Matter from 'matter-js';

export type AgentRole = 'ROUTER' | 'COMET' | 'PROPONENT' | 'CRITIC' | 'JUDGE' | 'DISCOVERY';

interface AgentConfig {
    x: number;
    y: number;
    role: AgentRole;
    label: string;
}

export class AgentBody {
    public body: Matter.Body;
    public role: AgentRole;

    constructor(config: AgentConfig) {
        this.role = config.role;
        const commonOptions = {
            restitution: 0.9, // Bouncy
            frictionAir: 0.02, // Resistance
            label: config.label,
            render: {
                sprite: {
                    // Placeholder for texture or custom rendering signal
                }
            }
        };

        switch (config.role) {
            case 'ROUTER': // Square/Cube, Heavy, Anchoredish
                this.body = Matter.Bodies.rectangle(config.x, config.y, 60, 60, {
                    ...commonOptions,
                    mass: 100, // Very heavy
                    frictionAir: 0.05, // Hard to move
                    isStatic: false,
                    render: { fillStyle: '#22d3ee' } // Cyan
                });
                break;

            case 'COMET': // Pulsing Orb
                this.body = Matter.Bodies.circle(config.x, config.y, 25, {
                    ...commonOptions,
                    mass: 10,
                    render: { fillStyle: '#6366f1' } // Indigo
                });
                break;

            case 'PROPONENT': // Circle, Green, Fast
                this.body = Matter.Bodies.circle(config.x, config.y, 20, {
                    ...commonOptions,
                    mass: 5,
                    restitution: 1.1, // Extra bouncy
                    render: { fillStyle: '#4ade80' } // Green
                });
                break;

            case 'CRITIC': // Triangle, Red, Fast
                this.body = Matter.Bodies.polygon(config.x, config.y, 3, 20, {
                    ...commonOptions,
                    mass: 5,
                    restitution: 1.1,
                    render: { fillStyle: '#f87171' } // Red
                });
                break;

            case 'JUDGE': // Octagon, Yellow, Heavy
                this.body = Matter.Bodies.polygon(config.x, config.y, 8, 40, {
                    ...commonOptions,
                    mass: 50,
                    frictionAir: 0.04,
                    render: { fillStyle: '#facc15' } // Yellow
                });
                break;

            case 'DISCOVERY': // Small Dot, Purple
            default:
                this.body = Matter.Bodies.circle(config.x, config.y, 10, {
                    ...commonOptions,
                    mass: 2,
                    render: { fillStyle: '#c084fc' } // Purple
                });
                break;
        }
    }

    public getBody() {
        return this.body;
    }
}
