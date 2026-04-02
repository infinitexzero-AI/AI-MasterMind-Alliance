import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SCRIPT_PATH = path.join(process.cwd(), '../scripts/medical_cli.py');
  // Use the established Vanguard Python virtual environment
  const PYTHON_BIN = path.join(process.cwd(), '../.venv/bin/python');

  if (req.method === 'GET') {
    // Generate Scenario
    exec(`${PYTHON_BIN} ${SCRIPT_PATH} casper_generate`, (error, stdout, stderr) => {
      try {
        if (error) throw new Error(stderr || error.message);
        const data = JSON.parse(stdout.trim());
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });

  } else if (req.method === 'POST') {
    // Grade Response
    const { scenario, response } = req.body;
    
    if (!scenario || !response) {
      return res.status(400).json({ error: 'Scenario and Response text are required.' });
    }

    // Escape strings for CLI safely
    const safeScenario = scenario.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const safeResponse = response.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const cmd = `${PYTHON_BIN} ${SCRIPT_PATH} casper_grade "${safeScenario}" "${safeResponse}"`;

    exec(cmd, (error, stdout, stderr) => {
      try {
        if (error) throw new Error(stderr || error.message);
        const data = JSON.parse(stdout.trim());
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: String(err), stdout });
      }
    });

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
