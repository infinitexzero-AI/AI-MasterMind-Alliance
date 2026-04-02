export interface VanguardAgentSchema {
    id: string;
    alias: string;
    endpoint: string;
    role: 'Commander' | 'Scout' | 'Architect' | 'Observer';
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    last_ping: string; // ISO 8601
    capabilities: string[];
}

export interface SwarmTaskSchema {
    task_id: string;
    target_agent_id: string;
    payload: string; // The JSON string or task text sent to the agent
    priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
    status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    started_at?: string;
    completed_at?: string;
    response_payload?: string; // The JSON string of the agent's response
    metadata?: Record<string, any>; // Flexible JSON payload for context tracking
}

export interface NeuralSignalSchema {
    signal_id: string;
    source: 'PYTHON_CORTEX' | 'WEBSOCKET' | 'SYSTEM' | 'EXTERNAL_API';
    type: 'LOG' | 'ERROR' | 'METRIC' | 'STATE_CHANGE';
    severity: 'CRITICAL' | 'HIGH' | 'ROUTINE';
    message: string;
    timestamp: string;
    metadata?: Record<string, any>; // Flexible JSON payload for context
}

export interface TycoonPositionSchema {
    asset_id: string;
    symbol: string;
    type: 'CRYPTO' | 'EQUITY' | 'CASH';
    amount: number;
    current_value_usd: number;
    roi_percentage: number;
    status: 'ACTIVE' | 'PENDING' | 'CLOSED';
    last_updated: string;
}

export interface AuthSessionSchema {
    token: string;
    role: 'COMMANDER' | 'OPERATOR' | 'OBSERVER' | 'GUEST';
    expires_at: string;
    features_enabled: string[];
}

// --- STUDENT OS BASE SCHEMA (Phase 43) ---

export interface AssignmentSchema {
    id: string;
    course_id: string;
    title: string;
    type: 'READING' | 'QUIZ' | 'PAPER' | 'PROJECT' | 'EXAM';
    weight_percentage?: number;
    due_date: string;
    status: 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
    link?: string;
    grade?: number;
    vault_links?: string[];
}

export interface CourseSchema {
    id: string; // e.g., GENS2101
    title: string;
    instructor: string;
    credits: number;
    meeting_times: string[]; // e.g., ['Mon 10:30', 'Wed 10:30']
    room?: string;
    links: {
        moodle?: string;
        onedrive?: string;
        google_drive?: string;
        self_service?: string;
    };
    syllabus_parsed: boolean;
    assignments: AssignmentSchema[];
}

export interface SemesterSchema {
    id: string; // e.g., WINTER_2026
    label: string; // "Winter 2026"
    start_date: string;
    end_date: string;
    gpa_snapshot?: number;
    courses: CourseSchema[];
}

// --- VISION & SKILL SCHEMA ---

export interface SkillNodeSchema {
    id: string;
    domain: 'BIOPSYCH' | 'RESEARCH' | 'CODING' | 'BUSINESS' | 'WELLNESS';
    name: string;
    description: string;
    level: 0 | 1 | 2 | 3;
    evidence_links: string[]; // Moodle/GitHub links
    prerequisite_courses: string[]; // Course IDs
}

export interface MilestoneSchema {
    id: string;
    type: 'ACADEMIC' | 'ADMIN' | 'PERSONAL' | 'CAREER';
    title: string;
    target_date: string;
    status: 'PENDING' | 'ACHIEVED' | 'MISSED';
    dependencies: {
        courses: string[]; // Course IDs
        skills: string[]; // Skill IDs
    };
}

export interface ApplicationSchema {
    id: string;
    organization: string;
    role: string;
    location: string;
    term: string; // e.g. "Summer 2026"
    status: 'PROSPECT' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'CLOSED';
    relevant_skills: string[];    
    notes: string;
}
