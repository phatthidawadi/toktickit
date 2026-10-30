# Lab 4 — AI Use and Reflection

**Author:** phatthidawadi  
**LLM/agent used:** Gemini 3.8 Flash (Medium) & Gemini 3.6 Flash (High) via Antigravity

---

## Selected Key Prompts (1–10)

| # | Prompt (summarised) | What I did with the result |
|---|---|---|
| 1 | Analyze the Lab 4 PDF handout (`Lab 4. TokTickIT Actions Taken, Dashboards, and Final Regression`) and extract all requirements: Actions Taken parent-child structure, permitted status transitions, advisory resolution gate, role-appropriate dashboards, and optimistic concurrency control. | Reviewed extracted functional boundaries, ensuring strict alignment with Lab 4 constraints and explicit exclusions (no automated SLA clocks, no external notifications, no billing). |
| 2 | Draft comprehensive Sprint 4 engineering contract under `docs/lab-04/` including `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` with numbered FR-01–FR-12, BR-01–BR-16, and AC-01–AC-17. | Verified that all 11 mandatory specification sections, Zen Green design tokens, 44px touch targets, and 9 coverage layers (including Performance-Smoke tests) are completely specified. |
| 3 | Decompose Sprint 4 into 8 sequential GitHub Issues (Issues 26–33, mapped to #64–#71) covering specification, foundation migration/seed/API, UI sections, ticket workflow, dashboards, E2E tests, hardening, and release integration. | Verified issue titles, scope mappings, acceptance criteria checklists, and dependency flows matching the GitHub Workflow Guide. |
| 4 | Resolve peer reviewer (@chanya06) feedback on PR #72: unify ticket status transitions strictly under IT Staff/Admin, clarify mandatory versioning for optimistic locking across all ticket/action mutations, align cancellation endpoint authorization to Requester only, and add performance-smoke test benchmarks (9th layer). | Updated `specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`, and established `docs/lab-04/reviewer.md` and `docs/lab-04/ai-use.md`. |
| 5 | *(Planned for Issue 27)* Design Prisma migration adding `ActionTaken` model, `ActionTakenStatus` enum, and `Ticket.version` field with non-destructive backfill and idempotent seed data. | Will verify database constraints, indexes, foreign key cascades, and idempotent execution. |
| 6 | *(Planned for Issue 28)* Implement Actions Taken UI components in Ticket Detail with create/edit modal dialogs, status badges, and concurrency conflict handling. | Will verify responsive table-to-card layout, modal trap focus, and Zen Green styling. |
| 7 | *(Planned for Issue 29)* Implement authoritative Ticket status transition matrix and advisory resolution gate middleware. | Will verify server-side rejection of invalid state transitions and optimistic concurrency 409 responses. |
| 8 | *(Planned for Issue 30)* Implement Requester and Staff Dashboard APIs with backend aggregation queries and drill-down navigation links. | Will verify accurate counter metrics, zero cross-requester data leakage, and drill-down filters. |
| 9 | *(Planned for Issue 31)* Implement multi-viewport Playwright E2E test suites covering Actions Taken logging, resolution gate, and dashboards. | Will verify automated browser journeys across Desktop, Tablet, and Mobile viewports with screenshot capture. |
| 10 | *(Planned for Issue 32–33)* Execute full Labs 1–3 regression test suites, verify visual polish and zero console warnings, and integrate `lab4-staging` into `main`. | Will verify 100% test pass rate, build verification, and compile final PDF submission artifact. |

---

## Reflection

### Specification-Agent Use
Using Gemini via Antigravity during the Sprint 4 contract phase significantly accelerated the translation of stakeholder requirements into formal engineering specifications. The agent was instrumental in defining unambiguous boundaries for the Actions Taken parent-child relationship, constructing the complete 8-state transition matrix, and mapping Acceptance Criteria across nine distinct quality assurance layers (Unit, API, Component, Style, Responsive, AuthZ, Migration, E2E, and Performance-Smoke).

Peer review by `@chanya06` highlighted critical nuances—specifically ensuring complete alignment between the status transition authorization matrix and the API endpoints (including requester-only cancellation endpoint scoping), explicitly requiring mandatory optimistic locking versions across all mutation routes, and including performance-smoke benchmarks. Collaborating with the AI agent enabled rapid, consistent updates across all contract documents simultaneously.

### Coding-Agent Use
*(To be expanded during implementation of Issues 27–33)*
