# Sprint 2 Artificial Intelligence Assistance & Verification Log

## 1. Overview of AI Involvement

**AI Model Used**: Google Gemini 2.5 Pro

AI assistance was utilized during Sprint 2 (Lab 2) for:
- Architecture planning and decomposition of Sprint 2 requirements into 9 GitHub Issues (Issue 5 to Issue 13).
- Drafting Sprint 2 Engineering Specification (`specification.md`), UI Design Specification (`ui-spec.md`), REST API Contract (`api-spec.md`), and Test Plan (`tests.md`).
- Designing PostgreSQL database schema models in `schema.prisma` and idempotent seed script `seed.ts`.
- Implementing TypeScript backend API routes and Supertest API integration test suites.
- Implementing React frontend components in the Zen Green Theme (#006B3C) and Vitest RTL component test suites.

---

## 2. Key Prompts Table

| # | Prompt Summary | Purpose | AI Output |
|---|---|---|---|
| 1 | "Change all issue titles to `Issue N: <Description>` starting at Issue 5, omitting any `[Lab 2]` prefix. Strictly prohibit emojis in all Markdown documentation, commit messages, PR descriptions, and chat responses." | Naming convention and constraint alignment | Renamed GitHub Issues #14-#22 to Issue 5-Issue 13. Refactored all Markdown generation tools to maintain formal text output without emojis. |
| 2 | "Peer reviewer recommended clarifying ticket number sequence format as 6-digit zero-padded sequence (TKT-YYYY-XXXXXX). Update BR-01 and implement generateTicketNumber helper function." | Peer review feedback integration for BR-01 | Updated `BR-01` in `specification.md`, updated `api-spec.md`, and implemented `generateTicketNumber` in `server/src/utils/ticketNumber.ts` with unit test. |
| 3 | "Execute Issue 5 through Issue 12 sequentially using feature branches, commit without emojis, open PRs targeting lab2-staging, and link corresponding GitHub Issues (Closes #N)." | Feature branch and PR workflow execution | Created feature branches `feature/5-doc-spec` to `feature/12-attachment-lifecycle`, opened PRs #23-#30, and verified test execution before peer reviews. |
| 4 | "Implement GET /api/requesters to return active development requesters. Return id, name, email, department, isActive. Filter isActive: true only." | Requester API implementation (FR-01, BR-04) | Implemented `GET /api/requesters` with `where: { isActive: true }` and Supertest test in `requesters.api.test.ts`. |
| 5 | "Implement POST /api/tickets with field validation: summary 5-100 chars, description 10-1000 chars, valid categoryId, relatedSystemId, and requestedPriority. Generate TKT-YYYY-XXXXXX ticket number." | Create Ticket API with validation (FR-03, BR-06) | Implemented full validation logic and ticket number generation loop with collision avoidance in `POST /api/tickets`. |
| 6 | "Implement GET /api/tickets with search (ticketNumber, summary, description), filter by categoryId/priority/status, sort by createdAt_desc/asc/priority_desc, and pagination with limit cap at 50." | My Tickets list API (FR-06, FR-07, FR-08, BR-10) | Implemented full query with `where.OR` search, `orderBy` sort with `PRIORITY_RANK` map for priority sort, and paginated response. |
| 7 | "Implement Attachment upload: only allow image/jpeg, image/png, image/webp, application/pdf. Max 5MB. Reject 6th active attachment with 400. Soft-removed do not count toward active limit." | Attachment upload with whitelist and 5-file limit (BR-07, AC-04, AC-05) | Implemented `ALLOWED_MIME_TYPES` and `ALLOWED_EXTENSIONS` whitelist in multer fileFilter, `activeCount >= 5` check excluding removed files. |
| 8 | "Implement DELETE /api/attachments/:id as soft removal. Set isRemoved: true, removedReason, removedAt. Require reason >= 5 chars. Return 410 Gone on download of removed file." | Soft removal with reason and 410 Gone (BR-08, BR-09, AC-06) | Implemented soft delete with reason validation, `isRemoved: true` update, and 410 status on download endpoint. |
| 9 | "Implement GET /api/tickets/:id to return full ticket details including requester relation (id, name, email), category, relatedSystem, and ALL attachments including removed ones with isRemoved, removedReason, removedAt." | Ticket detail with requester relation and full attachment metadata (FR-09, BR-09) | Added `requester: { select: { id, name, email } }` and removed `where: { isRemoved: false }` from attachments include, returning all attachment metadata. |
| 10 | "Write Playwright E2E tests: requester selection, create ticket with validation failure state, success state with ticket number, my tickets sort by priority_desc with assertion, ticket detail with PDF upload and soft-removal with reason." | E2E test coverage (E2E-01, E2E-02, E2E-03) | Created `e2e/lab-02/requester-ticket-flow.spec.ts` with 3 test scenarios and 22 screenshots under `artifacts/lab-02/screenshots/`. |

---

## 3. Prompts & Human Guidance History

### Prompt Set 1: Naming Convention & Constraints Alignment
- **Human Guidance**: Change all issue titles to `Issue N: <Description>` starting at Issue 5, omitting any `[Lab 2]` prefix. Strictly prohibit emojis in all Markdown documentation, commit messages, PR descriptions, and chat responses.
- **AI Action & Response**: Renamed GitHub Issues #14 through #22 to `Issue 5` through `Issue 13`. Refactored all Markdown generation tools to maintain formal text output without emojis.

### Prompt Set 2: Peer Review Feedback Integration (BR-01)
- **Human Guidance**: Peer reviewer recommended clarifying ticket number sequence format as 6-digit zero-padded sequence (`TKT-YYYY-XXXXXX`).
- **AI Action & Response**: Updated `BR-01` in `docs/lab-02/specification.md`, updated `api-spec.md`, and implemented `generateTicketNumber` helper function in `server/src/utils/ticketNumber.ts` with unit test.

### Prompt Set 3: Feature Branch & PR Workflow Execution
- **Human Guidance**: Execute Issue 5 through Issue 12 sequentially using feature branches, commit without emojis, open PRs targeting `lab2-staging`, and link corresponding GitHub Issues (`Closes #N`).
- **AI Action & Response**: Created feature branches (`feature/5-doc-spec` to `feature/12-attachment-lifecycle`), opened PRs #23 through #30, and verified test execution before peer reviews.

---

## 4. Human Verification & Audit Strategy

All AI-generated code and documentation passed human verification:
1. **Schema Integrity**: Verified Prisma models against PostgreSQL via `npx prisma db push` and `npx prisma db seed`.
2. **Security & Authorization**: Verified HTTP 403 Forbidden enforcement on cross-requester ticket access and HTTP 410 Gone response on soft-removed attachment download.
3. **Attachment Whitelist**: Manually verified that only `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` are accepted and all other types (`.txt`, `.zip`, `.exe`, `.js`) are rejected with HTTP 400.
4. **UI Spec Compliance**: Verified Zen Green color palette (#006B3C Primary, #EAF6EF Pale Green, #F5F7F6 Off-White), font typography, and responsive card rendering (< 768px).
5. **Automated Testing**: Verified 100% test pass rate across 38 test cases: Server 6 files/23 tests, Client 8 files/12 tests, E2E 1 file/3 scenarios.

---

## 5. My Reflection

Using Google Gemini 2.5 Pro throughout Sprint 2 significantly accelerated the development cycle, particularly for boilerplate code generation, documentation drafting, and test scaffolding. However, working with AI assistance reinforced that human oversight is critical, especially for security-sensitive requirements.

The most valuable lesson came from the attachment validation feature. The initial implementation used a blacklist approach (blocking only known-dangerous extensions like `.exe`), which meant files like `.txt`, `.zip`, and `.js` were still accepted. After reviewing the lab specification carefully myself, I identified this gap and directed the AI to rewrite the filter as a strict whitelist, which is the correct and safer approach.

I also learned that AI-generated documentation sometimes drifts from actual implementation counts. Before finalizing `tests.md`, I personally ran `vitest run lab-02` on both server and client to confirm the exact numbers, then corrected the document to match reality rather than accepting AI estimates.

Overall, AI assistance is most effective when the developer has a clear understanding of the requirements and uses AI as an accelerator rather than a decision-maker. Every major architectural choice, security rule, and test result was independently verified before committing.
