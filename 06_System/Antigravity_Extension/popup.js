// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  
  function updateStatus(text, type = 'normal') {
    statusDiv.textContent = text;
    statusDiv.className = type;
  }

  function sendToBridge(command, data = {}) {
    updateStatus(`Sending ${command}...`);
    chrome.runtime.sendMessage({
      type: "SEND_TO_BRIDGE",
      payload: { command, ...data }
    }, (response) => {
      // The background script confirms it *sent* the message, 
      // but the *response* from the bridge comes asynchronously via runtime.onMessage
    });
  }

  // Listen for responses relayed from background.js
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "BRIDGE_RESPONSE") {
      const bridgeData = msg.payload;
      console.log("Bridge response:", bridgeData);
      
      if (bridgeData.error) {
        updateStatus(`Error: ${bridgeData.error}`, 'error');
      } else if (bridgeData.response) {
         // Formatting response for display
         const display = typeof bridgeData.response === 'object' 
           ? JSON.stringify(bridgeData.response) 
           : bridgeData.response;
        updateStatus(`Bridge: ${display}`, 'active');
      }
    }
  });

  // Buttons
  document.getElementById('pingBtn').addEventListener('click', () => {
    sendToBridge("PING");
  });

  document.getElementById('statsBtn').addEventListener('click', () => {
    sendToBridge("GET_SYSTEM_STATS");
  });

  document.getElementById('studyBtn').addEventListener('click', () => {
    sendToBridge("EXECUTE_SCRIPT", { script: "study_sanctum.scpt" });
  });

  document.getElementById('automationBtn').addEventListener('click', () => {
    sendToBridge("ACTIVATE_AUTOMATION");
  });

  document.getElementById('contextBtn').addEventListener('click', () => {
    sendToBridge("READ_CONTEXT");
  });

  document.getElementById('dockerBtn').addEventListener('click', () => {
    sendToBridge("LAUNCH_DOCKER");
  });

  // Handle Clipboard Copy for Context
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "BRIDGE_RESPONSE" && msg.payload.response && msg.payload.response.context) {
        const text = msg.payload.response.context;
        navigator.clipboard.writeText(text).then(() => {
            updateStatus("Context Copied to Clipboard!", 'active');
        }).catch(err => {
            updateStatus("Copy Failed: " + err, 'error');
        });
    }
  });
});
