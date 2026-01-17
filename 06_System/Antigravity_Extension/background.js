// background.js - Antigravity Service Worker

const NATIVE_HOST_NAME = "com.ailcc.antigravity.bridge";
let port = null;

// core: connect to native bridge
function connectToBridge() {
  console.log("Connecting to Native Bridge: " + NATIVE_HOST_NAME);
  try {
    port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
    
    port.onMessage.addListener((msg) => {
      console.log("Received from Bridge:", msg);
      // Broadcast to popup or content scripts if needed
      chrome.runtime.sendMessage({ type: "BRIDGE_RESPONSE", payload: msg });
    });

    port.onDisconnect.addListener(() => {
      console.log("Bridge Disconnected:", chrome.runtime.lastError?.message);
      port = null;
    });
  } catch (e) {
    console.error("Bridge connection failure:", e);
  }
}

// listener: handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SEND_TO_BRIDGE") {
    if (!port) connectToBridge();
    
    if (port) {
      port.postMessage(request.payload);
      sendResponse({ status: "Sent to bridge" });
    } else {
      sendResponse({ status: "Error: Bridge not connected" });
    }
  }
  return true; // Keep channel open for async response
});

// on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Antigravity Link Installed.");
});
