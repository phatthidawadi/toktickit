# Lab 3 — AI Use and Reflection

**LLM/agent used:** Gemini 3.6 Flash (High) via Antigravity

## Selected key prompts (1–10)

| # | Prompt (summarised) | What I did with the result |
|---|---|---|
| 1 | Produce Stage 1 specifications docs/lab-03/ (specification.md, ui-spec.md, api-spec.md) translating Lab 3 PDF handout into concise engineering specs. Strictly prohibit emojis. | Reviewed and validated that all FRs, BRs, ACs, schema evolution, migration, and Zen Green tokens match handout scope. |
| 2 | Confirm JWT expiration duration and logout server/client behavior in api-spec.md before proceeding to Stage 2. | Verified 8h expiration and cookie clearing header implementation details. |
| 3 | Enhance BR-10 status matrix into explicit table specifying permitted roles per transition, and ensure BRs cover Admin self-deactivation block and last Admin protection. | Verified BR-10 matrix table and BR-14/BR-15 rule definitions. |
| 4 | Produce Stage 2 docs/lab-03/tests.md covering 8 explicit test coverage layers with AC traceability matrix. | Reviewed test IDs, 51 planned test cases across 8 testing layers, and execution commands. |
| 5 | Propose breakdown of GitHub Issues starting at Issue 15 with title, scope mapping, ACs, and dependencies. | Reviewed and refined Issue 16 seed requirements to match Section 5.3 split. |
| 6 | Create 11 GitHub Issues on repository phatthidawadi/toktickit via gh CLI. | Verified created issues #38 to #48 on GitHub. |
| 7 | Design Lab 3 database migration plan (RequesterUser to User role migration, data-preserving rename, passwordHash, mustChangePassword) and seed script updating 4 active / 1 inactive Requesters and 3 active / 1 inactive IT Staff accounts. | Verified SQL migration script idempotency, foreign key integrity, password hashing with bcryptjs, and seed data splits. |
| 8 | Implement JWT authentication endpoints (/api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/change-password) and server-side RBAC middleware (requireRole, checkPasswordChangeState). | Verified HTTP-only cookie security flags, password complexity validation, rate-limiting against brute force, and 401/403 error status code precision. |
| 9 | Develop IT Staff Queue & Operational view, Admin User Management CRUD API + React UI components, and confidential Internal Notes amber container styling (#FEF3C7). | Verified role-based navigation tabs, modal dialog state, self-deactivation & last-admin safety protections, and public vs private comment stream isolation. |
| 10 | Implement Playwright E2E integration test suite across 3 viewports (Chromium, Tablet, Mobile) and verify Zen Green visual style tokens, focus ring outlines, and touch target rules. | Verified 21/21 E2E tests passing, hard assertions, test idempotency via DB reset API, and screenshot evidence generation across 4 artifact folders. |

## Reflection

Using Gemini 3.6 Flash (High) via Antigravity throughout Sprint 3 Stage 1 to Stage 3 enabled rapid, structured specification drafting, rigorous security middleware design, and precise test planning. The agent effectively maintained strict consistency across the 4 core contracts (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`) and verified 100% AC traceability across 8 testing layers.

Human Auditor verification remained crucial when confirming specific rubric items—such as the explicit 4 active / 1 inactive Requester and 3 active / 1 inactive IT Staff seed account splits, ensuring server-side RBAC enforcement without relying on hidden UI controls, removing login bypass mechanisms, and verifying Playwright E2E strict mode selectors across multiple responsive viewports.
