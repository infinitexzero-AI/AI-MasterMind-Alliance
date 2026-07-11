/// <reference types="chrome"/>

// Background Service Worker for Nexus Browser Assistant

// The Legacy Nexus Dashboard runs on port 3007 (see ecosystem.config.js).
const DASHBOARD_URL = 'http://localhost:3007';
const TEACH_ENDPOINT = `${DASHBOARD_URL}/api/teach-mode`;

interface RecordedAction {
  type: string;
  selector: string;
  tagName?: string;
  timestamp: number;
  url: string;
  value?: string | null;
  text?: string | null;
}

// In-memory recording session. A "skill" is one full session of actions,
// not a single click — so we buffer here and flush the whole sequence on stop.
let session: { startedAt: number; steps: RecordedAction[] } | null = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Nexus Browser Assistant Installed');

  chrome.storage.local.get(['savedTabGroups', 'routines', 'tasks', 'skills'], (result) => {
    if (!result.savedTabGroups) chrome.storage.local.set({ savedTabGroups: [] });
    if (!result.routines) chrome.storage.local.set({ routines: [] });
    if (!result.tasks) chrome.storage.local.set({ tasks: [] });
    if (!result.skills) chrome.storage.local.set({ skills: [] });
  });
});

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case 'save_all_tabs':
      saveAllTabs().then(() => sendResponse({ status: 'success' }));
      return true;

    case 'teach_session':
      // value === true  -> start a new recording session
      // value === false -> stop and flush the session to the dashboard
      if (request.value) {
        startSession();
        sendResponse({ status: 'success', recording: true });
      } else {
        endSession(request.name)
          .then((skill) => sendResponse({ status: 'success', skill }))
          .catch((err) => sendResponse({ status: 'error', error: err.message }));
      }
      return true;

    case 'log_teach_action':
      bufferAction(request.payload);
      sendResponse({ status: 'buffered', count: session?.steps.length ?? 0 });
      return true;

    case 'get_skills':
      fetchSkills()
        .then((skills) => sendResponse({ status: 'success', skills }))
        .catch((err) => sendResponse({ status: 'error', error: err.message }));
      return true;

    default:
      return false;
  }
});

function startSession() {
  session = { startedAt: Date.now(), steps: [] };
  console.log('Nexus Teach Mode: session started');
}

function bufferAction(payload: RecordedAction) {
  if (!session) {
    // Actions arriving without a session (e.g. toggle wired only to content):
    // open one lazily so nothing is lost.
    startSession();
  }
  session!.steps.push(payload);
}

async function endSession(name?: string) {
  const current = session;
  session = null;

  if (!current || current.steps.length === 0) {
    console.log('Nexus Teach Mode: session ended with no steps; nothing to send');
    return null;
  }

  const skill = await sendSequenceToDashboard(current.steps, name);

  // Cache the returned skill locally so the popup/Nexus Tabs page can show the
  // Skills Inventory even when the dashboard is offline.
  if (skill) {
    const result = await chrome.storage.local.get('skills');
    const skills: any[] = Array.isArray(result.skills) ? result.skills : [];
    await chrome.storage.local.set({ skills: [skill, ...skills] });
  }
  return skill;
}

async function saveAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  const tabsToSave = tabs.filter((tab) => !tab.active && !tab.url?.startsWith('chrome://'));

  if (tabsToSave.length === 0) return;

  const tabData = tabsToSave.map((t) => ({
    title: t.title,
    url: t.url,
    favIconUrl: t.favIconUrl,
  }));

  const newGroup = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    tabs: tabData,
  };

  const result = await chrome.storage.local.get('savedTabGroups');
  const groups: any[] = Array.isArray(result.savedTabGroups) ? result.savedTabGroups : [];
  await chrome.storage.local.set({ savedTabGroups: [newGroup, ...groups] });

  const tabIds = tabsToSave.map((t) => t.id).filter((id) => id !== undefined) as number[];
  await chrome.tabs.remove(tabIds);

  const nexusTabsUrl = chrome.runtime.getURL('src/pages/nexus-tabs/index.html');
  const existingNexusTabs = await chrome.tabs.query({ url: nexusTabsUrl });

  if (existingNexusTabs.length > 0 && existingNexusTabs[0].id) {
    chrome.tabs.update(existingNexusTabs[0].id, { active: true });
  } else {
    chrome.tabs.create({ url: nexusTabsUrl });
  }
}

// POST the full recorded sequence to the Mode 6 bridge endpoint.
async function sendSequenceToDashboard(steps: RecordedAction[], name?: string) {
  try {
    const response = await fetch(TEACH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, steps }),
    });
    if (!response.ok) {
      throw new Error(`Dashboard responded ${response.status}`);
    }
    const data = await response.json();
    console.log('Nexus Teach Mode: skill created', data?.skill?.id);
    return data?.skill ?? null;
  } catch (error) {
    console.error('Error sending sequence to Nexus Dashboard', error);
    throw error;
  }
}

// GET the Skills Inventory from the dashboard.
async function fetchSkills() {
  const response = await fetch(TEACH_ENDPOINT, { method: 'GET' });
  if (!response.ok) throw new Error(`Dashboard responded ${response.status}`);
  const data = await response.json();
  return data?.skills ?? [];
}
