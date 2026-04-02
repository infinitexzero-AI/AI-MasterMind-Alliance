
import fs from 'fs';
import path from 'path';
import { ToolDefinition } from './registry';
import { z } from 'zod';

const ALLOWED_ROOT = path.resolve(__dirname, '../../../../'); // AILCC_PRIME root
// Better: Use a config value. For now, lock to AILCC_PRIME.

export const ReadFileTool: ToolDefinition = {
    name: 'read_file',
    description: 'Read the contents of a file. Path must be relative to AILCC_PRIME root or absolute path within allowed directories.',
    parameters: z.object({
        path: z.string().describe('The path to the file to read')
    }),
    execute: async ({ path: filePath }) => {
        // Security check
        const resolved = path.resolve(ALLOWED_ROOT, filePath);
        if (!resolved.startsWith(ALLOWED_ROOT)) {
            throw new Error('Access denied: Path outside allowed root');
        }
        if (!fs.existsSync(resolved)) {
            throw new Error('File not found');
        }
        return fs.promises.readFile(resolved, 'utf-8');
    }
};

export const WriteFileTool: ToolDefinition = {
    name: 'write_file',
    description: 'Write content to a file. Overwrites existing content.',
    parameters: z.object({
        path: z.string().describe('The path to the file'),
        content: z.string().describe('The content to write')
    }),
    execute: async ({ path: filePath, content }) => {
        const resolved = path.resolve(ALLOWED_ROOT, filePath);
        if (!resolved.startsWith(ALLOWED_ROOT)) {
            throw new Error('Access denied');
        }
        // Ensure dir exists
        await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
        await fs.promises.writeFile(resolved, content, 'utf-8');
        return { success: true, path: filePath };
    }
};

export const ListDirTool: ToolDefinition = {
    name: 'list_dir',
    description: 'List contents of a directory',
    parameters: z.object({
        path: z.string().describe('The directory path')
    }),
    execute: async ({ path: dirPath }) => {
        const resolved = path.resolve(ALLOWED_ROOT, dirPath);
        if (!resolved.startsWith(ALLOWED_ROOT)) {
            throw new Error('Access denied');
        }
        const items = await fs.promises.readdir(resolved);
        return items;
    }
};
