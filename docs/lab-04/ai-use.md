# Lab 4 — AI Use and Reflection

**LLM/agent used:** Gemini 3.8 Flash (High) via Antigravity

## Selected key prompts (1–10)

| # | Prompt (summarised) | What I did with the result |
|---|---|---|
| 1 | Read and analyze SE_Lab_4.pdf completely; summarize sprint goal, required features, mandatory rules, exclusions, deliverables, and list all ambiguities. | Evaluated handout scope, verified 8 explicit exclusions, identified ambiguities (ActionTaken status, concurrency strategy, admin dashboard structure, landing screen), and aligned design choices. |
| 2 | Act as Specification Agent and draft docs/lab-04/specification.md across 11 required sections including Actions Taken, transition matrix, resolution gate, dashboards, and concurrency control. | Reviewed and approved `specification.md` ensuring full coverage of `FR-01` to `FR-12`, `BR-01` to `BR-16`, and `AC-01` to `AC-16` with at least 2 justified DB decisions. |
| 3 | Write docs/lab-04/api-spec.md with exact endpoint paths, request/response JSON shapes, status codes, safe error format, and optimistic locking (HTTP 409). | Validated that all new endpoints (`/api/tickets/:id/actions`, `/api/actions/:id`, `/api/dashboard/requester`, `/api/dashboard/staff`) follow safe error patterns and versioning. |
| 4 | Write docs/lab-04/ui-spec.md defining Zen Green design tokens, Requester & Staff dashboards, Actions Taken component, status controls, and responsive behavior across Desktop, Tablet, and Mobile. | Verified accessibility rules (2px focus rings, non-color status cues), table-to-card collapse on mobile, and pruning of legacy Lab 2 artifacts. |
| 5 | Write docs/lab-04/tests.md covering all testing layers (unit, API, UI, style, responsive, security, migration, E2E) with complete Acceptance Criteria traceability matrix. | Verified that all 16 Acceptance Criteria map directly to automated test cases across Server Supertest, Client Vitest, and Playwright E2E. |
| 6 | Create Sprint 4 GitHub backlog decomposed into 7 issues (Issues 26–32) with branch flow: feature branch -> PR -> lab4-staging -> main. | Confirmed branch naming and staged workflow matching course engineering guidelines. |

## Reflection

Using Gemini 3.8 Flash (High) as the Specification Agent in Sprint 4 established a comprehensive and internally consistent engineering contract before writing any implementation code (Spec DD). By clarifying key architecture decisions early—such as choosing integer `version` columns for deterministic optimistic concurrency control, separating `performedById` from `assigneeId` on `ActionTaken`, and maintaining server-side resolution authority—the specification directly resolves potential edge cases prior to implementation.

The test plan (`tests.md`) ensures complete traceability from high-level business rules to individual Supertest API specs, Vitest component mocks, and Playwright multi-viewport journeys, laying a solid foundation for Test-Driven Development (TDD) in the subsequent implementation issues.
