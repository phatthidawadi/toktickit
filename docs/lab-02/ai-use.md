# Lab 2 — AI Use and Reflection

**LLM/agent used:** Google Gemini 2.5 Pro via Antigravity

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Change all issue titles to `Issue N: <Description>` starting at Issue 5. Strictly prohibit emojis in all Markdown documentation and commit messages. | Reviewed and approved. The agent renamed GitHub Issues #14-#22 to Issue 5-Issue 13 and enforced no-emoji formatting throughout. |
| 2 | Peer reviewer recommended clarifying ticket number sequence as 6-digit zero-padded (TKT-YYYY-XXXXXX). Update BR-01 and implement generateTicketNumber helper function. | Reviewed the updated `specification.md` and the new `ticketNumber.ts` helper with unit test before approving. |
| 3 | Execute Issue 5 through Issue 12 sequentially using feature branches, commit without emojis, open PRs targeting lab2-staging, and link corresponding GitHub Issues. | Monitored each PR (#23–#30), verified tests passed, and waited for peer review approval before each merge. |
| 4 | Implement POST /api/tickets with full field validation: summary 5-100 chars, description 10-1000 chars, valid categoryId, relatedSystemId, requestedPriority, and generate TKT-YYYY-XXXXXX ticket number. | Reviewed the validation logic and ticket number collision-avoidance loop before approving. |
| 5 | Implement GET /api/tickets with search across ticketNumber, summary, and description (case-insensitive), filter by category/priority/status, sort by date and priority rank, and pagination with max limit 50. | Verified the `PRIORITY_RANK` map logic and confirmed `mode: "insensitive"` search was correct. |
| 6 | Implement strict attachment whitelist: allow only image/jpeg, image/png, image/webp, application/pdf. Reject 6th active attachment with HTTP 400. Soft-removed attachments must not count toward the active limit. | Manually tested uploading `.txt`, `.zip`, and `.exe` files to confirm they were rejected before approving. |
| 7 | GET /api/tickets/:id must return BOTH active and removed attachments with full metadata including isRemoved, removedReason, removedAt. Include requester relation with id, name, email. | Checked the endpoint response directly against `api-spec.md` section 3.6 before approving. |
| 8 | Write Playwright E2E tests: requester selection, create ticket with validation failure, success state with ticket number, my tickets sort by priority_desc with assertion, ticket detail with PDF upload and soft-removal. | Reviewed the spec file and ran the tests locally to confirm all 3 scenarios and screenshots were captured correctly. |

## Reflection
Using Google Gemini 2.5 Pro throughout Sprint 2 significantly accelerated the development cycle across documentation, backend API routes, React components, and automated tests. The agent was particularly effective at generating consistent TypeScript code and Vitest test suites that aligned with the spec.

However, I learned that AI output requires careful verification, especially for security rules. The initial attachment validation used a blacklist approach (blocking only `.exe`, `.bat`, `.cmd`, `.sh`), which still accepted `.txt`, `.zip`, and `.js` files. After reviewing the specification myself, I identified the gap and directed the agent to rewrite it as a strict whitelist. Every test result in `tests.md` was also manually verified against actual `vitest run` terminal output before committing, because AI-generated counts occasionally drifted from reality.
