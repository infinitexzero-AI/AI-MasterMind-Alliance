/**
 * Supervisor Unit Tests
 * Verifies message bus commands trigger correct runtime actions.
 */

import bus from "../../forge-monitor/supervisor/bus";
import runtime from "../../forge-monitor/runtime";

describe("Supervisor Worker", () => {
    // We need to ensure the worker is loaded so it subscribes to the bus
    require("../../forge-monitor/supervisor/worker");

    beforeEach(async () => {
        // Reset runtime state if possible, or ensure it's stopped
        if (runtime.isRunning()) {
            await runtime.stop();
        }
    });

    afterAll(async () => {
        if (runtime.isRunning()) {
            await runtime.stop();
        }
    });

    it("should start the runtime on 'start-runtime' command", async () => {
        expect(runtime.isRunning()).toBe(false);
        bus.publish({ cmd: "start-runtime" });
        
        // Give async handlers a moment
        await new Promise(r => setTimeout(r, 100));
        
        expect(runtime.isRunning()).toBe(true);
    });

    it("should spawn an agent on 'spawn-agent' command", async () => {
        if (!runtime.isRunning()) await runtime.start();

        bus.publish({ 
            cmd: "spawn-agent", 
            args: { agentId: "test-agent-1", config: { role: "test" } } 
        });

        await new Promise(r => setTimeout(r, 100));
        
        const agents = runtime.getActiveAgents();
        expect(agents).toContain("test-agent-1");
    });

    it("should terminate an agent on 'terminate-agent' command", async () => {
        if (!runtime.isRunning()) await runtime.start();
        
        // spawn first directly to ensure state
        await runtime.spawnAgent("test-agent-2", {});
        expect(runtime.getActiveAgents()).toContain("test-agent-2");

        bus.publish({ 
            cmd: "terminate-agent", 
            args: { agentId: "test-agent-2" } 
        });

        await new Promise(r => setTimeout(r, 100));
        
        expect(runtime.getActiveAgents()).not.toContain("test-agent-2");
    });

    it("should handle error when spawning duplicate agent", async () => {
        if (!runtime.isRunning()) await runtime.start();
        
        await runtime.spawnAgent("dup-agent", {});
        
        // Capture console.error
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        bus.publish({ 
            cmd: "spawn-agent", 
            args: { agentId: "dup-agent", config: {} } 
        });

        await new Promise(r => setTimeout(r, 100));
        
        expect(spy).toHaveBeenCalledWith(expect.stringContaining("Failed to spawn agent"), expect.anything());
        spy.mockRestore();
    });

    it("should stop the runtime on 'stop-runtime' command", async () => {
        if (!runtime.isRunning()) await runtime.start();
        
        bus.publish({ cmd: "stop-runtime" });
        
        await new Promise(r => setTimeout(r, 100));
        
        expect(runtime.isRunning()).toBe(false);
    });
});
