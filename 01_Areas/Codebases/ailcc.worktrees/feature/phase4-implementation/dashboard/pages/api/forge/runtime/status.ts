import { NextApiRequest, NextApiResponse } from "next";
/**
 * Proxy to in-repo runtime status for local/dev (deterministic mock).
 * In production this should call the runtime process or supervisor endpoint.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // Connect to real runtime status
  // Path: status.ts -> runtime -> forge -> api -> pages -> dashboard -> (root) -> forge-monitor -> runtime
  try {
    const runtime = require("../../../../../../forge-monitor/runtime").default;
    res.status(200).json(runtime.status());
  } catch (e: any) {
    res.status(500).json({ error: String(e.message), running: false });
  }
}
