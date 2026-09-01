# Lab 2 — AI Use and Reflection

**LLM/agent used:** Gemini 3.6 Flash (High) via Antigravity

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Help me decompose Sprint 2 requirements into GitHub Issues 5 through 14. | Approved and created GitHub Issues #14 through #22 and #32. |
| 2 | Create Sprint 2 specification, UI spec, API spec, and test plan docs. | Approved the specification files in `docs/lab-02/`. |
| 3 | Define Prisma schema models for RequesterUser, Category, RelatedSystem, Ticket, and Attachment. | Approved `schema.prisma` and idempotent database seed script `seed.ts`. |
| 4 | Implement Requester Context switcher and LocalStorage state persistence. | Verified `RequesterContext.tsx`, `RequesterSelectorScreen.tsx`, and component tests. |
| 5 | Implement Create Ticket API (`POST /api/tickets`) and form validation with `TKT-YYYY-XXXXXX` sequence. | Verified Supertest API tests and React Vitest UI component tests. |
| 6 | Implement My Tickets List API (`GET /api/tickets`), filtering, and mobile card view. | Verified data isolation header checks (`x-requester-id`) and search filtering. |
| 7 | Implement Ticket Detail Read-Only view (`GET /api/tickets/:id`) with 403 Forbidden enforcement. | Verified cross-requester access blocking and read-only field rendering. |
| 8 | Implement Attachment upload limit (5MB), executable file block, and soft removal (410 Gone). | Verified attachment upload route, soft removal modal, and download status code. |
| 9 | Write End-to-End User Journey test suite in Vitest + RTL. | Verified `E2EUserJourney.test.tsx` passing 100%. |
| 10 | Create Sprint 2 Developer Guide and Architecture Documentation (`developer-guide.md`). | Verified `developer-guide.md` containing 3-tier architecture diagram and setup commands. |

## Reflection
Using the AI agent accelerated the execution of Sprint 2 (Lab 2) features across both backend and frontend layers. The agent maintained strict test-driven development (TDD), generating Supertest API integration tests and Vitest UI component tests for each feature before submitting PRs. I guided the agent to adhere to custom formatting constraints (such as omitting emojis from documentation and commit messages, zero-padded ticket sequence numbers `TKT-YYYY-XXXXXX`, and HTTP 410 Gone status for soft-removed attachments). The automated test suite achieved a 100% pass rate across 25 test cases in 15 test files.
