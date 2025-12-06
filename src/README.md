# Fibonacci Function Implementation

This directory contains a JavaScript implementation of a Fibonacci sequence generator, created as part of the GitHub Copilot integration test (Issue AI-5).

## Files

- **`fibonacci.js`** - Main implementation of the Fibonacci function
- **`fibonacci.test.js`** - Comprehensive test suite
- **`example.js`** - Usage examples and demonstrations
- **`README.md`** - This documentation file

## Function Overview

The `fibonacci(n)` function generates the first `n` numbers in the Fibonacci sequence.

### Features

✅ **Complete JSDoc documentation** with examples and parameter descriptions  
✅ **Comprehensive input validation** for type checking and edge cases  
✅ **Returns array of Fibonacci numbers** as specified  
✅ **Handles edge cases** (n=0, n=1, negative numbers, etc.)  
✅ **Cross-environment compatibility** (Node.js and browser)  

### Usage

```javascript
const fibonacci = require('./fibonacci');

// Generate first 10 Fibonacci numbers
const result = fibonacci(10);
console.log(result); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Input Validation

The function validates input and throws descriptive errors for:
- Non-numeric inputs
- Decimal numbers
- Negative numbers
- null/undefined values

### Testing

Run the test suite:
```bash
node fibonacci.test.js
```

Run the examples:
```bash
node example.js
```

## Implementation Details

- Uses iterative approach for optimal performance
- Handles all edge cases (n=0 returns empty array, n=1 returns [0])
- Includes proper error handling with descriptive messages
- Compatible with both CommonJS (Node.js) and browser environments
- Follows JavaScript best practices and coding standards

## Requirements Fulfilled

This implementation satisfies all requirements from Issue AI-5:

- ✅ Function accepts a number `n` as parameter
- ✅ Returns array of Fibonacci numbers
- ✅ Includes basic input validation
- ✅ Has comprehensive JSDoc comments
