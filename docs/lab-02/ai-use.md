# Lab 2 — AI Use and Reflection

**LLM/agent used:** Gemini 3.6 Flash (High) via Antigravity

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Change all issue titles to `Issue N: <Description>` starting at Issue 5, omitting any `[Lab 2]` prefix. Strictly prohibit emojis in all Markdown documentation, commit messages, PR descriptions, and chat responses. | Reviewed and approved. The agent renamed GitHub Issues #14-#22 to Issue 5-Issue 13 and enforced no-emoji formatting. |
| 2 | Peer reviewer recommended clarifying ticket number sequence format as 6-digit zero-padded sequence (`TKT-YYYY-XXXXXX`). Update BR-01 and implement `generateTicketNumber` helper function with unit test. | Reviewed the updated `specification.md` and the new `ticketNumber.ts` helper before approving the change. |
| 3 | Execute Issue 5 through Issue 12 sequentially using feature branches, commit without emojis, open PRs targeting `lab2-staging`, and link corresponding GitHub Issues (`Closes #N`). | Monitored each PR (#23-#30), verified tests passed, and waited for peer review approval before each merge. |
| 4 | Implement `GET /api/tickets` with keyword search across `ticketNumber`, `summary`, and `description` (case-insensitive), filter by category, priority, status, sort by date and priority rank (`URGENT > HIGH > MEDIUM > LOW`), and pagination capped at limit 50. | Tested the endpoint manually and confirmed the priority sort order matched the spec before approving. |
| 5 | Implement attachment upload strict whitelist: allow only `image/jpeg`, `image/png`, `image/webp`, `application/pdf`. Reject the 6th active attachment with HTTP 400. Soft-removed attachments must not count toward the active limit. | Manually tested uploading `.txt` and `.exe` files to confirm rejection before approving. |
| 6 | `GET /api/tickets/:id` must return BOTH active and soft-removed attachments with full metadata (`isRemoved`, `removedReason`, `removedAt`). Include requester relation (`id`, `name`, `email`). | Checked the response structure against `api-spec.md` section 3.6 directly before approving. |
| 7 | Write end-to-end Playwright tests covering: requester selection, create ticket with validation failure, success state with ticket number, My Tickets sort by `priority_desc` with order assertion, ticket detail with PDF upload and soft-removal with reason input. | Ran the tests locally to confirm all 3 scenarios passed and screenshots were captured before committing. |
| 8 | Implement `DELETE /api/attachments/:id` as soft removal with mandatory reason (min 5 chars). Set `isRemoved: true`, `removedReason`, `removedAt`. Return HTTP 410 Gone when soft-removed attachment is downloaded. | Verified the endpoint with Supertest and confirmed the download returned 410 before approving. |
| 9 | Fix mobile responsive layout for viewports under 768px: header must not clip, all form controls must be full-width, My Tickets table must transform to card layout, zero horizontal scrolling. | Reviewed the Playwright mobile screenshots to confirm layout was correct before approving. |
| 10 | Perform a full pre-merge audit of the PR against `specification.md`, `api-spec.md`, and the actual implementation. Report all blocking issues before merging into `lab2-staging`. | Reviewed the audit report, verified each blocking issue was fixed, and confirmed all 38 tests passed before deciding to merge. |

## Reflection
Using Gemini 3.6 Flash (High) via Antigravity throughout Sprint 2 significantly accelerated the development cycle across documentation drafting, backend API routes, React components, and automated test suites. The agent was particularly effective at generating consistent TypeScript code and keeping test coverage aligned with the spec.

However, I learned that AI outputs require careful human verification, especially for security-sensitive rules. The initial attachment validation used a blacklist approach that still accepted `.txt` and `.zip` files. After reviewing the specification myself, I identified this gap and directed the agent to rewrite it as a strict whitelist. Every test count in `tests.md` was also manually verified by running `vitest run` locally before committing, since the agent's documentation occasionally drifted from actual results.
