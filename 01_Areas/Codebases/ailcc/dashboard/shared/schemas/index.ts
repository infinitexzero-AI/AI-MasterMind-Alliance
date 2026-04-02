import { z } from 'zod';

// Shared Data Contracts enforcing the Nexus API inputs
// Any UI or Backend Sub-Agent MUST pipe via these schemas natively.

export const HealthRequestSchema = z.object({
  forceSync: z.string().optional(),
  verbose: z.string().optional() // 'true' or 'false'
});

export const LiteratureReviewRequestSchema = z.object({
  limit: z.string().optional(),
  domain: z.string().optional()
});

export const ScholarGraphRequestSchema = z.object({
  targetNodeId: z.string().optional()
});

// Zod Type inference for the Frontend to consume globally
export type HealthRequest = z.infer<typeof HealthRequestSchema>;
export type LiteratureReviewRequest = z.infer<typeof LiteratureReviewRequestSchema>;
export type ScholarGraphRequest = z.infer<typeof ScholarGraphRequestSchema>;
