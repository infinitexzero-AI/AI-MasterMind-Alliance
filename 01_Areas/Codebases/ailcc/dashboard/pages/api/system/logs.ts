import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface LogEntry {
    line: number;
    text: string;
    severity: 'info' | 'warn' | 'error' | 'debug';
    timestamp?: string;
}

interface LogsResponse {
    file: string;
    totalLines: number;
    entries: LogEntry[];
}

function classifySeverity(text: string): LogEntry['severity'] {
    const lower = text.toLowerCase();
    if (lower.includes('error') || lower.includes('err') || lower.includes('fatal') || lower.includes('❌')) return 'error';
    if (lower.includes('warn') || lower.includes('⚠')) return 'warn';
    if (lower.includes('debug') || lower.includes('trace')) return 'debug';
    return 'info';
}

function extractTimestamp(text: string): string | undefined {
    const isoMatch = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    if (isoMatch) return isoMatch[0];
    const bracketMatch = text.match(/\[([^\]]+)\]/);
    if (bracketMatch) return bracketMatch[1];
    return undefined;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<LogsResponse | { error: string }>
) {
    const { source = 'dashboard', lines: linesParam = '100' } = req.query;
    const maxLines = Math.min(parseInt(linesParam as string) || 100, 500);

    const logFiles: Record<string, string> = {
        dashboard: path.join(process.env.HOME || '', 'AILCC_PRIME/01_Areas/Codebases/ailcc/dashboard/dashboard.log'),
        system: path.join(process.env.HOME || '', 'AILCC_PRIME/01_Areas/Codebases/ailcc/system.log'),
        comet: path.join(process.env.HOME || '', 'AILCC_PRIME/01_Areas/Codebases/ailcc/comet_output.log'),
    };

    const filePath = logFiles[source as string];
    if (!filePath) {
        return res.status(400).json({ error: `Unknown log source: ${source}. Valid: ${Object.keys(logFiles).join(', ')}` });
    }

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: `Log file not found: ${filePath}` });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const allLines = content.split('\n').filter(l => l.trim());
        const totalLines = allLines.length;
        const tail = allLines.slice(-maxLines);

        const entries: LogEntry[] = tail.map((text, i) => ({
            line: totalLines - tail.length + i + 1,
            text: text.trim(),
            severity: classifySeverity(text),
            timestamp: extractTimestamp(text),
        }));

        res.status(200).json({
            file: source as string,
            totalLines,
            entries,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
}
