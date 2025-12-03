/**
 * Calculates the Fibonacci sequence up to n terms
 * 
 * The Fibonacci sequence is a series of numbers where each number is the sum
 * of the two preceding ones, usually starting with 0 and 1.
 * 
 * @param {number} n - The number of terms to generate in the Fibonacci sequence
 * @returns {number[]} An array containing the first n Fibonacci numbers
 * @throws {Error} When n is not a valid positive integer
 * 
 * @example
 * // Generate first 5 Fibonacci numbers
 * fibonacci(5); // Returns [0, 1, 1, 2, 3]
 * 
 * @example
 * // Generate first 10 Fibonacci numbers
 * fibonacci(10); // Returns [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
 */
function fibonacci(n) {
    // Input validation
    if (typeof n !== 'number') {
        throw new Error('Input must be a number');
    }
    
    if (!Number.isInteger(n)) {
        throw new Error('Input must be an integer');
    }
    
    if (n < 0) {
        throw new Error('Input must be a non-negative integer');
    }
    
    if (n === 0) {
        return [];
    }
    
    if (n === 1) {
        return [0];
    }
    
    // Initialize the sequence with the first two Fibonacci numbers
    const sequence = [0, 1];
    
    // Generate the remaining Fibonacci numbers
    for (let i = 2; i < n; i++) {
        sequence[i] = sequence[i - 1] + sequence[i - 2];
    }
    
    return sequence;
}

// Export the function for use in other modules
module.exports = fibonacci;

// For browser environments or ES6 modules, also provide named export
if (typeof window !== 'undefined') {
    window.fibonacci = fibonacci;
}
