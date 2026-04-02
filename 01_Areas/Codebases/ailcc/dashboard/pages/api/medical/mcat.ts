import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { topic, syllabusText } = req.body;
  if (!topic || !syllabusText) {
    return res.status(400).json({ error: 'Topic and SyllabusText are missing.' });
  }

  // Write the text to a temporary file for the Python script to read safely
  const tempFilePath = path.join(os.tmpdir(), `mcat_temp_${Date.now()}.txt`);
  fs.writeFileSync(tempFilePath, syllabusText);

  const SCRIPT_PATH = path.join(process.cwd(), '../scripts/medical_cli.py');
  const PYTHON_BIN = path.join(process.cwd(), '../.venv/bin/python');

  // Spawn the execution string
  const safeTopic = topic.replace(/"/g, '\\"');
  const cmd = `${PYTHON_BIN} ${SCRIPT_PATH} mcat_anki "${tempFilePath}" "${safeTopic}"`;

  exec(cmd, (error, stdout, stderr) => {
    // Delete temp file asynchronously
    fs.unlink(tempFilePath, () => {});

    try {
      if (error) throw new Error(stderr || error.message);
      const data = JSON.parse(stdout.trim());
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: String(err), stdout });
    }
  });
}
