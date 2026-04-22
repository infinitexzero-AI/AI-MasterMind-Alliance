import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SkillEntry {
  name: string;
  icon: string;
  status: 'ready' | 'missing' | 'disabled' | 'blocked';
  requirements?: string;
}

interface OpenClawStatus {
  version: string | null;
  gatewayOnline: boolean;
  defaultModel: string | null;
  skills: {
    total: number;
    eligible: number;
    disabled: number;
    blocked: number;
    missingReqs: number;
    entries: SkillEntry[];
  };
  timestamp: string;
}

function parseSkillsCheck(output: string): OpenClawStatus['skills'] {
  const lines = output.split('\n');
  let total = 0, eligible = 0, disabled = 0, blocked = 0, missingReqs = 0;
  const entries: SkillEntry[] = [];
  let section: 'none' | 'ready' | 'missing' | 'disabled' | 'blocked' = 'none';

  for (const line of lines) {
    if (line.startsWith('Total:')) total = parseInt(line.split(':')[1]?.trim() || '0');
    else if (line.includes('Eligible:')) eligible = parseInt(line.split(':')[1]?.trim() || '0');
    else if (line.includes('Disabled:') && !line.includes('Missing')) disabled = parseInt(line.split(':')[1]?.trim() || '0');
    else if (line.includes('Blocked')) blocked = parseInt(line.split(':')[1]?.trim() || '0');
    else if (line.includes('Missing requirements:') && line.includes(':')) missingReqs = parseInt(line.split(':')[1]?.trim() || '0');
    else if (line.startsWith('Ready to use:')) section = 'ready';
    else if (line.startsWith('Missing requirements:') && !line.includes(':')) section = 'missing';
    else if (line.trim().startsWith('📦') || line.trim().startsWith('🐙') || line.trim().startsWith('🌤️') || line.trim().startsWith('🔐')) {
      const match = line.trim().match(/^(.)\s+(.+?)(?:\s+\((.+)\))?$/u);
      if (match) {
        entries.push({
          icon: match[1],
          name: match[2].trim(),
          status: section === 'ready' ? 'ready' : section === 'missing' ? 'missing' : 'disabled',
          requirements: match[3],
        });
      }
    }
  }

  return { total, eligible, disabled, blocked, missingReqs, entries };
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<OpenClawStatus | { error: string }>
) {
  try {
    // Get version
    let version: string | null = null;
    try {
      const { stdout } = await execAsync('openclaw --version 2>/dev/null');
      version = stdout.trim();
    } catch { /* not installed */ }

    // Check gateway
    let gatewayOnline = false;
    try {
      const { stdout } = await execAsync('lsof -i :18789 -t 2>/dev/null');
      gatewayOnline = !!stdout.trim();
    } catch { /* offline */ }

    // Get default model
    let defaultModel: string | null = null;
    try {
      const { stdout } = await execAsync('cat ~/.openclaw/openclaw.json 2>/dev/null');
      const config = JSON.parse(stdout);
      defaultModel = config?.model || config?.defaultModel || null;
    } catch { /* no config */ }

    // Skills check
    let skills: OpenClawStatus['skills'] = { total: 0, eligible: 0, disabled: 0, blocked: 0, missingReqs: 0, entries: [] };
    try {
      const { stdout } = await execAsync('openclaw skills check 2>/dev/null');
      skills = parseSkillsCheck(stdout);
    } catch { /* skills check failed */ }

    res.status(200).json({
      version,
      gatewayOnline,
      defaultModel,
      skills,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
