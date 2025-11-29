// Enhanced: Silence known adapter API-key / mock-mode warnings during tests
// Keeps other warnings intact while removing noisy, expected adapter messages.
const originalWarn = console.warn;

const adapterWarningRegex = /(?:OPENAI|ANTHROPIC|XAI|CLAUDE|GROK|Grok|Claude).*?(?:API_KEY not set|adapter will operate in mock mode)/i;
const generalMockModeRegex = /adapter will operate in mock mode/i;

console.warn = (...args: any[]) => {
  const first = args[0] ?? '';

  if (typeof first === 'string') {
    if (adapterWarningRegex.test(first) || generalMockModeRegex.test(first)) {
      return; // swallow known/expected adapter warnings in test runs
    }
  }

  originalWarn(...args);
};
