
import fetch from 'node-fetch';

export interface LinearIssue {
    id: string;
    title: string;
    state: { name: string };
}

interface LinearResponse {
    data?: {
        issues?: {
            nodes: LinearIssue[];
        };
    };
}

export class LinearTool {
    private key: string;

    constructor() {
        this.key = process.env.LINEAR_API_KEY || 'lin_api_kixkKq19svaOCAVZdX9WqjltygY2voKqHwYT6f4c';
    }

    async createIssue(title: string, description: string): Promise<string> {
        // query was unused here in the mock, removed it
        
        // Note: TeamID is mocked here. In real implementation, we'd fetch it or use config.
        console.log('[LinearTool] (Mock) Creating issue:', title, description);
        return "https://linear.app/issue/L-123 (Simulated)";
    }
    
    async getMyIssues(): Promise<LinearIssue[]> {
        const query = `
            query {
                issues(first: 5, filter: { assignee: { isMe: true } }) {
                    nodes {
                        id
                        title
                        state { name }
                    }
                }
            }
        `;
        try {
            const response = await fetch('https://api.linear.app/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': this.key },
                body: JSON.stringify({ query })
            });
            const data = await response.json() as LinearResponse;
            return data.data?.issues?.nodes || [];
        } catch (e) {
            console.error('[LinearTool] Error fetching issues:', e);
            return [];
        }
    }
}

export class GitHubTool {
    private token: string;

    constructor() {
        this.token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || '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';
    }

    async createPR(title: string, body: string, head: string, base: string = 'main') {
        console.log(`[GitHubTool] Creating PR: ${title} from ${head} to ${base}`);
        // Logic to create PR via simple fetch
        // For safety in this automated loop, we'll start with a read-only check or simulation
        // to prevent spamming PRs until fully trusted.
        // Used 'body' here just to silence unused var if we were using it, but it is just a log in mock.
        return { url: "https://github.com/simulated/pr/1", status: "simulated" };
    }
    
    async getMyPRs() {
         try {
            const response = await fetch('https://api.github.com/search/issues?q=is:pr+author:@me+state:open', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'User-Agent': 'Antigravity-Mode6'
                }
            });
            const data = await response.json() as { items?: unknown[] };
            return data.items || [];
         } catch (e) {
             console.error('[GitHubTool] Error:', e);
             return [];
         }
    }
}
