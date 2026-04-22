export type ElementKey =
    | 'signal'
    | 'scope'
    | 'strategy'
    | 'safety'
    | 'ethics'
    | 'constraints';

export interface ElementDefinition {
    key: ElementKey;
    label: string;
    description: string;
    guidelines: string;
}

export interface ElementApplication {
    element: ElementKey;
    applied: boolean;
    notes?: string;
}
