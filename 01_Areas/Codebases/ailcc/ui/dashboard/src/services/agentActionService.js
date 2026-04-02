export const runAction = async (templateId, params) => {
  const response = await fetch('/api/agent_action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ templateId, params }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to run action');
  }

  return response.json();
};
