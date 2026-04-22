import Matter from 'matter-js';

export class GravitySystem {
    public engine: Matter.Engine;

    constructor(engine: Matter.Engine) {
        this.engine = engine;
    }

    /**
     * Applies a gravitational pull towards a specific point (Gravity Well)
     * for all bodies that act as 'agents'.
     */
    public applyGravityWell(x: number, y: number, strength: number, range: number) {
        const bodies = Matter.Composite.allBodies(this.engine.world);

        bodies.forEach(body => {
            // Don't pull static walls or the well itself (if it were a body)
            if (body.isStatic) return;

            const dx = x - body.position.x;
            const dy = y - body.position.y;
            const distanceSq = dx * dx + dy * dy;

            // Range check
            if (distanceSq > range * range) return;
            if (distanceSq < 100) return; // Prevention of singularity/glitching at close range

            // Normalize
            const distance = Math.sqrt(distanceSq);
            const forceMagnitude = (strength * body.mass) / distance; // Simplified gravity F = G * m1 * m2 / r

            Matter.Body.applyForce(body, body.position, {
                x: (dx / distance) * forceMagnitude * 0.001,
                y: (dy / distance) * forceMagnitude * 0.001
            });
        });
    }

    /**
     * Applies a repulsive force between agents to prevent clumping (Personal Space)
     */
    public applyAgentRepulsion() {
        const bodies = Matter.Composite.allBodies(this.engine.world);

        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const bodyA = bodies[i];
                const bodyB = bodies[j];

                if (bodyA.isStatic || bodyB.isStatic) continue;

                const dx = bodyA.position.x - bodyB.position.x;
                const dy = bodyA.position.y - bodyB.position.y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq < 6000) { // Repulsion range
                    const force = 0.05 / distanceSq;
                    const angle = Math.atan2(dy, dx);

                    const lx = Math.cos(angle) * force;
                    const ly = Math.sin(angle) * force;

                    Matter.Body.applyForce(bodyA, bodyA.position, { x: lx, y: ly });
                    Matter.Body.applyForce(bodyB, bodyB.position, { x: -lx, y: -ly });
                }
            }
        }
    }
}
