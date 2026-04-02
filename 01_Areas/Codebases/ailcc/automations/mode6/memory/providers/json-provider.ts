import fs from 'fs';
import path from 'path';
import { StorageProvider } from '../storage-types';

export class JsonFileProvider implements StorageProvider {
    private baseDir: string;
    private cache: Map<string, any> = new Map();

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    async init(): Promise<void> {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async save(key: string, data: any): Promise<boolean> {
        try {
            const filePath = path.join(this.baseDir, `${key}.json`);
            const tempPath = `${filePath}.tmp`;

            // Update Cache
            this.cache.set(key, data);

            // Atomic Write: Write to .tmp then rename
            await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2));
            await fs.promises.rename(tempPath, filePath);

            return true;
        } catch (error) {
            console.error(`[JsonProvider] Save failed for ${key}:`, error);
            return false;
        }
    }

    async load<T>(key: string): Promise<T | null> {
        // Read-through cache strategy? 
        // Ideally we want fresh data if shared across processes.
        // So we read from disk always for "The Loop" synchronization.
        try {
            const filePath = path.join(this.baseDir, `${key}.json`);
            if (!fs.existsSync(filePath)) return null;

            const content = await fs.promises.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            this.cache.set(key, data);
            return data as T;
        } catch (error) {
            console.error(`[JsonProvider] Load failed for ${key}:`, error);
            return null;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            const filePath = path.join(this.baseDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
            this.cache.delete(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    async listKeys(pattern?: string): Promise<string[]> {
        const files = await fs.promises.readdir(this.baseDir);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
    }
}
