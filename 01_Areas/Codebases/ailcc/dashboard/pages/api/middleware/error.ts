import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

export type ApiHandler = (_req: NextApiRequest, _res: NextApiResponse) => Promise<void> | void;

/**
 * Global API Error Wrapper designed exclusively for the AILCC Nexus Backend.
 * Automatically enforces Zod Schema constraints, logs Observer Telemetry, 
 * and swallows raw stack traces to return the strict { message, code, details } payload.
 */
export function withErrorHandler(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    try {
      await handler(req, res);
      
      // OBSERVER NODE TELEMETRY - Success
      console.log(JSON.stringify({
          type: "OBSERVER_TELEMETRY",
          route: req.url,
          latency_ms: Date.now() - startTime,
          status: res.statusCode
      }));

    } catch (error: any) {
      const latency = Date.now() - startTime;
      
      let statusCode = 500;
      let message = "Internal Cortex Failure";
      let details = error instanceof Error ? error.message : String(error);

      // Natively catch Zod Interface conflicts
      if (error instanceof ZodError) {
        statusCode = 400;
        message = "Data Contract Violation (Zod)";
        details = JSON.stringify((error as any).errors);
      }

      // OBSERVER NODE TELEMETRY - Failure Route
      console.error(JSON.stringify({
          type: "OBSERVER_TELEMETRY",
          route: req.url,
          latency_ms: latency,
          status: statusCode,
          error_code: error?.code || 'EXECUTION_HALT'
      }));

      // Absolute strict error footprint
      res.status(statusCode).json({
        success: false,
        message,
        code: statusCode,
        details
      });
    }
  };
}
