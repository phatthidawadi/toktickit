# Sprint 2 Artificial Intelligence Assistance & Verification Log

## 1. Overview of AI Involvement
AI assistance was utilized during Sprint 2 (Lab 2) for:
- Architecture planning and decomposition of Sprint 2 requirements into 10 GitHub Issues (Issue 5 to Issue 14).
- Drafting Sprint 2 Engineering Specification (`specification.md`), UI Design Specification (`ui-spec.md`), REST API Contract (`api-spec.md`), Test Plan (`tests.md`), and Developer Guide (`developer-guide.md`).
- Designing PostgreSQL database schema models in `schema.prisma` and idempotent seed script `seed.ts`.
- Implementing TypeScript backend API routes and Supertest API integration test suites.
- Implementing React frontend components in the Zen Green Theme (#006B3C) and Vitest RTL component test suites.

---

## 2. Prompts & Human Guidance History

### Prompt Set 1: Naming Convention & Constraints Alignment
- **Human Guidance**: Change all issue titles to `Issue N: <Description>` starting at Issue 5, omitting any `[Lab 2]` prefix. Strictly prohibit emojis in all Markdown documentation, commit messages, PR descriptions, and chat responses.
- **AI Action & Response**: Renamed GitHub Issues #14 through #22 to `Issue 5` through `Issue 13`. Refactored all Markdown generation tools to maintain formal text output without emojis.

### Prompt Set 2: Peer Review Feedback Integration (BR-01)
- **Human Guidance**: Peer reviewer recommended clarifying ticket number sequence format as 6-digit zero-padded sequence (`TKT-YYYY-XXXXXX`).
- **AI Action & Response**: Updated `BR-01` in `docs/lab-02/specification.md`, updated `api-spec.md`, and implemented `generateTicketNumber` helper function in `server/src/utils/ticketNumber.ts` with unit test.

### Prompt Set 3: Feature Branch & PR Workflow Execution
- **Human Guidance**: Execute Issue 5 through Issue 14 sequentially using feature branches, commit without emojis, open PRs targeting `lab2-staging`, and link corresponding GitHub Issues (`Closes #N`).
- **AI Action & Response**: Created feature branches (`feature/5-doc-spec` to `feature/14-developer-guide`), opened PRs #23 through #33, and verified test execution before peer reviews.

---

## 3. Human Verification & Audit Strategy

All AI-generated code and documentation passed human verification:
1. **Schema Integrity**: Verified Prisma models against PostgreSQL via `npx prisma db push` and `npx prisma db seed`.
2. **Security & Authorization**: Verified HTTP 403 Forbidden enforcement on cross-requester ticket access and HTTP 410 Gone response on soft-removed attachment download.
3. **UI Spec Compliance**: Verified Zen Green color palette (#006B3C Primary, #EAF6EF Pale Green, #F5F7F6 Off-White), font typography, and responsive card rendering (< 768px).
4. **Automated Testing**: Verified 100% test pass rate across 25 test cases in 15 test files.
