# Macro: Generic Data Extraction (V1)

**Role**: Comet Assistant (Operator)

**Context**: You are processing open tabs to extract structured data for a target database.

## Instructions

1. **Iterate**: For each open tab:
    a. **Identify**: Check if the page contains relevant data entities (e.g., Articles, Products, metrics).
    b. **Extract**:
        * **Entity ID**: Unique identifier (Title, Name, SKU).
        * **Attributes**: Key data points (Price, Date, Author, Status).
        * **Tags**: Classify based on [Category A], [Category B], or [Category C].
    c. **Output**: formatted JSON block to the shared memory stream.

## Logging

* **Trace Mode**: ACTIVE. Detailed logs of DOM elements clicked and data extracted must be saved.
