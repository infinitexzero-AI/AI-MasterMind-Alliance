/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const os = require('os');

class ConflictResolver {
    constructor() {
        this.lockDir = path.join(os.tmpdir(), 'ailcc_locks');
        if (!fs.existsSync(this.lockDir)) {
            fs.mkdirSync(this.lockDir, { recursive: true });
        }
    }

    async acquireLock(filePath, agentId, timeoutMs = 5000) {
        const lockFile = this.getLockPath(filePath);
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                // Try to create lock file exclusively
                fs.writeFileSync(lockFile, JSON.stringify({
                    agentId,
                    timestamp: new Date().toISOString(),
                    pid: process.pid
                }), { flag: 'wx' });
                return true;
            } catch (e) {
                // Check if lock is stale (older than 30 seconds)
                try {
                    const stats = fs.statSync(lockFile);
                    if (Date.now() - stats.mtimeMs > 30000) {
                        console.warn(`[ConflictResolver] Found stale lock for ${filePath}, breaking it.`);
                        this.releaseLock(filePath);
                        continue; // Retry
                    }
                } catch (err) {
                    // Lock might have been released just now
                }
                
                // Wait and retry
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return false;
    }

    releaseLock(filePath) {
        const lockFile = this.getLockPath(filePath);
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    }

    getLockPath(filePath) {
        const hash = Buffer.from(filePath).toString('base64').replace(/\//g, '_');
        return path.join(this.lockDir, `${hash}.lock`);
    }
}

module.exports = new ConflictResolver();
