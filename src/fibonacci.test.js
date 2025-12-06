/**
 * Test file for the Fibonacci function
 * Run with: node fibonacci.test.js
 */

const fibonacci = require('./fibonacci');

// Test cases
const testCases = [
    { input: 0, expected: [] },
    { input: 1, expected: [0] },
    { input: 2, expected: [0, 1] },
    { input: 5, expected: [0, 1, 1, 2, 3] },
    { input: 10, expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34] }
];

console.log('🧪 Running Fibonacci function tests...\n');

// Run basic functionality tests
testCases.forEach((testCase, index) => {
    try {
        const result = fibonacci(testCase.input);
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        
        console.log(`Test ${index + 1}: fibonacci(${testCase.input})`);
        console.log(`Expected: [${testCase.expected.join(', ')}]`);
        console.log(`Got:      [${result.join(', ')}]`);
        console.log(`Status:   ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);
    } catch (error) {
        console.log(`Test ${index + 1}: fibonacci(${testCase.input})`);
        console.log(`Status:   ❌ FAILED - ${error.message}\n`);
    }
});

// Test input validation
console.log('🔍 Testing input validation...\n');

const invalidInputs = [
    { input: -1, description: 'negative number' },
    { input: 3.14, description: 'decimal number' },
    { input: 'hello', description: 'string' },
    { input: null, description: 'null' },
    { input: undefined, description: 'undefined' }
];

invalidInputs.forEach((testCase, index) => {
    try {
        fibonacci(testCase.input);
        console.log(`Validation Test ${index + 1}: ${testCase.description}`);
        console.log(`Status: ❌ FAILED - Should have thrown an error\n`);
    } catch (error) {
        console.log(`Validation Test ${index + 1}: ${testCase.description}`);
        console.log(`Status: ✅ PASSED - Correctly threw: ${error.message}\n`);
    }
});

console.log('🎉 Test suite completed!');
