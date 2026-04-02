// Antigravity Chrome Side-Cart: Background Service Worker
const WS_URL = 'ws://localhost:3001';
let socket = null;

function connect() {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
        console.log('✅ Connected to Antigravity Neural Uplink (Port 3001)');
        broadcastState();
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    };

    socket.onclose = () => {
        console.warn('⚠️ Disconnected from Antigravity. Retrying in 5s...');
        setTimeout(connect, 5000);
    };

    socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
    };
}

function handleIncomingMessage(msg) {
    console.log('Received from Dashboard:', msg);
    
    if (msg.type === 'CHROME_CMD') {
        if (msg.action === 'OPEN_TAB') {
            chrome.tabs.create({ url: msg.url });
        } else if (msg.action === 'GET_TABS') {
            broadcastState();
        }
    }
}

async function broadcastState() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const tabs = await chrome.tabs.query({});
    const bookmarks = await chrome.bookmarks.getTree();

    const payload = {
        type: 'CHROME_SYNC_UPDATE',
        agent: 'AI_CHROME_AGENT',
        timestamp: new Date().toISOString(),
        data: {
            tabs: tabs.map(t => ({ title: t.title, url: t.url, active: t.active })),
            bookmarkCount: countBookmarks(bookmarks[0])
        }
    };

    socket.send(JSON.stringify(payload));
}

function countBookmarks(node) {
    let count = 0;
    if (node.children) {
        node.children.forEach(c => count += countBookmarks(c));
    } else if (node.url) {
        count = 1;
    }
    return count;
}

// Listen for tab updates to trigger sync
chrome.tabs.onUpdated.addListener(broadcastState);
chrome.tabs.onRemoved.addListener(broadcastState);

// Initial connect
connect();
