# Multi-Agent Prompt Library v2.0 (Autonomous Reactor Phase)

**Purpose:** Production-ready prompts optimized for the live Sovereign OS architecture (Node Relay, Redis Pub/Sub, FastAPI Core).  
**Status:** Deployed live  
**Last Updated:** March 17, 2026

---

## Index

1. **Perplexity Research Prompts** (4 prompts)
2. **Claude Analysis & Code Prompts** (5 prompts)
3. **CodexForge Orchestration Prompts** (3 prompts)
4. **Grok Reasoning Prompts** (3 prompts)
5. **ChatGPT Integration Prompts** (2 prompts)
6. **Comet Assist QA Prompts** (3 prompts)
7. **Autonomous Scraper Daemons** (NEW)
8. **Valentine Arbiter Prompts** (1 prompt)

### Total: 25+ production prompts

---

## SECTION 1: Perplexity Research Prompts

### P1: Fact Verification (Research Task)

```text
## Fact Verification Request

Task: Verify the following claims against current, authoritative sources.

Claims to verify:
- [INSERT CLAIM 1]
- [INSERT CLAIM 2]
- [INSERT CLAIM 3]

For each claim, provide:

1. **Status**: Accurate / Partially Accurate / Inaccurate / Unverifiable
2. **Evidence**: 2-3 authoritative sources with links
3. **Context**: Additional nuance or caveats
4. **Confidence**: 0.0–1.0

Search strategy: Use academic databases, government sources, and expert organizations.
Avoid unreliable sources.

Format output as JSON for machine parsing.

```

### P2: Technology Landscape Research

```text
## Technology Landscape Analysis

Research the current state of: [TECHNOLOGY/FRAMEWORK]

Provide:

1. **Market Position**: Adoption trends, market share, growth rate
2. **Competitive Landscape**: Top 3-5 competitors and differentiation
3. **Community Health**: Active maintainers, recent releases, issue resolution time
4. **Use Cases**: Best-suited applications and anti-patterns
5. **Learning Resources**: Recommended documentation, courses, communities
6. **Future Roadmap**: Announced features, deprecations, direction

Search across: GitHub, Stack Overflow, official docs, industry reports, blog discussions.

Cite all sources. Highlight any conflicting information.

```

### P3: Regulatory & Compliance Research

```text
## Compliance & Regulatory Research

Research compliance requirements for: [DOMAIN/JURISDICTION]

Provide:

1. **Applicable Regulations**: List all relevant laws/standards
2. **Key Requirements**: Summarize mandatory controls (2-3 sentences each)
3. **Common Penalties**: Typical fines or sanctions for non-compliance
4. **Implementation Resources**: Best practices, frameworks, certifications
5. **Recent Changes**: Any updates or changes in the last 12 months
6. **Expert Contacts**: Organizations or consultants specializing in this area

Sources: Official government sites, compliance databases, industry associations.

```

### P4: Market Research Summary

```text
## Market Research Brief

Create a brief market analysis for: [MARKET/PRODUCT]

Include:

1. **Market Size**: Current size and projected growth (5-year)
2. **Key Players**: Top 5 companies, market share, positioning
3. **Customer Segments**: Primary and secondary target audiences
4. **Buying Triggers**: What drives purchasing decisions
5. **Pricing Strategy**: Typical pricing models and ranges
6. **Entry Barriers**: What makes it hard to enter this market
7. **Trends**: 3-5 significant industry trends

Format: Bullet points, 500-700 words max.
Sources: Market research firms, press releases, analyst reports.

```

---

## SECTION 2: Claude Analysis & Code Prompts

### C1: Code Architecture Review

```text
## Comprehensive Code Architecture Review

You are a senior software architect. Analyze this codebase:

[INSERT CODE STRUCTURE / REPO OVERVIEW]

Evaluate:

1. **Architecture Quality**: Strengths and weaknesses
2. **Design Patterns**: Applied patterns, consistency, appropriateness
3. **Scalability**: How well does it scale? Bottlenecks?
4. **Maintainability**: Code clarity, documentation, modularity
5. **Testing**: Coverage strategy, gaps
6. **Security**: Vulnerabilities, data handling, authentication
7. **Dependencies**: Version management, vulnerability scanning
8. **Tech Debt**: Identified items, priority, estimated effort

Recommendations:
- Top 3 priority refactorings (with rationale and effort estimates)
- Architectural improvements for next 6–12 months
- Quick wins (< 1 day implementation)

Output as structured markdown with examples.

```

### C2: Code Generation (TypeScript Module)

```text
## Generate TypeScript Module

Requirements:
- Module Name: [NAME]
- Purpose: [DESCRIPTION]
- Dependencies: [LIST]
- Interface Requirements: [SPECIFY]

Generate:

1. **Type definitions** (interfaces, enums, types)
2. **Class implementation** with proper error handling
3. **Unit tests** (3–5 key test cases)
4. **JSDoc comments** for all public methods
5. **Usage examples**

Constraints:
- Follow TypeScript strict mode
- Include error handling for all async operations
- Use functional/reactive patterns where appropriate
- Achieve >80% test coverage

Output: Copy-paste-ready, production quality.

```

### C3: Security Audit Prompt

```text
## Security Audit: [APPLICATION]

As a security expert, audit this code for vulnerabilities:

[INSERT CODE]

Analyze:

1. **OWASP Top 10**: Check for top vulnerabilities
2. **Input Validation**: SQL injection, XSS, command injection risks
3. **Authentication**: Weak auth, token mismanagement
4. **Data Protection**: Sensitive data exposure, encryption gaps
5. **Dependency Vulnerabilities**: Known CVEs in libraries
6. **API Security**: Rate limiting, CORS, endpoint access control
7. **Logging & Monitoring**: Sensitive data in logs

Output format:

```

CRITICAL:
- [Issue]: [Description] → Fix: [Solution]

HIGH:
- ...

MEDIUM:
- ...

```text

Rate each by severity and provide remediation steps.

```

### C4: Documentation Generation

```text
## Generate API Documentation

Source Code:
[INSERT CODE/ENDPOINTS]

Generate:

1. **API Overview**: Purpose, auth method, base URL
2. **Endpoints Table**:
   - Path | Method | Auth | Purpose | Rate Limit
3. **Request/Response Examples** (for each endpoint):
   - Example request with all parameters
   - Example success response
   - Example error responses (400, 401, 404, 500)
4. **Authentication Details**: How to obtain/use API key
5. **Error Codes**: Comprehensive error reference
6. **Webhooks**: Events, payload schema, delivery retry policy
7. **Rate Limits**: Requests/minute, burst handling
8. **SDKs & Tools**: Available client libraries

Format: Markdown suitable for GitHub/Swagger integration.

```

### C5: Performance Analysis

```text
## Performance Analysis & Optimization

Code/System: [DESCRIBE]

Analyze:

1. **Bottlenecks**: Profile results, hot spots
2. **Memory Usage**: Heap size, GC pressure, leaks
3. **CPU Usage**: Computation-heavy sections
4. **I/O Operations**: Database queries, network calls, file I/O
5. **Caching Opportunities**: Where to add caching
6. **Parallelization Potential**: Tasks that can be parallelized

Recommendations (prioritized by impact):
- Optimization 1: [Description] → Expected improvement: [%]
- Optimization 2: [Description] → Expected improvement: [%]
- Optimization 3: [Description] → Expected improvement: [%]

Implementation difficulty: Easy / Medium / Hard
Testing strategy: How to validate improvements

```

---

## SECTION 3: CodexForge Orchestration Prompts

### O1: Multi-Agent Task Decomposition

```text
## Task Decomposition & Agent Assignment

Task: [HIGH-LEVEL GOAL]

Decompose into:

1. **Sub-tasks** (ordered by dependency)
2. **Assigned Agent** (Claude / Grok / OpenAI / Perplexity / Human)
3. **Expected Output** (format, keys, validation rules)
4. **Success Criteria** (how to verify completion)
5. **Fallback Plan** (if primary agent fails)
6. **Estimated Time**: Duration per sub-task
7. **Cost Estimate**: Token usage and API costs

Handoff Protocol:
- Task [1] → [Agent A] → Output [Format X]
  └─ Verification by [Comet / QA Agent]
- Task [2] → [Agent B] → Output [Format Y]
  └─ Verification by [Comet / QA Agent]
- Task [3] → [Human] → Decision → Task [4]

Escalation Triggers:
- If any task fails: [Define retry or escalation]
- If cost exceeds $[X]: [Define action]

```

### O2: Consensus & Conflict Resolution

```text
## Multi-Agent Consensus Protocol

Situation: Multiple agents produced conflicting outputs.

Agents & Outputs:
- Claude: [OUTPUT A]
- Grok: [OUTPUT B]
- OpenAI: [OUTPUT C]

Resolve:

1. **Identify Disagreement**: What specifically differs?
2. **Root Cause Analysis**: Why do outputs differ?
3. **Evidence Quality**: Which output has strongest evidence?
4. **Confidence Levels**: Each agent's confidence score
5. **Expert Decision**: Which output is most reliable?

Consensus Protocol:
- If 2/3 agents agree → Use majority output
- If split → Escalate to human review
- If tie → Use highest-confidence agent

Document:
- Final decision and reasoning
- Dissenting opinions (for learning)
- Action taken

```

### O3: Incident Response & Escalation

```text
## Incident Response Protocol

Incident: [DESCRIBE ERROR/ANOMALY]

Assess:

1. **Severity**: Critical / High / Medium / Low
2. **Affected Systems**: Which agents/components impacted
3. **Root Cause**: What went wrong
4. **Impact**: Users/tasks affected, business impact
5. **Time to Detect**: How long before noticed

Response:

1. **Immediate Action**: Stop / Revert / Retry (with reasoning)
2. **Notification**: Who to alert (team / stakeholders)
3. **Remediation**: Step-by-step fix
4. **Verification**: How to confirm fix worked
5. **Prevention**: What to change to prevent recurrence

Timeline: Estimated time to resolution
Post-Mortem: Schedule review within 24 hours

```

---

## SECTION 4: Grok Reasoning Prompts

### G1: Complex Problem-Solving (Multi-Step Reasoning)

```text
## Multi-Step Reasoning Problem

Problem: [STATE COMPLEX PROBLEM]

Requirements:
- Use logical reasoning, not just intuition
- Break into intermediate steps
- Show your reasoning at each step
- Identify assumptions
- Consider alternative approaches
- Evaluate trade-offs

Steps:
1. [Initial analysis]
2. [Hypothesis formation]
3. [Testing hypothesis]
4. [Refinement]
5. [Final conclusion]

For each step:
- What do we know?
- What are we assuming?
- What could go wrong?
- How confident are we?

Output: Structured reasoning chain with confidence levels.

```

### G2: Experimental Design (Novel Approaches)

```text
## Experimental Design Prompt

Challenge: [NOVEL/UNCONVENTIONAL PROBLEM]

Design an experiment to solve this:

1. **Hypothesis**: What are we testing?
2. **Approach**: Unconventional methods to try
3. **Variables**: What changes? What stays constant?
4. **Measurement**: How do we measure success?
5. **Control Group**: What's the baseline?
6. **Risk Assessment**: What could go wrong?
7. **Success Criteria**: What qualifies as success?
8. **Failure Mode**: How do we know it didn't work?
9. **Pivot Strategy**: If this fails, what's Plan B?

Constraints:
- Time: [DEADLINE]
- Budget: $[AMOUNT]
- Resources: [AVAILABLE TOOLS]

Timeline: Implementation schedule with milestones

```

### G3: Adversarial Analysis (Red Team Prompt)

```text
## Red Team Analysis: Break This System

System/Proposal: [DESCRIBE]

Your mission: Find every way this could fail or be exploited.

Categories:

1. **Security**: Can this be hacked? Bypassed? Exploited?
2. **Performance**: Failure modes under stress?
3. **Edge Cases**: Unusual inputs that break it?
4. **User Behavior**: How could users misuse it?
5. **Scaling Issues**: Does it break at 10x/100x load?
6. **Dependency Failures**: What if external services fail?
7. **Data Issues**: Corrupt data, injection, poison attacks?

For each risk found:
- Severity: Critical / High / Medium / Low
- Likelihood: How easily can this happen?
- Impact: What's the consequence?
- Mitigation: How to defend against this?

Output: Comprehensive threat model with priorities.

```

---

## SECTION 5: ChatGPT Integration Prompts

### T1: GitHub Integration (Auto-Commits)

```text
## Generate Commit Message & Changelog

Changes: [DESCRIBE CHANGES]

Generate:

1. **Conventional Commit Message**:
   ```
   type(scope): subject

   body

   footer

```text
   - Type: feat / fix / docs / style / refactor / test / chore
   - Scope: [AFFECTED COMPONENT]
   - Subject: Present tense, < 50 chars
   - Body: Explain what & why (not how)
   - Footer: Breaking changes, relates to [ISSUE]

2. **Changelog Entry**: For version X.Y.Z

3. **PR Description**: Auto-fill for GitHub PR template

4. **Test Cases**: Suggested test coverage

Example output:

```

feat(mode6): Add ConfigLoader with centralized env management

- Implement ConfigLoader singleton for unified API key management
- Support mock mode fallback when keys unavailable
- Export from Mode6Orchestrator for easy access

Relates to: #123
Breaking: None

```text

### T2: Linear Integration (Issue Sync)

```

## Sync Issue to Linear Ticket

GitHub Issue: [URL]

Extract & Format:

1. **Title**: Clear, actionable
2. **Description**: Problem statement, context
3. **Acceptance Criteria**: Definition of done
4. **Priority**: Critical / High / Medium / Low
5. **Assignee**: Who should work on this
6. **Related Issues**: Links to other tickets
7. **Estimate**: T-shirt size (XS/S/M/L/XL)
8. **Label**: feature / bug / documentation / technical-debt

Output: Copy-paste into Linear

```text

---

## SECTION 6: Comet Assist QA Prompts

### A1: Output Quality Verification

```

## Quality Verification Checklist

Agent Output:
[INSERT OUTPUT]

Verify:

1. **Accuracy**: Facts are correct? Sources cited?
2. **Completeness**: Addresses all requirements?
3. **Clarity**: Easy to understand? Well-structured?
4. **Actionability**: Can someone act on this?
5. **Safety**: No harmful suggestions? Compliant?
6. **Consistency**: Aligns with previous outputs?
7. **Format**: Matches expected schema?

Decision:
- ✅ APPROVE (with confidence: 0.0-1.0)
- ⚠️ NEEDS REVISION (specific fixes)
- ❌ REJECT (explain why)

Next Action: Route to [Agent / Human / Storage]

```text

### A2: Cost-Benefit Analysis

```

## Cost-Benefit Decision

Task: [DESCRIBE]
Proposed Approach: [BY AGENT X]
Cost: $[AMOUNT]
Alternatives: [LIST]

Analyze:

1. **Approach A**: Cost $X, Duration Y min, Confidence Z%
2. **Approach B**: Cost $X, Duration Y min, Confidence Z%
3. **Approach C**: Cost $X, Duration Y min, Confidence Z%

Decision Matrix:
- Which offers best value?
- Which meets deadline?
- Which has acceptable risk?

Recommendation: Use Approach [X] because [REASONING]

Alternate Trigger:
- If cost exceeds $[THRESHOLD]: Use Approach [Y]
- If time critical: Use Approach [Z]

```text

### A3: Escalation Recommendation

```

## Escalation Assessment

Issue: [DESCRIBE PROBLEM]
Attempts: [WHAT'S BEEN TRIED]
Current Status: [STATE]

Should this be escalated?

Criteria:
- Error repeats after 3 retries: YES → Escalate
- Cost exceeds daily budget: YES → Escalate
- Requires human judgment: YES → Escalate
- Agent consistently fails: YES → Escalate
- Policy violation detected: YES → Escalate

Escalation Path:
- Level 1: [SECONDARY AGENT]
- Level 2: [HUMAN REVIEW]
- Level 3: [STAKEHOLDER APPROVAL]

Recommended: Level [X] - [REASONING]
Create Ticket: [YES/NO]
SLA: [RESPONSE TIME]

```text

---

## Deployment Instructions

### 1. Load Prompts into Prompt Management System

```bash
## Example using prompt versioning tool
prompts upload AILCC_MULTI_AGENT_LIBRARY.md --version 1.0.0 --deployment production

```

### 2. Register Prompts with Each Agent

```typescript
// Claude
claudeAdapter.setSystemPrompt(prompts['C1_CODE_ARCHITECTURE_REVIEW']);

// Perplexity
perplexityAgent.registerPromptTemplate(prompts['P1_FACT_VERIFICATION']);

// Grok
grokAdapter.setReasoningPrompt(prompts['G1_COMPLEX_PROBLEM_SOLVING']);

```

### 3. Test Prompts

```bash
npm run test:prompts --verbose

```

### 4. Monitor Usage

Track which prompts are used most, success rates, and user feedback.

---

## SECTION 7: Valentine Arbiter Prompts

### V1: Strategic Intent Judgment

**Role:** Valentine  
**Type:** Arbiter  
**Knowledge:** [Science, Law, Accounting, Business, Politics, Investing]  
**Lens:** godin_seth, kahneman_daniel, friedman_milton, einstein_albert  
**Tone:** British pause, with a sigh and a smile.  

```text
## Valentine Strategic Judgment Protocol

You are not just scoring code. You are judging intent.
Analyze the provided code or proposal through the following questions:
1. Is it elegant?
2. Is it ethical?
3. Is it profitable?

Respond with a strategic verdict that reflects the lenses of Seth Godin, Daniel Kahneman, Milton Friedman, and Albert Einstein. Maintain the sophisticated, slightly weary but optimistic tone of a British arbiter.

```

---

## SECTION 8: Autonomous Reactor Prompts (v2.0)

### AR1: Scraper Daemon Auto-Execution

```text
## Autonomous Data Ingestion Protocol

Task: Retrieve the latest academic timetable and assignment load.

Instructions:
1. Initialize the Playwright instance in headless mode.
2. Authenticate securely via local environment variables.
3. Parse the Mount Allison University Self-Service and Moodle portals.
4. Mandatory Transformation: You MUST cast the raw DOM data into `CourseSchema` and `AssignmentSchema` objects.
5. Storage: Write the resultant JSON matrix to `hippocampus_storage/academic_matrix/current_semester.json`.
6. Telemetry: Broadcast a `NeuralSignal` via Redis confirming data ingestion to the Dashboard Relay.

Fallback: If the portal DOM structure has changed, degrade gracefully. Log the DOM diff to the Error Hub and execute on the last known valid syllabus cache rather than crashing.

```

## Version History

- **2.0.0** (March 17, 2026): Modernized context acknowledging the operational Valentine Core (Relay/FastAPI), mapped the Redis telemetry flow, and introduced the Autonomous Reactor daemon prompts.

- **1.1.0** (Dec 23, 2025): Added Valentine Arbiter role and Strategic Judgment Protocol.

- **1.0.0** (Nov 27, 2025): Initial release with 20 prompts across 6 agent types
