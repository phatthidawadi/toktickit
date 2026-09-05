# Sprint 2 Artificial Intelligence Assistance & Verification Log

## 1. Overview of AI Involvement

**AI Models Used**: Google Gemini 2.5 Pro, Anthropic Claude (claude-3-5-sonnet)

AI assistance was utilized during Sprint 2 (Lab 2) for:
- Architecture planning and decomposition of Sprint 2 requirements into 9 GitHub Issues (Issue 5 to Issue 13).
- Drafting Sprint 2 Engineering Specification (`specification.md`), UI Design Specification (`ui-spec.md`), REST API Contract (`api-spec.md`), and Test Plan (`tests.md`).
- Designing PostgreSQL database schema models in `schema.prisma` and idempotent seed script `seed.ts`.
- Implementing TypeScript backend API routes and Supertest API integration test suites.
- Implementing React frontend components in the Zen Green Theme (#006B3C) and Vitest RTL component test suites.

---

## 2. Key Prompts Table

| # | Prompt Summary | AI Model | Purpose | Output |
|---|---|---|---|---|
| 1 | "Change all issue titles to `Issue N: <Description>` starting at Issue 5, omitting any `[Lab 2]` prefix. Strictly prohibit emojis in all Markdown documentation and commit messages." | Gemini 2.5 Pro | Naming convention alignment | Renamed Issues #14-#22, refactored all markdown tools to formal output |
| 2 | "Peer reviewer recommended clarifying ticket number sequence as 6-digit zero-padded (TKT-YYYY-XXXXXX). Update BR-01 and implement generateTicketNumber helper." | Claude | BR-01 implementation | Updated `specification.md`, `api-spec.md`, created `ticketNumber.ts` with unit test |
| 3 | "Execute Issue 5 through Issue 12 sequentially using feature branches, commit without emojis, open PRs targeting lab2-staging, and link corresponding GitHub Issues." | Gemini 2.5 Pro | Git workflow execution | Feature branches `feature/5-doc-spec` through `feature/12-attachment-lifecycle`, PRs #23-#30 |
| 4 | "Implement strict whitelist for file attachments: only image/jpeg, image/png, image/webp, application/pdf. Reject .txt .zip .js .py .mp4 .exe. Validate both MIME type and extension." | Claude | Security fix for attachment upload | Updated multer fileFilter with `ALLOWED_MIME_TYPES` and `ALLOWED_EXTENSIONS` whitelist |
| 5 | "Maximum 5 active attachments per ticket. Reject the 6th active upload with HTTP 400. Soft-removed attachments must NOT count toward the active limit." | Claude | BR-07 enforcement | Added `activeCount >= 5` check before upload, excluding `isRemoved: false` in count |
| 6 | "GET /api/tickets/:id must return BOTH active and removed attachments with full metadata including isRemoved, removedReason, removedAt. Remove the where: isRemoved: false filter from the attachments include." | Claude | BR-09 metadata visibility fix | Removed filter from `GET /api/tickets/:id` attachments include, added all metadata fields |
| 7 | "Fix mobile responsive layout: TokTickIT header must not clip on <768px. All form controls must be full-width. Zero horizontal scrolling." | Gemini 2.5 Pro | AC-08 responsive UI fix | Updated CSS grid, nav overflow, mobile card layout in `MyTicketsView.tsx` and `App.tsx` |
| 8 | "Write Playwright E2E test covering: requester selection, create ticket with validation failure, success state with ticket number, my tickets sorting, ticket detail with attachment upload and soft-removal." | Gemini 2.5 Pro | E2E test coverage | `e2e/lab-02/requester-ticket-flow.spec.ts` with 3 test scenarios and Playwright screenshots |
| 9 | "Implement GET /api/tickets/:id to include requester relation with id, name, email per api-spec.md section 3.6." | Claude | AC-01 requester relation | Added `requester: { select: { id, name, email } }` to ticket detail include |
| 10 | "Review all Lab 2 requirements against specification.md, api-spec.md, and actual implementation. Identify any blocking gaps before merging PR #36." | Claude | Pre-merge audit | Identified and fixed attachment whitelist, 6th-file limit, soft-remove metadata, requester relation gaps |

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

### Prompt Set 4: Attachment Security & Business Rule Fixes
- **Human Guidance**: Fix attachment whitelist to allow only jpeg/png/webp/pdf. Add 6-file limit check. Return soft-removed attachment metadata in ticket detail.
- **AI Action & Response**: Rewrote multer fileFilter to whitelist, added `activeCount >= 5` rejection, removed `where: isRemoved: false` from GET ticket detail attachments include.

---

## 4. Human Verification & Audit Strategy

All AI-generated code and documentation passed human verification:
1. **Schema Integrity**: Verified Prisma models against PostgreSQL via `npx prisma db push` and `npx prisma db seed`.
2. **Security & Authorization**: Verified HTTP 403 Forbidden enforcement on cross-requester ticket access and HTTP 410 Gone response on soft-removed attachment download.
3. **Attachment Whitelist**: Manually tested upload of `.txt`, `.zip`, `.exe`, `.js` files — all rejected with HTTP 400. Confirmed `.pdf`, `.jpg`, `.png`, `.webp` accepted.
4. **UI Spec Compliance**: Verified Zen Green color palette (#006B3C Primary, #EAF6EF Pale Green, #F5F7F6 Off-White), font typography, and responsive card rendering (< 768px).
5. **Automated Testing**: Verified 100% test pass rate across 38 test cases: Server 6 files/23 tests, Client 8 files/12 tests, E2E 1 file/3 scenarios.

---

## 5. My Reflection

Using AI assistance throughout Sprint 2 significantly accelerated the development cycle, particularly for boilerplate code generation, documentation drafting, and test scaffolding. However, I learned that AI outputs require careful human review — especially for security-sensitive features like file upload validation.

The most valuable lesson was that AI-generated attachment handling initially used a blacklist approach (blocking only known-dangerous extensions like `.exe`), which is a common mistake. After conducting an independent audit, I identified this gap and corrected it to a strict whitelist approach, rejecting all file types except the explicitly permitted ones.

I also noticed that AI sometimes generates documentation that claims passing tests before the tests actually exist or pass, which reinforces the importance of running tests manually and reconciling counts before finalizing any documentation. Every number in `tests.md` was verified against actual `vitest run` terminal output before committing.

Overall, AI assistance is a powerful productivity tool when paired with disciplined human oversight, spec-driven verification, and a clear testing strategy.
