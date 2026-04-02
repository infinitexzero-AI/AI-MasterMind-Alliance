import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, WebhookPayload, CreateTaskRequest } from '../../../types/api.types';
import { withRateLimit } from '../../../lib/rateLimiter';
import { corsHeaders } from '../../../lib/cors';
import { TaskQueue } from '../../../lib/taskQueue';
import { logApiCall } from '../../../lib/logger';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  const source = Buffer.from(signature);
  const target = Buffer.from(expectedSignature);

  if (source.length !== target.length) {
    return false;
  }

  return crypto.timingSafeEqual(source, target);
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ received: boolean; taskId: string }>>
) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const webhookData: WebhookPayload = req.body;
    const { source, payload, signature } = webhookData;

    if (!source || !payload || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: source, payload, signature',
        timestamp: new Date().toISOString()
      });
    }

    // Verify HMAC signature
    const secret = process.env.WEBHOOK_SECRET || 'nexus-webhook-secret-change-in-production';
    const payloadString = JSON.stringify(payload);
    
    if (!verifySignature(payloadString, signature, secret)) {
      logApiCall('/api/webhooks/external', source, 'POST', 401, 'invalid signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
        timestamp: new Date().toISOString()
      });
    }

    // Parse payload and create task
    const taskRequest: CreateTaskRequest = {
      title: payload.title || `Webhook from ${source}`,
      context: payload.context || JSON.stringify(payload),
      priority: payload.priority || 'medium',
      targetAgent: payload.targetAgent || 'OmniRouter',
      source: 'grok', // Webhooks typically come from external sources
      metadata: {
        webhookSource: source,
        originalPayload: payload
      }
    };

    const task = TaskQueue.create(taskRequest);

    logApiCall('/api/webhooks/external', source, 'POST', 200, task.taskId);

    return res.status(200).json({
      success: true,
      data: {
        received: true,
        taskId: task.taskId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiCall('/api/webhooks/external', 'unknown', 'POST', 500, (error as Error).message);
    
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${(error as Error).message}`,
      timestamp: new Date().toISOString()
    });
  }
}

export default withRateLimit(handler);
