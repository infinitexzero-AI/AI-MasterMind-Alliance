import { NextApiRequest, NextApiResponse } from 'next';
import bus from "../../../../forge-monitor/bus/messageBus";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  const { command } = req.body;

  bus.publish(command);
  res.status(200).json({ ok: true, command });
}
