import type { NextApiRequest, NextApiResponse } from 'next';

interface ErrorReport {
    timestamp: string;
    error: {
        message: string;
        stack?: string;
        name: string;
    };
    componentStack?: string;
    userAgent: string;
    url: string;
}

/**
 * Error Reporting API Endpoint
 * 
 * Receives error reports from ErrorBoundary and logs them
 * Future: Send to monitoring service (Sentry, LogRocket, etc.)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const errorReport: ErrorReport = req.body;

        // Log to console (in production, send to monitoring service)
        console.error('🚨 Client Error Report:', {
            timestamp: errorReport.timestamp,
            error: errorReport.error.message,
            url: errorReport.url,
            userAgent: errorReport.userAgent,
        });

        // Log full stack trace
        if (errorReport.error.stack) {
            console.error('Stack trace:', errorReport.error.stack);
        }

        if (errorReport.componentStack) {
            console.error('Component stack:', errorReport.componentStack);
        }

        // TODO: Send to monitoring service
        // await sendToSentry(errorReport);
        // await sendToLogRocket(errorReport);

        // TODO: Store in database for analysis
        // await db.errors.create({ data: errorReport });

        // TODO: Alert on critical errors
        // if (isCritical(errorReport)) {
        //     await sendAlert(errorReport);
        // }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to process error report:', error);
        return res.status(500).json({ error: 'Failed to process error report' });
    }
}
