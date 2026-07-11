// Content script for Nexus "Teach Mode"
let isRecording = false;

// Listen for messages to toggle recording
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'toggle_teach_mode') {
    isRecording = request.value;
    if (isRecording) {
      enableRecording();
    } else {
      disableRecording();
    }
    sendResponse({ status: 'success', recording: isRecording });
  }
});

// CSS.escape fallback for older contexts.
function esc(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/(["\\#.:>~+*\s])/g, '\\$1');
}

// Build a best-effort, replayable selector. Prefers stable identifiers, then
// stable attributes, then a class+nth-of-type fallback that is unique enough to
// re-find the element when the skill is replayed.
function getSelector(el: Element): string {
  if (el.id) return `#${esc(el.id)}`;

  const tag = el.tagName.toLowerCase();

  // Stable attributes commonly used for automation targets.
  for (const attr of ['data-testid', 'name', 'aria-label', 'placeholder']) {
    const val = el.getAttribute(attr);
    if (val) return `${tag}[${attr}="${val}"]`;
  }

  // Class-based, scoped to nth-of-type among siblings for uniqueness.
  let selector = tag;
  if (el.className && typeof el.className === 'string') {
    const classes = el.className.split(' ').filter((c) => c.trim()).map(esc).join('.');
    if (classes) selector = `${tag}.${classes}`;
  }

  const parent = el.parentElement;
  if (parent) {
    const sameType = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
    if (sameType.length > 1) {
      const index = sameType.indexOf(el) + 1;
      selector += `:nth-of-type(${index})`;
    }
  }

  return selector;
}

const interactionHandler = (e: Event) => {
  if (!isRecording) return;
  
  const target = e.target as HTMLElement;
  const action = {
    type: e.type,
    selector: getSelector(target),
    tagName: target.tagName,
    timestamp: Date.now(),
    url: window.location.href,
    value: (target as HTMLInputElement).value || null,
    text: target.innerText?.slice(0, 100) || null
  };

  // Visual feedback
  const originalOutline = target.style.outline;
  target.style.outline = '2px solid #10b981'; // Emerald glow
  setTimeout(() => {
    target.style.outline = originalOutline;
  }, 500);

  // Send action to background script
  chrome.runtime.sendMessage({
    action: 'log_teach_action',
    payload: action
  });
};

function enableRecording() {
  document.addEventListener('click', interactionHandler, true);
  document.addEventListener('change', interactionHandler, true);
  console.log("Nexus Teach Mode: Recording Started");
}

function disableRecording() {
  document.removeEventListener('click', interactionHandler, true);
  document.removeEventListener('change', interactionHandler, true);
  console.log("Nexus Teach Mode: Recording Stopped");
}
