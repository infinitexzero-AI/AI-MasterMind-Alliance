import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Map absolute path to the Epoch 31 Semantic Synthesis output artifact folder
  const reviewsPath = path.resolve(process.cwd(), '../../hippocampus_storage/literature_reviews');
  
  if (fs.existsSync(reviewsPath)) {
    try {
      const files = fs.readdirSync(reviewsPath).filter(f => f.endsWith('.md'));
      
      const reviews = files.map(file => {
        const filePath = path.join(reviewsPath, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract Title from Header block
        const titleMatch = content.match(/# (.*?)\\n/);
        const title = titleMatch ? titleMatch[1].replace('Autonomous Pre-Research:', '').replace('Literature Review:', '').trim() : file.replace('.md', '');
        
        return {
          filename: file,
          title: title,
          date: stats.mtime.toISOString(),
          snippet: content.substring(0, 300).replace(/---[\\s\\S]*?---/, '').substring(0, 150) + "..."
        };
      });

      // Sort by newest first
      reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      res.status(200).json({ success: true, reviews });
      return;
    } catch (error) {
      console.error("[ReviewsAPI] Extraction error:", error);
      res.status(500).json({ success: false, error: "Failed to map Synthesis Arrays." });
      return;
    }
  }

  // Fallback empty D3 node list 
  res.status(200).json({ success: true, reviews: [] });
}
