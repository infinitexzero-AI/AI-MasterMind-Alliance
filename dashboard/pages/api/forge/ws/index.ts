import { NextApiRequest, NextApiResponse } from "next";
import { createProxyServer } from "http-proxy";

const proxy = createProxyServer({
  target: "http://localhost:3001",
  ws: true
});

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  proxy.web(req, res);
}

export function upgrade(req: any, socket: any, head: any) {
  proxy.ws(req, socket, head);
}
