import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from './middleware/error';
import { ScholarGraphRequestSchema } from '../../shared/schemas';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  ScholarGraphRequestSchema.parse(req.query);

  const graphPath = path.resolve(process.cwd(), '../../hippocampus_storage/intelligence/scholar_graph.json');
  
  if (!fs.existsSync(graphPath)) {
      res.status(200).json({ nodes: [], links: [] });
      return;
  }

  const fileData = fs.readFileSync(graphPath, 'utf8');
  const graphData = JSON.parse(fileData);
  
  const formattedLinks = (graphData.links || []).map((link: any) => ({
    source: link.source,
    target: link.target,
    relationship: link.relationship
  }));

  res.status(200).json({ nodes: graphData.nodes || [], links: formattedLinks });
}

export default withErrorHandler(handler);
