// para.ts

export type ParaBucket = 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE';

export interface ParaLink {
  id: string;              // linked object id (task, area, resource, etc.)
  type: 'TASK' | 'AREA' | 'RESOURCE' | 'ARCHIVE' | 'AGENT' | 'DOCUMENT';
  label?: string;          // human-readable label
}

export interface ParaMeta {
  paraBucket: ParaBucket;
  primaryAreaId?: string;  // which AREA this belongs to (for Projects/Resources)
  relatedIds?: ParaLink[]; // graph edges (Project ↔ Resources ↔ Agents)
}
