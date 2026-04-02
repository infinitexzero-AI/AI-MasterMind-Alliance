
import { z } from 'zod';

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: z.ZodType<any>; // Zod schema for validation
    execute: (params: any) => Promise<any>;
}

export interface ToolSchema {
    name: string;
    description: string;
    input_schema: any; // PDF-style JSON schema for LLMs
}

export class ToolRegistry {
    private tools: Map<string, ToolDefinition> = new Map();

    register(tool: ToolDefinition) {
        this.tools.set(tool.name, tool);
    }

    getTool(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
    }

    listTools(): ToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get schemas formatted for OpenAI/Claude
     */
    getSchemas(): ToolSchema[] {
        return Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            input_schema: this.zodToJsonSchema(tool.parameters)
        }));
    }

    // Helper to convert Zod to JSON Schema (simplified)
    // In production we might use 'zod-to-json-schema' package
    private zodToJsonSchema(schema: z.ZodType<any>): any {
        // Basic mock implementation for now, or we define schemas manually in definitions
        // Ideally we assume the tool definition provides the schema, or we use a library.
        // For this environment, let's keep it robust by asking tool implementers to provide 'parameters' as JSON schema object if needed?
        // No, Zod is better for runtime validation.
        // We will assume a minimal conversion for now or expect manually provided schemas in this version to avoid large deps.
        return { type: "object", properties: {} };
    }
}
