import type { NextApiRequest, NextApiResponse } from 'next';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

// Reusing existing local vector store
import { localVectorStore } from '../../../lib/local_vector_store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        console.log(`[Scraper] Fetching: ${url}`);
        const response = await fetch(url, {
            headers: {
                // Mimic a standard browser to prevent immediate 403s on simple sites
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and media embedded content for clean text
        $('script, style, noscript, iframe, img, svg, video').remove();

        const title = $('title').text() || url;
        let textContent = $('body').text();
        
        // Clean up whitespace
        textContent = textContent.replace(/\s+/g, ' ').trim();

        if (textContent.length < 50) {
            return res.status(400).json({ error: 'Extracted text is too short or page is heavily gated.' });
        }

        // Add to standard vault index
        // We'll simulate storing it in the vault via the existing embed logic
        const mdContent = `# Source: ${title}\nURL: ${url}\n\n${textContent}`;
        
        // Call local embed endpoint
        const embedRes = await fetch('http://localhost:3000/api/intelligence/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: mdContent,
                metadata: {
                    source: 'headless-scraper',
                    url: url,
                    title: title,
                    timestamp: new Date().toISOString()
                }
            })
        });

        if (!embedRes.ok) {
            throw new Error('Failed to embed scraped content into vector vault');
        }

        res.status(200).json({
            success: true,
            title,
            charsExtracted: textContent.length,
            message: 'Successfully scraped and embedded URL'
        });

    } catch (error) {
        console.error('[Scraper] Error:', error);
        res.status(500).json({ error: 'Scraping failed', details: (error as Error).message });
    }
}
