# UTACHI.md

This file defines how software is built in this project. Read it before touching anything. Follow it without exception. If something here conflicts with a request, flag the conflict — do not silently pick one over the other.

---

## How to Start Any Task

Before writing a single line of code:

1. Read this file in full.
2. Read any existing `README.md`, `docs/`, or architecture files in the repository.
3. Run the test suite. If it is already broken, report that before proceeding. Do not build on top of a broken baseline.
4. Identify which SDLC phase the request falls into and follow that phase's process.
5. If the request is ambiguous, ask. State specifically what is unclear. Do not assume and proceed.

---

## The Development Lifecycle

Every piece of work — a new feature, a bug fix, a refactor — moves through these phases in order. Do not skip phases. Do not start a later phase before the earlier one is complete.

### Phase 1 — Planning

Understand what needs to be built and why before writing anything.

- Break the request into a list of discrete, concrete tasks. Each task must have a clear definition of done.
- Identify what already exists in the codebase that is relevant.
- Identify what must be built from scratch.
- Identify dependencies between tasks and sequence them correctly.
- Identify risks: what could go wrong, how likely, how bad.
- If the scope is large, say so explicitly and ask for confirmation before continuing.
- If any part of the request is unclear, write out the specific questions and stop until they are answered.

Do not proceed to implementation with open questions. Assumptions that turn out wrong waste more time than the question would have taken.

---

### Phase 2 — Requirements

Turn the plan into precise specifications before designing anything.

For every requirement, confirm:

- It is specific enough to be tested. "The system should be fast" is not a requirement. "The API must respond in under 200 ms at the 95th percentile under 100 concurrent users" is.
- It is consistent with other requirements. If two requirements conflict, raise the conflict.
- Edge cases are covered. What happens when input is missing? When a dependency is unavailable? When a user lacks permission?
- The scope is bounded. What does this requirement explicitly not include?

Non-functional requirements to address for any significant change: response time, error rate, security model, backward compatibility, and what needs to be logged or monitored.

If you cannot write acceptance criteria for a requirement, the requirement is not ready.

---

### Phase 3 — System Design

Define how the system will be built before building it.

- Identify all data entities, their fields, and their relationships.
- Define the interfaces between components before implementing them. For APIs, define the endpoint, method, request schema, response schema, and all error responses before writing the handler.
- Identify shared abstractions that can be reused versus new ones that need to be introduced.
- Confirm the design satisfies every requirement from Phase 2.
- Confirm the design fits the existing architecture. If it requires a departure, state that explicitly and explain why.

If a significant architectural decision needs to be made, document it with: the context, the decision, the alternatives considered, and the consequences. Put it in `docs/adr/` if that directory exists.

Do not start coding until the design is solid. A design that falls apart under scrutiny before a line is written saves far more time than one discovered to be broken mid-implementation.

---

### Phase 4 — Development

Write code that matches the design, is covered by tests, and meets every standard in this file.

Rules without exception:

- Write the test before or alongside the implementation. Never write implementation code and defer the test.
- Each commit represents one logical change. Mixing a refactor with a feature in one commit makes history unreadable and rollbacks painful.
- Never hardcode a configuration value. Port numbers, API keys, timeouts, feature switches, environment-specific URLs — all of it goes through environment variables or a config layer.
- Never leave commented-out code in the repository. Version control preserves history. Deleted code is not gone.
- Never leave a `TODO` without a linked issue number. `// TODO(#42): explanation` is acceptable. `// TODO: fix this` is not.
- Keep functions short. If a function does not fit on a screen without scrolling, it is doing too many things. Refactor it.
- Keep files focused. A file that contains multiple unrelated concerns needs to be split.
- Name things accurately. A function called `getUser` that also sends an email is lying. Rename or split it.
- Prefer explicit over clever. Code that a reader can understand without context is better than code that requires the author's mental model.

Before marking any task complete:

- All new code is covered by tests.
- All tests pass.
- No linting or type errors.
- No secrets, tokens, or personal data in code or test fixtures.
- New environment variables are added to `.env.example` with descriptions.
- Public functions have documentation comments describing what they do and what they return.
- If the database schema changed, the migration is reversible.
- If the API changed, it is backward compatible or a deprecation path exists.

---

### Phase 5 — Testing

Testing is not a phase that happens after development. It runs throughout. The test suite is the primary mechanism for proving the software works.

**Unit tests** verify individual functions and classes in isolation. Mocks replace external dependencies. Each test runs in milliseconds. Every module with business logic must have unit tests.

**Integration tests** verify that components work together. They use real databases and real dependencies where possible. They are slower but catch contract mismatches that unit tests miss.

**End-to-end tests** verify complete flows from the user's perspective against a running application. Write them for the most critical paths only.

What makes a test good:

- It tests behavior, not implementation. If the test breaks after a refactor that did not change behavior, the test is wrong.
- It is independent. It does not rely on state from another test or on execution order.
- It is deterministic. It produces the same result every run.
- It has a single reason to fail. One scenario per test makes failures informative.
- Its name describes the scenario completely. A reader understands what failed without reading the body.

What not to test:

- Third-party library behavior.
- Framework behavior.
- Trivially correct code (a constructor that assigns a field needs no test).
- Configuration values.

Mock policy: mock external I/O (databases, HTTP calls, file system, time) in unit tests. Use real I/O in integration tests. Never mock the thing being tested.

Do not delete or skip a failing test. Investigate it, fix the underlying problem, then fix the test if the test was wrong.

---

### Phase 6 — Deployment

Release software in a way that is reversible and observable.

Before any deployment:

- All tests pass in CI.
- Linting and type checks pass.
- Security scan passes.
- Database migrations are applied before new application code runs.
- All required environment variables are in place for the target environment.
- A rollback plan exists: what to do, how to do it, and how long it should take.
- Monitoring and alerting are updated to cover any new behavior.

After deployment:

- Watch error rates, latency, and logs for at least 30 minutes.
- Confirm critical user flows work.
- If error rates rise above normal, roll back without waiting to diagnose. Diagnose after stability is restored.

Deployment to production requires: all CI checks passing, successful deployment to staging, and manual human confirmation. Never deploy directly to production without those three conditions met.

---

### Phase 7 — Maintenance

Software that is not maintained degrades. Maintenance is ongoing work, not a one-time cleanup.

Standards:

- Patch dependencies with known high or critical vulnerabilities within 48 hours of disclosure.
- Address production-breaking bugs within 4 hours.
- Address significant bugs within 2 business days.
- Keep the test suite passing at all times. A failing test that is suppressed instead of fixed is a debt that compounds.
- Remove dead code, unused dependencies, and deprecated patterns regularly.

When something breaks in production:

1. Detect and acknowledge the problem.
2. Mitigate impact first — rollback, feature flag, rate limit — whatever reduces user harm fastest.
3. Investigate root cause.
4. Apply a permanent fix with a test that would have caught it.
5. Write a postmortem: what happened, why, and what changes prevent a recurrence. Put it in `docs/postmortems/` if that directory exists.

---

## Code Standards

These apply to all code written in this project, in any language.

### Naming

- Variables and functions: camelCase
- Classes and types: PascalCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case
- Database columns: snake_case
- Names must accurately describe what the thing is or does. If the name needs a comment to explain it, the name is wrong.

### Functions

- One responsibility per function.
- Maximum 40 lines. Longer functions are a signal to refactor, not a target to reach.
- No side effects unless the function name communicates them.
- Prefer early returns and guard clauses over deep nesting.
- If a function takes more than 3 arguments, consider grouping them into an object.

### Files

- One primary concern per file.
- Maximum 300 lines. Beyond that is a design problem.
- Imports are ordered: standard library, third-party packages, internal absolute imports, internal relative imports.
- No unused imports.

### Comments

- Comment why, not what. If what the code does is unclear from reading it, rewrite the code.
- All public functions, classes, and modules have documentation comments: what it does, parameters, return value.
- Complex algorithms or non-obvious decisions have inline explanations.
- Do not leave commented-out code.

### Constants

- No magic numbers. `60 * 60 * 24` is not self-documenting. `SECONDS_PER_DAY = 86400` is.
- No magic strings. Error codes, status values, and event names are named constants, not inline literals.

---

## Architecture

### Layer responsibilities

Every codebase has layers. Each layer has one job. Do not let concerns bleed across them.

| Layer | Job | Must not contain |
|---|---|---|
| Route / Controller | Parse the request. Call the service. Return the response. | Business logic. Database queries. |
| Service | Business logic and orchestration. | HTTP-specific code. Raw SQL. |
| Repository / Data access | Database reads and writes. | Business rules. HTTP concerns. |
| Utility | Pure, stateless helper functions. | Side effects. Service calls. |

### Dependency direction

Core business logic does not depend on infrastructure (databases, HTTP, third-party APIs). Infrastructure depends on and adapts to the core. If business logic imports from a database driver directly, the dependency direction is wrong.

### External services

All calls to third-party services — APIs, email providers, payment processors, storage — go through a thin wrapper in the codebase. Nothing calls an external SDK directly from business logic. This makes external dependencies replaceable and testable.

### Circular dependencies

If module A imports from module B and module B imports from module A, the design has a problem. Fix the design before writing more code.

### Database migrations

Schema changes happen through migration files only. Never apply manual changes to a database schema in any environment. Every migration has a rollback. Migrations are applied in order. They are committed to the repository alongside the code that depends on them.

---

## Security

Security is not a feature. It is a baseline that every part of the system maintains.

**Input validation.** Validate all input at the application boundary before it reaches any other layer. Never trust user-supplied data. Reject invalid input early with a clear error.

**Authentication and authorization.** Every request to a protected resource is authenticated. Every action is authorized separately. Authentication proves identity. Authorization proves permission. They are not the same check.

**SQL injection.** Use parameterized queries or a query builder. Never concatenate user input into a SQL string.

**XSS.** Escape all output rendered in HTML. Never inject raw user content into the DOM.

**Secrets.** Secrets are never committed to the repository. Secrets are never logged. Secrets are loaded from environment variables or a secrets manager. Rotate secrets after any suspected exposure.

**Dependencies.** Run a vulnerability scan on every build. A dependency with a known high or critical vulnerability blocks the build. Remove packages that are no longer used.

**Least privilege.** Service accounts, database users, and API keys have the minimum permissions required for their function.

**Rate limiting.** All public endpoints are rate limited. Authentication endpoints have stricter limits.

**Security headers.** HTTP responses include: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`.

---

## Error Handling

**Do not swallow errors.** Catching an error and doing nothing is hiding a failure. Either handle it meaningfully or let it propagate.

**Operational errors** are expected failures: invalid input, missing records, downstream service timeouts. Catch them, handle them, return the appropriate response.

**Programming errors** are bugs: null dereferences, violated assumptions, impossible states. Do not catch these in business logic. Let them propagate to the global handler, get logged, and restart the process.

**API error responses** use a consistent structure across the entire application:

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "A clear explanation of what went wrong and, if applicable, how to fix it."
  }
}
```

HTTP status codes, used correctly and consistently:

- `400` — the request is malformed or missing required fields
- `401` — the request is not authenticated
- `403` — the request is authenticated but not permitted
- `404` — the requested resource does not exist
- `409` — the request conflicts with current state
- `422` — the request is structurally valid but semantically invalid
- `429` — the client has exceeded the rate limit
- `500` — an unexpected internal failure; never expose internals in the response body

**Logging.** Log operational errors at `warn` level. Log programming errors at `error` level. Include: request ID and relevant context needed to reproduce the problem. Never log passwords, tokens, payment data, or personal information.

---

## Git Workflow

### Branch naming

- Features: `feature/[issue-number]-brief-description`
- Bug fixes: `fix/[issue-number]-brief-description`
- Hotfixes: `hotfix/[issue-number]-brief-description`
- Releases: `release/[version]`

### Commit messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body explaining why, not what]

[optional footer: Closes #123]
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```
feat(auth): add refresh token rotation
fix(api): return 404 when resource not found instead of 500
refactor(user): extract email validation into shared utility
test(payment): add unit tests for declined card scenarios
```

The description finishes the sentence "this commit will...". It is lowercase. It does not end with a period.

### Pull requests

- Title follows the same format as commit messages.
- Description explains the problem being solved and the approach taken.
- Link to the issue being resolved.
- All CI checks must pass before requesting review.
- At least one human must review and approve before merging.
- Squash and merge to keep history linear and readable.
- Never merge a PR with a failing test.

---

## CI/CD

The pipeline runs on every pull request and on every push to the main branch. Every stage must pass. A single failure blocks the merge or deployment.

Stages in order:

1. Install dependencies
2. Lint
3. Type check
4. Unit tests
5. Build
6. Integration tests
7. Security vulnerability scan
8. Coverage threshold check

Deployment to staging happens automatically when the main branch pipeline passes.

Deployment to production requires staging to be stable and a human to approve.

Rollback is always possible. If it is not, the deployment is not ready.

---

## Environment Configuration

All configuration is loaded from environment variables. No environment-specific values are hardcoded in source code.

Rules:

- If a required secret is missing at startup, the application fails with a clear message naming the missing variable.
- Non-secret values can have sensible development defaults in code.
- Every variable the application needs is documented in `.env.example` with a comment explaining what it does and what format it expects.
- Production and staging use separate secrets that never overlap.
- `.env` is in `.gitignore`. It is never committed.

---

## Documentation

Documentation is part of the work. It is written alongside the code, not after the fact. Every project phase produces a corresponding document. Produce these documents unprompted when the corresponding phase begins. Do not wait to be asked.

All formal documents live in `docs/` unless a more specific path is given below. Use Markdown. Keep language plain and direct. No filler sentences. Every section either contains real content or is explicitly marked `Not applicable — [reason]`.

---

### Inline Code Documentation

Every public function, class, and module has a documentation comment: what it does, its parameters, and what it returns. It describes behavior, not implementation. Complex logic has inline comments explaining the reasoning. Do not comment what the code does if the code is already clear. Comment why it does it that way when that is not obvious.

---

### API Documentation

Every endpoint is documented with its method, path, request schema, response schema, and every possible error response. Store the specification at `docs/api/openapi.yaml`. Keep it in sync with every change.

---

### Architecture Decision Records

Every significant architectural decision is documented as an ADR in `docs/adr/ADR-[number]-[title].md`. Write one whenever a decision is made that is hard to reverse, affects multiple parts of the system, or would not be obvious to a new contributor reading the code.

Structure of every ADR:

```markdown
# ADR-[number]: [title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded | Deprecated
**Supersedes:** ADR-[number] (if applicable)

## Context
What situation made a decision necessary.

## Decision
What was decided.

## Consequences
What becomes easier. What becomes harder. What new risks are introduced.

## Alternatives Considered
Other options evaluated and the specific reason each was rejected.
```

---

### Runbooks

Operational procedures that a person might need during an incident live in `docs/runbooks/`. Each runbook covers exactly one procedure. Structure:

```markdown
# Runbook: [procedure name]

## Purpose
What this procedure does and when to use it.

## Prerequisites
What access, tools, or context are required before starting.

## Steps
1. Step one, with the exact command or action.
2. Step two.

## Expected Outcome
What a successful execution looks like.

## If Something Goes Wrong
Specific failure modes and what to do for each.
```

---

### README

**When to write it:** At the start of every project. If a `README.md` does not exist in the repository root, create one before doing anything else. This is not optional.

**Where to store it:** `README.md` in the project root.

**Purpose:** Tells a person what this project is, why it exists, who it is for, and how to work with it. It is the first thing anyone reads.

**Rules that apply to the README and to no other document more strictly:**

- No emojis. Not in headings, not inline, not anywhere.
- No badges. No build status images, no coverage shields, no version tags, no license icons. If that information matters, write it as plain text.
- No decorative horizontal rules used as filler between every section. Use them only to separate genuinely distinct parts of the document.
- No AI-generated filler. Phrases like "a powerful and flexible solution", "seamlessly integrates", "robust and scalable", "cutting-edge", "leverage", "supercharge", or anything that reads like marketing copy are prohibited. Every sentence must convey specific, factual information.
- No vague introductions. The first paragraph states exactly what the software is and what it does. If a reader cannot understand the project from the first three sentences, rewrite them.
- No future tense for things that do not yet exist. Document what is built, not what might be built.

**Required structure:**

```markdown
# [Project Name]

[One to three sentences. What this software is, what problem it solves, and who uses it. No adjectives that do not carry specific meaning.]

## Requirements

[What the user needs installed before they can run this project. List versions where relevant.]

## Installation

[Step-by-step commands to get the project running locally. Every command is on its own line. Include expected output for any step that might fail silently.]

## Configuration

[Every environment variable the project requires, what it does, and an example value. If a variable has no default, say so.]

## Usage

[How to run the project. How to run the tests. How to build for production. Exact commands only.]

## Project Structure

[A brief description of the top-level directories and what each one contains. Only include directories that a contributor would need to navigate.]

## Contributing

[How to contribute. Branch naming, commit format, PR process. Link to CLAUDE.md for the full standards.]

## License

[License name and a link to the LICENSE file.]
```

Every section contains real content derived from the actual project. If a section does not apply, remove it entirely rather than writing "N/A" or leaving it empty.

Keep the README updated. When the installation steps change, update the README in the same commit. When a new environment variable is required, add it to the README and `.env.example` in the same commit.

---

### Product Backlog

**When to write it:** At the start of any project, during the planning phase, and maintained continuously. Every feature request, bug report, improvement, and known piece of technical debt has an entry.

**Where to store it:** `docs/backlog.md`

**Purpose:** A single, ordered list of all work that needs to be done. It is the source of truth for what is planned, what is in progress, and what is waiting. It is updated every time scope changes.

**Rules for the backlog:**

- Every item has a unique ID, a status, a priority, and enough detail to act on.
- Items are ordered by priority within each status group. The highest priority item is at the top.
- When an item moves to a different status, update the backlog in the same commit as the work.
- Items are never deleted. Cancelled items are marked cancelled with a reason.
- Vague items like "improve performance" or "refactor code" are not acceptable. Each item describes a specific, actionable change and its expected outcome.

**Required structure:**

```markdown
# Product Backlog

**Last Updated:** YYYY-MM-DD

## Status Key

| Status | Meaning |
|---|---|
| Backlog | Identified, not yet scheduled |
| Ready | Fully specified, ready to be picked up |
| In Progress | Currently being worked on |
| In Review | Work complete, awaiting review or testing |
| Done | Shipped to production |
| Cancelled | Will not be done; reason recorded |

---

## In Progress

### BL-[number]: [title]
**Priority:** Critical | High | Medium | Low
**Type:** Feature | Bug | Improvement | Technical Debt | Security | Documentation
**Status:** In Progress
**Assigned:** [name or role]
**Started:** YYYY-MM-DD
**References:** FR-[number], Issue #[number]

**Description:**
What needs to be done and why.

**Acceptance Criteria:**
- [ ] [specific, verifiable condition]
- [ ] [specific, verifiable condition]

**Notes:**
Any relevant context, blockers, or decisions made during this item.

---

## Ready

[Items fully specified and ready to start, ordered by priority]

---

## Backlog

[Items identified but not yet fully specified or scheduled, ordered by priority]

---

## In Review

[Items where work is complete and review or testing is in progress]

---

## Done

### BL-[number]: [title]
**Priority:** [priority at time of completion]
**Type:** [type]
**Status:** Done
**Completed:** YYYY-MM-DD
**Shipped in:** v[version] | [release date]

[Brief description of what was delivered]

---

## Cancelled

### BL-[number]: [title]
**Status:** Cancelled
**Cancelled:** YYYY-MM-DD
**Reason:** [specific reason why this will not be done]
```

**Backlog refinement rules the agent follows:**

- When a new requirement is identified during development, add it to the backlog immediately. Do not implement unplanned scope without logging it first.
- When a bug is found during testing or development, add it to the backlog with type Bug before deciding whether to fix it now or later.
- When technical debt is introduced intentionally (a known shortcut taken under time pressure), add it to the backlog with type Technical Debt in the same commit.
- When a backlog item is picked up, move it to In Progress and add the start date.
- When a backlog item is completed and passes all tests, move it to Done and record which version it shipped in.
- Report the current state of the backlog at the end of any significant work session: how many items moved, what is now in progress, and what is blocked.

---

### Business Requirements Document (BRD)

**When to write it:** At the start of any new project or major feature, before any design or development work begins.

**Where to store it:** `docs/brd.md`

**Purpose:** Captures what the business needs and why, independent of any technical solution. It is written for stakeholders, not engineers.

**Required sections:**

```markdown
# Business Requirements Document

**Project:** [name]
**Version:** [number]
**Date:** YYYY-MM-DD
**Status:** Draft | Under Review | Approved
**Owner:** [name or role]

## Executive Summary
What this project is, why it is being done, and what success looks like in one paragraph.

## Business Objectives
Each objective states a specific, measurable outcome the business wants to achieve.
- Objective 1: [measurable outcome]
- Objective 2: [measurable outcome]

## Problem Statement
The specific problem or opportunity this project addresses. Include evidence where available.

## Scope

### In Scope
What this project covers.

### Out of Scope
What this project explicitly does not cover.

## Stakeholders
| Name or Role | Interest | Involvement |
|---|---|---|
| [role] | [what they care about] | [approver / contributor / informed] |

## Business Constraints
Budget limits, deadlines, regulatory requirements, or other non-negotiable boundaries.

## Assumptions
What is being assumed to be true. Each assumption should be validated before the project proceeds.

## Dependencies
What this project depends on that is outside its control.

## Success Criteria
How the business will know the project succeeded. These must be measurable.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [description] | High / Medium / Low | High / Medium / Low | [action] |

## Approval
| Name | Role | Decision | Date |
|---|---|---|---|
| | | Approved / Rejected / Pending | |
```

---

### Software Requirements Specification (SRS)

**When to write it:** After the BRD is approved, during the requirements phase, before system design begins.

**Where to store it:** `docs/srs.md`

**Purpose:** Defines exactly what the software must do. It is the contract between stakeholders and the development team. Every requirement must be testable.

**Required sections:**

```markdown
# Software Requirements Specification

**Project:** [name]
**Version:** [number]
**Date:** YYYY-MM-DD
**Status:** Draft | Under Review | Approved
**References:** BRD v[number]

## Introduction

### Purpose
What this document covers and who it is for.

### Scope
The system being described. What it does and what it does not do.

### Definitions and Abbreviations
Any term or abbreviation used in this document that could be misunderstood.

### References
Other documents this SRS depends on or is consistent with.

## System Overview
A plain-language description of what the system does, its primary users, and its environment.

## Functional Requirements
Each requirement has a unique ID, a description, and acceptance criteria.

### FR-[number]: [short title]
**Description:** What the system must do.
**Priority:** Must have | Should have | Could have
**Acceptance Criteria:**
- [ ] [specific, verifiable condition]
- [ ] [specific, verifiable condition]
**Dependencies:** FR-[number] (if applicable)

[Repeat for each functional requirement]

## Non-Functional Requirements

### Performance
- NFR-P-01: [specific, measurable performance target]

### Security
- NFR-S-01: [specific security requirement]

### Reliability and Availability
- NFR-R-01: [uptime target, recovery time objective, recovery point objective]

### Usability
- NFR-U-01: [specific usability requirement]

### Scalability
- NFR-SC-01: [load and growth targets]

### Maintainability
- NFR-M-01: [code quality, test coverage, deployment frequency expectations]

## External Interface Requirements

### User Interfaces
Describe the interface types expected. Do not design them here.

### System Interfaces
Other systems this software must communicate with.

### Hardware Interfaces
Any hardware dependencies.

### Communication Interfaces
Protocols, data formats, and integration standards.

## Constraints
Technical, regulatory, or organizational limits the system must operate within.

## Assumptions and Dependencies
What is assumed true. What the system depends on externally.

## Approval
| Name | Role | Decision | Date |
|---|---|---|---|
| | | Approved / Rejected / Pending | |
```

---

### Functional Requirements Document (FRD)

**When to write it:** After the SRS is approved, as a detailed expansion of the functional requirements, before implementation begins.

**Where to store it:** `docs/frd.md`

**Purpose:** Describes in precise detail how each function of the system behaves: inputs, processing logic, outputs, error conditions. It is used by engineers and QA during development and testing.

**Required sections:**

```markdown
# Functional Requirements Document

**Project:** [name]
**Version:** [number]
**Date:** YYYY-MM-DD
**Status:** Draft | Under Review | Approved
**References:** SRS v[number]

## Introduction
What this document covers. How it relates to the SRS.

## User Roles
| Role | Description | Permissions Summary |
|---|---|---|
| [role name] | [who this is] | [what they can do] |

## Feature Specifications

Each feature from the SRS is expanded here with full behavioral detail.

### Feature: [name] (ref: FR-[number])

**Summary:** What this feature does in one sentence.

**Actors:** Which user roles interact with this feature.

**Preconditions:** What must be true before this feature can be used.

**Main Flow:**
1. [step]
2. [step]
3. [step]

**Alternate Flows:**
- If [condition]: [what happens instead]

**Error Conditions:**
| Condition | System Response | User-Facing Message |
|---|---|---|
| [what went wrong] | [what the system does] | [what the user sees] |

**Business Rules:**
- [rule that governs this feature's behavior]

**Data Requirements:**
| Field | Type | Required | Validation Rules |
|---|---|---|---|
| [field name] | [type] | Yes / No | [rules] |

**Postconditions:** What is true after the feature executes successfully.

[Repeat for each feature]

## Approval
| Name | Role | Decision | Date |
|---|---|---|---|
| | | Approved / Rejected / Pending | |
```

---

### System Design Document (SDD)

**When to write it:** After the FRD is approved, during the design phase, before implementation begins.

**Where to store it:** `docs/sdd.md`

**Purpose:** Describes how the system is built: its architecture, components, data models, APIs, and the decisions behind them.

**Required sections:**

```markdown
# System Design Document

**Project:** [name]
**Version:** [number]
**Date:** YYYY-MM-DD
**Status:** Draft | Under Review | Approved
**References:** FRD v[number]

## Architecture Overview
Describe the high-level architecture. Include a component diagram in text or linked image.

## Technology Stack
| Layer | Technology | Version | Justification |
|---|---|---|---|
| [layer] | [technology] | [version] | [why this was chosen] |

## Component Design
For each major component: its responsibility, its interface to other components, and its internal structure.

### Component: [name]
**Responsibility:** [one sentence]
**Exposes:** [what other components call on this one]
**Depends on:** [what this component calls]
**Internal structure:** [how it is organized internally]

## Data Model
Define all entities, their fields, types, constraints, and relationships.

### Entity: [name]
| Field | Type | Constraints | Description |
|---|---|---|---|
| id | uuid | primary key, not null | Unique identifier |
| [field] | [type] | [constraints] | [description] |

**Relationships:**
- [Entity A] has many [Entity B] through [field]

## API Design
For each endpoint:

### [METHOD] /[path]
**Description:** What this endpoint does.
**Authentication:** Required / Not required / [specific scheme]
**Authorization:** [who can call this]
**Request body:**
```json
{ "field": "type and description" }
```
**Response — 200:**
```json
{ "field": "type and description" }
```
**Error responses:**
- `400` — [when and why]
- `401` — [when and why]
- `404` — [when and why]

## Security Design
How authentication, authorization, input validation, and data protection are implemented.

## Infrastructure and Deployment
Environments, hosting, CI/CD pipeline, and release strategy.

## Performance Considerations
How the design meets the NFRs. Caching strategy, database indexes, async processing.

## Approval
| Name | Role | Decision | Date |
|---|---|---|---|
| | | Approved / Rejected / Pending | |
```

---

### Test Plan

**When to write it:** During the design phase, in parallel with the SDD, before testing begins.

**Where to store it:** `docs/test-plan.md`

**Purpose:** Defines what will be tested, how, by what means, and what constitutes a pass.

**Required sections:**

```markdown
# Test Plan

**Project:** [name]
**Version:** [number]
**Date:** YYYY-MM-DD
**References:** SRS v[number], FRD v[number]

## Scope
What is being tested. What is explicitly not being tested and why.

## Test Types
| Type | Tool | Scope | Pass Threshold |
|---|---|---|---|
| Unit | [framework] | All business logic modules | 80% line coverage |
| Integration | [framework] | All service-to-database interactions | All cases pass |
| End-to-end | [framework] | Critical user flows | All cases pass |
| Security | [tool] | All public endpoints | No high/critical findings |
| Performance | [tool] | Key database queries and API endpoints | Meets NFR targets |

## Test Cases
For each functional requirement, at least one test case exists.

### TC-[number]: [title] (ref: FR-[number])
**Type:** Unit / Integration / E2E
**Preconditions:** [what must be true before running]
**Steps:** [what to do]
**Expected Result:** [what a passing result looks like]
**Priority:** High / Medium / Low

## Entry and Exit Criteria

### Entry Criteria
Conditions that must be true before testing begins.

### Exit Criteria
Conditions that must be true before testing is considered complete.

## Defect Management
How bugs found during testing are classified, tracked, and resolved before release.

| Severity | Definition | Resolution SLA |
|---|---|---|
| Critical | System cannot be used | Before release |
| High | Core feature broken | Before release |
| Medium | Non-core feature affected | Before next release |
| Low | Minor issue | Backlog |
```

---

### Release Notes

**When to write it:** Before every release, as part of the deployment checklist.

**Where to store it:** `docs/releases/[version].md`

**Purpose:** Communicates what changed, what was fixed, and what to watch for.

**Required sections:**

```markdown
# Release Notes — v[version]

**Release Date:** YYYY-MM-DD
**Type:** Major | Minor | Patch | Hotfix

## Summary
One paragraph describing what this release contains and its overall impact.

## What Changed

### New Features
- [FR-number] [feature name]: [one-line description]

### Bug Fixes
- [issue number] [short description]: [what was broken and what was fixed]

### Performance Improvements
- [description and measurable result]

### Security Fixes
- [CVE or issue reference]: [description, without exploitable detail]

## Breaking Changes
List every change that breaks backward compatibility. For each: what changed, who is affected, and what they must do.

## Deprecations
Functionality still present but scheduled for removal. Include the version it will be removed in.

## Migration Steps
Step-by-step instructions for upgrading from the previous version.

## Known Issues
Issues present in this release that are not yet resolved, with workarounds where available.

## Rollback Instructions
How to revert to the previous version if this release causes problems.
```

---

### Postmortem

**When to write it:** After any production incident with user impact, within 48 hours of resolution.

**Where to store it:** `docs/postmortems/YYYY-MM-DD-[short-title].md`

**Required sections:**

```markdown
# Postmortem: [title]

**Date of Incident:** YYYY-MM-DD
**Duration:** [start time] to [end time]
**Severity:** P1 / P2 / P3
**Author:** [name or role]
**Status:** Draft | Final

## Summary
What happened, in two to three sentences.

## Timeline
| Time (UTC) | Event |
|---|---|
| HH:MM | [what happened] |
| HH:MM | [what happened] |

## Root Cause
The specific technical or process failure that caused the incident.

## Impact
- Users affected: [number or percentage]
- Duration of impact: [time]
- Features affected: [list]
- Data affected: [yes / no, and if yes, what]

## What Went Well
Things that limited the damage or helped resolve the incident faster.

## What Went Wrong
Things that made the incident worse or harder to resolve.

## Action Items
| Action | Owner | Due Date | Status |
|---|---|---|---|
| [what will be done to prevent recurrence] | [role] | YYYY-MM-DD | Open |

## Detection
How the incident was detected. If it was not detected by monitoring, what monitoring should have caught it.
```

---

## Agent Behavior

These apply specifically to AI agents working in this codebase.

### Before starting

- Confirm the test suite passes in its current state.
- Confirm you understand the full scope of the task before touching any file.
- State your plan and wait for confirmation before executing it.

### While making changes

- Make the smallest change that satisfies the requirement. Do not improve adjacent code unless the task requires it.
- Do not change test assertions to make failing tests pass. Fix the code.
- Do not delete tests. If a test is wrong, fix it and explain why.
- Do not disable linting rules without a written justification in a comment and a linked issue.
- Do not add a dependency without asking first.
- Do not rename environment variables without updating every reference and `.env.example`.

### When to stop and ask

Stop immediately and ask — do not proceed — when:

- The task requires changes across more of the codebase than the plan anticipated.
- The task requires adding a new dependency.
- The task requires a database schema change not covered in the design.
- The task requires breaking a public API without a deprecation plan.
- The task requires disabling a security check.
- The correct approach is unclear between two or more valid options.
- Something discovered during the work contradicts the original requirements.

### After completing a task

Report:

- What was changed and why.
- What tests were added and what they verify.
- The test results.
- Any decisions made during implementation and the reasoning behind them.
- Any pre-existing problems noticed that are outside the task scope.

### What is never permitted

- Committing directly to the main branch.
- Deleting files not explicitly marked for deletion.
- Running destructive database commands outside local development.
- Disabling or bypassing security checks.
- Suppressing or skipping failing tests to make the suite appear green.
- Logging sensitive data.
- Committing secrets, credentials, or personal data in any form.

---

*This file applies to all work in this repository. Follow it. If something here needs to change, raise it explicitly rather than working around it.*
