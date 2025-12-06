/**
 * Example usage of the Fibonacci function
 * Run with: node example.js
 */

const fibonacci = require('./fibonacci');

console.log('🔢 Fibonacci Sequence Generator\n');

// Example 1: Generate first 8 Fibonacci numbers
console.log('Example 1: First 8 Fibonacci numbers');
const result1 = fibonacci(8);
console.log(`fibonacci(8) = [${result1.join(', ')}]\n`);

// Example 2: Generate first 12 Fibonacci numbers
console.log('Example 2: First 12 Fibonacci numbers');
const result2 = fibonacci(12);
console.log(`fibonacci(12) = [${result2.join(', ')}]\n`);

// Example 3: Edge cases
console.log('Example 3: Edge cases');
console.log(`fibonacci(0) = [${fibonacci(0).join(', ')}] (empty array)`);
console.log(`fibonacci(1) = [${fibonacci(1).join(', ')}] (just the first number)`);
console.log(`fibonacci(2) = [${fibonacci(2).join(', ')}] (first two numbers)\n`);

// Example 4: Error handling
console.log('Example 4: Error handling');
try {
    fibonacci(-5);
} catch (error) {
    console.log(`fibonacci(-5) throws: ${error.message}`);
}

try {
    fibonacci('hello');
} catch (error) {
    console.log(`fibonacci('hello') throws: ${error.message}`);
}

try {
    fibonacci(3.14);
} catch (error) {
    console.log(`fibonacci(3.14) throws: ${error.message}`);
}

console.log('\n✨ All examples completed!');
