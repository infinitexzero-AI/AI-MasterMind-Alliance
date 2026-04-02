import type { NextApiRequest, NextApiResponse } from 'next';
import { scheduleRoutine, RoutineParams } from '../../../lib/routine-generator';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const params: RoutineParams = req.body;

        if (!params.energy || !params.tasks) {
            return res.status(400).json({ error: 'Missing energy or tasks' });
        }

        const optimized = scheduleRoutine(params);

        return res.status(200).json(optimized);
    } catch (error) {
        console.error('Routine generation failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
