import fs from 'fs';

const EXA_API_KEY = "27d30130-2c1b-4065-b569-66874dc5efcb";
const url = 'https://api.exa.ai/search';

const queries = [
    { name: 'GENS_Q1', text: "Academic papers on Petitcodiac River ecological restoration and Mi'kmaq Indigenous knowledge Two-Eyed Seeing." },
    { name: 'GENS_Q2', text: "Recent research on polycentric governance and adaptive co-management in watershed ecosystems in Canada." },
    { name: 'HLTH_Q1', text: "Recent peer-reviewed studies on neuroinflammation, astrocytic dysfunction, and major depressive disorder." },
    { name: 'HLTH_Q2', text: "Research papers on tele-psychiatry parity, digital health interventions, and cultural safety for mental health in rural Canada." }
];

async function run() {
    const results = {};
    for (const q of queries) {
        console.log(`Searching Exa AI: ${q.name}`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-api-key': EXA_API_KEY
                },
                body: JSON.stringify({
                    query: q.text,
                    numResults: 3,
                    useAutoprompt: true,
                    contents: { text: { maxCharacters: 1000 } }
                })
            });
            const data = await response.json();
            results[q.name] = data.results || [];
        } catch (e) {
            console.error(`Failed ${q.name}:`, e);
        }
    }
    fs.writeFileSync('/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/exa_intelligence_results.json', JSON.stringify(results, null, 2));
    console.log("Intelligence payload saved to exa_intelligence_results.json");
}

run();
