import { useEffect, useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

interface TabData {
  title: string;
  url: string;
  favIconUrl?: string;
}

interface TabGroup {
  id: string;
  timestamp: number;
  tabs: TabData[];
}

function App() {
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([]);

  useEffect(() => {
    // Load from local storage
    chrome.storage.local.get(['savedTabGroups'], (result) => {
      if (result.savedTabGroups) {
        setTabGroups(result.savedTabGroups as TabGroup[]);
      }
    });

    // Listen for storage changes
    const listener = (changes: any) => {
      if (changes.savedTabGroups) {
        setTabGroups(changes.savedTabGroups.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const restoreGroup = async (group: TabGroup) => {
    // Open all tabs in a new window
    chrome.windows.create({ url: group.tabs.map(t => t.url) });
    // Remove group from storage
    deleteGroup(group.id);
  };

  const deleteGroup = (id: string) => {
    const updated = tabGroups.filter(g => g.id !== id);
    setTabGroups(updated);
    chrome.storage.local.set({ savedTabGroups: updated });
  };

  const deleteTab = (groupId: string, tabIndex: number) => {
    const group = tabGroups.find(g => g.id === groupId);
    if (!group) return;
    
    const newTabs = [...group.tabs];
    newTabs.splice(tabIndex, 1);
    
    let updated: TabGroup[];
    if (newTabs.length === 0) {
      updated = tabGroups.filter(g => g.id !== groupId);
    } else {
      updated = tabGroups.map(g => g.id === groupId ? { ...g, tabs: newTabs } : g);
    }
    
    setTabGroups(updated);
    chrome.storage.local.set({ savedTabGroups: updated });
  };

  return (
    <div className="wrap">
      <header>
        <h1>Nexus Tabs</h1>
        <div className="sub">Memory-saving tab management & routines</div>
      </header>

      <main>
        {tabGroups.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--muted)' }}>No saved tabs yet. Use the Nexus extension popup to save your open tabs.</p>
          </div>
        ) : (
          tabGroups.map(group => (
            <div key={group.id} className="glass-card">
              <div className="tab-group-header">
                <h2>{group.tabs.length} tabs 
                  <span style={{ fontSize: '14px', color: 'var(--muted)', marginLeft: '12px', fontWeight: 'normal' }}>
                    {new Date(group.timestamp).toLocaleString()}
                  </span>
                </h2>
                <div className="group-actions">
                  <button onClick={() => restoreGroup(group)}>
                    <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }}/>
                    Restore all
                  </button>
                  <button onClick={() => deleteGroup(group.id)} style={{ background: 'transparent', color: 'var(--danger)', marginLeft: '12px' }}>
                    Delete
                  </button>
                </div>
              </div>
              <ul className="tab-list">
                {group.tabs.map((tab, idx) => (
                  <li key={idx} className="tab-item">
                    <img src={tab.favIconUrl || 'chrome://favicon/'} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <a href={tab.url} target="_blank" rel="noopener noreferrer">{tab.title || tab.url}</a>
                    <div className="tab-actions">
                      <button onClick={() => deleteTab(group.id, idx)} title="Delete tab">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
