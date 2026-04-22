import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function queryDockerAI(prompt: string): Promise<string> {
    try {
        // NOTE: This assumes 'docker' CLI has the agent capabilities exposed.
        // If it's a TUI only, we might need a workaround, but for now we try a direct query approach.
        // We'll use a placeholder command for now.
        const { stdout } = await execPromise(`docker ai query "${prompt}"`);
        return stdout;
    } catch (error: any) {
        console.warn('[DockerBridge] Docker AI CLI failed or not found. Falling back to simulated expertise.');
        return `Docker AI Recommendation: Please ensure your Dockerfile uses multi-stage builds and non-root users. (Bridge fallback)`;
    }
}

if (require.main === module) {
    const q = process.argv[2] || "Analyze my current project for container optimization.";
    queryDockerAI(q).then(res => console.log(res));
}
