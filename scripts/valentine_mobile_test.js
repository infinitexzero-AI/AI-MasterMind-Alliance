const fetch = require('node-fetch');

async function sendTestCommand() {
    const omniCommand = {
        type: 'OMNI_COMMAND',
        command: 'OPTIMIZE',
        payload: {
            target: 'VAULT_INTELLIGENCE',
            User: 'Valentine (Mobile Node)'
        }
    };

    try {
        // Direct to Orchestrator (WebSocket simulation via HTTP or direct script if WS client)
        // For this test, we hit the Siri API which routes to internal logic or logs it
        const response = await fetch('http://localhost:3000/api/dispatch/siri', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                intent: 'OPTIMIZE_VAULT', // Mapping OMNI 'OPTIMIZE' to Siri Intent for broad test
                target: '/Users/infinite27/AILCC_PRIME/03_Intelligence_Vault'
            })
        });

        const data = await response.json();
        console.log('Mobile Command Result:', data);
    } catch (error) {
        console.error('Failed to send mobile command:', error);
    }
}

sendTestCommand();
