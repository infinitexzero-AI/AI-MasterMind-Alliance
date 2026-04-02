import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

/**
 * 📱 Mobile Bridge API
 * 
 * Secure entry point for mobile device registration and cortex notification 
 * handshake. This allows external companion apps to safely link with the 
 * Sovereign Nexus.
 */

// In-memory registry (should be persisted to Redis/DB in a full deployment)
const REGISTERED_DEVICES: Record<string, any> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'POST':
            // 1. Device Registration
            const { deviceName, deviceType, pushToken } = req.body;

            if (!deviceName) {
                return res.status(400).json({ error: 'Missing deviceName' });
            }

            const deviceId = uuidv4();
            const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

            REGISTERED_DEVICES[deviceId] = {
                id: deviceId,
                name: deviceName,
                type: deviceType || 'UNKNOWN',
                token: pushToken,
                registeredAt: new Date().toISOString(),
                status: 'PENDING_VERIFICATION'
            };

            console.log(`[MobileBridge] 📱 New device registration request: ${deviceName} (${deviceId})`);

            return res.status(201).json({
                deviceId,
                pairingCode,
                wsEndpoint: '/api/ws',
                message: 'Device registration initiated. Use the pairing code to link via the Nexus Dashboard.'
            });

        case 'GET':
            // 2. Heartbeat / Status Check
            return res.status(200).json({
                status: 'OPERATIONAL',
                bridgeVersion: '1.0.0-sprint102',
                timestamp: new Date().toISOString()
            });

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
