

/**
 * AILCC The "Ghost" Agent (Option A)
 * 
 * An invisible background daemon that listens to recent user tasks and
 * predicts the NEXT likely request. It uses a local Ollama instance to pre-calculate
 * answers, caching them in the Vault so when the user actually asks, it responds in 0ms.
 */


const POLL_INTERVAL_MS = 15000; // Run prediction loop periodically

let lastAnalyzedTaskId = '';
const predictionCache = new Map<string, string>();

async function getRecentTask(): Promise<string | null> {
    try {
        // In reality, this would query the SQLite memory base. 
        // For hardware continuity, we simulate fetching the latest user intent from the Vault.
        const res = await fetch('http://localhost:3000/api/system/vault/latest-task');
        if (res.ok) {
            const data = await res.json();
            return data.description || null;
        }
    } catch {
        // Dashboard offline or busy
    }
    return null;
}

async function predictNextQuestions(taskDesc: string): Promise<string[]> {
    console.log(`[Ghost Agent] 👻 Analyzing context: "${taskDesc.substring(0, 50)}..."`);
    try {
        // Send to local ollama to predict next questions
        const prompt = `Based on the following user action: "${taskDesc}", what are the 2 most likely follow-up questions the user will ask? Reply ONLY with the questions separated by newlines. No intro.`;

        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3:latest', // Ensure we use local air-gapped node for ghost tasks
                prompt: prompt,
                stream: false
            })
        });

        const data = await res.json();
        return data.response.split('\n').filter((l: string) => l.trim().length > 5);
    } catch (e) {
        return [];
    }
}

async function preCalculateAnswer(question: string) {
    if (predictionCache.has(question)) return;

    console.log(`[Ghost Agent] 🔮 Pre-calculating answer for: "${question}"`);
    try {
        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3:latest',
                prompt: `You are the AILCC Nexus. Briefly answer: ${question}`,
                stream: false
            })
        });

        const data = await res.json();
        predictionCache.set(question, data.response);
        console.log(`[Ghost Agent] ✅ Result cached in memory. Zero-latency hit ready.`);

        // Push notification of cache warmup to global bus (optional, via dashboard API)
        fetch('http://localhost:3000/api/system/ghost-sync', {
            method: 'POST',
            body: JSON.stringify({ question, answer: data.response })
        }).catch(() => { });

    } catch (e) {
        console.error(`[Ghost Agent] Pre-calc failed.`);
    }
}

async function ghostLoop() {
    const recentTask = await getRecentTask();
    if (!recentTask || recentTask === lastAnalyzedTaskId) return;

    lastAnalyzedTaskId = recentTask;

    const predictions = await predictNextQuestions(recentTask);
    for (const pred of predictions) {
        await preCalculateAnswer(pred);
    }
}

console.log(`[Ghost Agent] 👻 Online. Sitting in the shadows.`);
setInterval(ghostLoop, POLL_INTERVAL_MS);
