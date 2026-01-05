'use server';

interface CreateIssueResult {
    success: boolean;
    error?: string;
    issue?: {
        id: string;
        title: string;
        url: string;
    };
}

export async function createLinearIssue(title: string, description?: string, priority: number = 0): Promise<CreateIssueResult> {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    console.error('LINEAR_API_KEY is missing');
    return { success: false, error: 'LINEAR_API_KEY not configured on server' };
  }

  try {
     // 1. Get Team ID (Pick the first one found for now)
     const teamQuery = `query { teams(first: 1) { nodes { id name } } }`;
     
     const teamRes = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey
        },
        body: JSON.stringify({ query: teamQuery }),
        cache: 'no-store'
     });

     const teamData = await teamRes.json();
     const teamId = teamData.data?.teams?.nodes?.[0]?.id;

     if (!teamId) {
         return { success: false, error: 'No Linear team found to create issue in.' };
     }

     // 2. Create Issue
     const mutation = `
        mutation IssueCreate($title: String!, $description: String, $priority: Int, $teamId: String!) {
          issueCreate(
            input: {
              title: $title
              description: $description
              priority: $priority
              teamId: $teamId
            }
          ) {
            success
            issue {
              id
              title
              url
            }
          }
        }
      `;

     const res = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey
        },
        body: JSON.stringify({
            query: mutation,
            variables: {
                title,
                description,
                priority: Number(priority),
                teamId
            }
        }),
        cache: 'no-store'
     });

     const data = await res.json();
     
     if (data.errors) {
         console.error('Linear API Error:', data.errors);
         return { success: false, error: data.errors[0]?.message || 'Unknown Linear error' };
     }

     const createdIssue = data.data?.issueCreate?.issue;
     if (!createdIssue) {
         return { success: false, error: 'Issue creation failed (no issue returned)' };
     }

     return { success: true, issue: createdIssue };

  } catch (error: unknown) {
      console.error('createLinearIssue Exception:', error);
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg };
  }
}
