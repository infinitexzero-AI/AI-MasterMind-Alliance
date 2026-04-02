import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { AgentBody, AgentRole } from './AgentBody';
import { GravitySystem } from './GravitySystem';

const PhysicsCanvas: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const gravitySystemRef = useRef<GravitySystem | null>(null);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        if (!sceneRef.current) return;

        // 1. Setup Matter JS
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Composite = Matter.Composite;

        const engine = Engine.create();
        engine.gravity.y = 0; // Zero gravity for space/void effect
        engineRef.current = engine;
        gravitySystemRef.current = new GravitySystem(engine);

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: '#0f172a' // Slate-900
            }
        });

        // 2. Setup Boundaries (Walls)
        const wallOptions = { isStatic: true, render: { fillStyle: '#1e293b' } };
        const width = window.innerWidth;
        const height = window.innerHeight;
        const thickness = 50;

        World.add(engine.world, [
            Bodies.rectangle(width / 2, -thickness / 2, width, thickness, wallOptions), // Top
            Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, wallOptions), // Bottom
            Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, wallOptions), // Right
            Bodies.rectangle(-thickness / 2, height / 2, thickness, height, wallOptions) // Left
        ]);

        // 3. Spawn Initial Agents (Prototype Demo)
        const router = new AgentBody({ x: width / 2, y: height / 2, role: 'ROUTER', label: 'Central Cortex' });
        const comet = new AgentBody({ x: width / 2, y: 100, role: 'COMET', label: 'Comet Bridge' });

        World.add(engine.world, [router.getBody(), comet.getBody()]);

        // Spawn some random small nodes
        for (let i = 0; i < 5; i++) {
            const discovery = new AgentBody({
                x: Math.random() * width,
                y: Math.random() * height,
                role: 'DISCOVERY',
                label: `Node_${i}`
            });
            World.add(engine.world, discovery.getBody());
        }

        // 4. Mouse Interactivity
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        World.add(engine.world, mouseConstraint);
        render.mouse = mouse; // Keep mouse in sync with render

        // 5. Run Layout
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        // 6. Value-add Processing Loop (Gravity etc)
        const events = Matter.Events;
        events.on(engine, 'beforeUpdate', () => {
            // Apply Center Gravity to pull drift-aways back slightly
            gravitySystemRef.current?.applyGravityWell(width / 2, height / 2, 0.5, 5000);
            // Apply Repulsion
            gravitySystemRef.current?.applyAgentRepulsion();
        });

        // Loop for FPS
        let lastTime = performance.now();
        let frameCount = 0;
        const fpsLoop = setInterval(() => {
            const now = performance.now();
            const delta = now - lastTime;
            if (delta >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            } else {
                frameCount++;
            }
        }, 1000 / 60); // Check loosely

        // Cleanup
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            clearInterval(fpsLoop);
            if (render.canvas) render.canvas.remove();
        };
    }, []);

    const spawnAgent = (role: AgentRole) => {
        if (!engineRef.current) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const agent = new AgentBody({
            x: Math.random() * width * 0.8 + width * 0.1,
            y: Math.random() * height * 0.8 + height * 0.1,
            role: role,
            label: `Spawn_${Date.now()}`
        });
        Matter.World.add(engineRef.current.world, agent.getBody());
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div ref={sceneRef} className="w-full h-full" />

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 p-4 text-cyan-400 font-mono text-sm bg-slate-900/80 rounded border border-cyan-900">
                <div>PHYSICS_ENGINE: ONLINE</div>
                <div>FPS: {fps}</div>
                <div>GRAVITY: ZERO_G</div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => spawnAgent('PROPONENT')} className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500/40 rounded transition">
                    + PRO
                </button>
                <button onClick={() => spawnAgent('CRITIC')} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/40 rounded transition">
                    + CON
                </button>
                <button onClick={() => spawnAgent('JUDGE')} className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500 hover:bg-yellow-500/40 rounded transition">
                    + JUDGE
                </button>
            </div>
        </div>
    );
};

export default PhysicsCanvas;
