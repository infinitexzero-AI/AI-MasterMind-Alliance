import React, { useState, useEffect } from 'react';
import { Layers, Video, ListTodo, ExternalLink } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Check current recording state (if we saved it in storage or requested from background)
    chrome.storage.local.get(['teachModeRecording'], (res) => {
      if (res.teachModeRecording) setIsRecording(true);
    });
  }, []);

  const saveTabs = () => {
    chrome.runtime.sendMessage({ action: 'save_all_tabs' }, (response) => {
      if (response && response.status === 'success') {
        window.close();
      }
    });
  };

  const openNexusTabs = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/nexus-tabs/index.html') });
  };

  const toggleRecording = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setIsRecording(val);
    chrome.storage.local.set({ teachModeRecording: val });

    // Open/close the recording session in the background worker. On stop, the
    // worker flushes the full sequence to the dashboard and returns the skill.
    const name = val ? undefined : window.prompt('Name this skill (optional):') || undefined;
    chrome.runtime.sendMessage({ action: 'teach_session', value: val, name }, (res) => {
      if (!val && res?.skill) {
        console.log('Skill saved to inventory:', res.skill.name);
      }
    });

    // Tell the active tab's content script to start/stop capturing interactions.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_teach_mode', value: val });
      }
    });
  };

  return (
    <div>
      <h1><Layers size={18} color="var(--secondary)" /> Nexus Assistant</h1>
      
      <div className="button-stack">
        <button className="primary" onClick={saveTabs}>
          <Layers size={18} />
          Convert Tabs to List
        </button>
        
        <button onClick={openNexusTabs}>
          <ExternalLink size={18} />
          Open Nexus Tabs
        </button>

        <button>
          <ListTodo size={18} />
          Today's Routines
        </button>
      </div>

      <div className="toggle-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={18} color={isRecording ? 'var(--accent)' : 'var(--muted)'} />
          <span>Teach Mode</span>
        </div>
        <label className="switch">
          <input type="checkbox" checked={isRecording} onChange={toggleRecording} />
          <span className="slider"></span>
        </label>
      </div>
      
      {isRecording && (
        <p style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
          Recording interactions. Click on elements to teach.
        </p>
      )}
    </div>
  );
}

export default App;
