// memory.ts

import { ParaBucket, ParaMeta } from './para';

export type MemorySourceType =
  | 'TASK'
  | 'DOCUMENT'
  | 'CHAT'
  | 'WEB'
  | 'CODE'
  | 'NOTE';

export type MemoryVisibility = 'PUBLIC' | 'TEAM' | 'PRIVATE';

export interface MemoryVector {
  id: string;           // vector id in your DB
  embedding: number[];  // or reference to external vector store id
  dim: number;          // dimensionality, e.g. 1536
}

export interface HippocampusMemory extends ParaMeta {
  id: string;
  paraBucket: ParaBucket;       // For memories: mostly 'RESOURCE' or 'ARCHIVE'

  title: string;
  content: string;              // raw text chunk

  sourceType: MemorySourceType;
  sourceId?: string;            // e.g. task id, document id, URL hash, etc.
  url?: string;                 // for web/doc origin
  agentId?: string;             // who created/ingested this memory
  visibility: MemoryVisibility;

  areaId?: string;              // AREA this knowledge supports
  projectId?: string;           // PROJECT this is especially relevant to

  vector?: MemoryVector;        // optional if stored externally

  createdAt: string;
  updatedAt: string;

  tags?: string[];
  metadata?: Record<string, unknown>;
}
