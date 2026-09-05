# Lab 2 — AI Use and Reflection

**LLM/agent used:** Gemini 3.6 Flash (High) via Antigravity

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | "ไฟล์นี้คืองานแลป2ที่บอกว่างานนี้ต้องทำอะไร รีวิวโค้ดและให้คำแนะนำจาก Issue 5: Lab 2 Sprint Engineering Specification #23 ให้หน่อย ให้รีวิวเฉยๆนะยังไม่ต้องทำการแก้ไขโค้ดเพราะจะเอาไปคอมเม้นเพื่อน" | Took the agent's review and used it as comment on partner's PR #23. Approved after partner updated the spec. |
| 2 | "โอเคงั้นพาทำ issue 7 ขึ้น PR review หน่อย" | Reviewed the plan for Issue 7 (Database Schema & Seed). The agent created the branch, commits, and opened PR #25 targeting lab2-staging. |
| 3 | "โอเคงั้นพาทำ issue 8 ขึ้น PR review หน่อย" | The agent created the Requester Context feature branch and opened PR #26 with React Context, LocalStorage persistence, and RequesterSelector UI. |
| 4 | "โอเคงั้นพาทำ issue 9 ขึ้น PR review หน่อย" | The agent implemented the Create Ticket form and API, opened PR #27 with full field validation, ticket number generator, and Vitest tests. |
| 5 | "โอเคเพื่อนกด merge ให้เรียบร้อยแล้ว แล้วต้องทำอะไรต่อ" | Followed the agent's next-step guidance to continue to the following Issue and open the next PR in sequence. |
| 6 | "รีวิว Issue 12: Ticket Detail and Attachment Lifecycle #30 ให้ที" | Reviewed the agent's analysis of partner's PR #30 covering attachment upload, soft-removal modal, and 410 Gone endpoint. Used it as comment for partner. |
| 7 | "เพื่อนตอบกลับมา แก้ครบทั้ง 3 ข้อแล้ว เพิ่มตรวจ isActive ของ Requester ก่อนอัปโหลดไฟล์ เพิ่มเช็กประเภทและขนาดไฟล์ฝั่งหน้าเว็บก่อนส่ง request เพิ่ม word-break: break-word ให้ชื่อไฟล์ยาวบนมือถือ ตอนนี้ Server ผ่าน 30/30 และ Client ผ่าน 15/15 รบกวนช่วยตรวจให้อีกรอบนะ" | Verified the agent's second-pass review of partner's fixes, confirmed all 3 issues were resolved, then approved and merged partner's PR. |
| 8 | "อย่าเพิ่งให้ PR ล่าสุด merge เองนะ" | Set a constraint for the agent not to auto-merge. Reviewed the outstanding PR manually before deciding to merge. |

## Reflection
Using Gemini 3.6 Flash (High) via Antigravity throughout Sprint 2 sped up the development cycle significantly. The agent was effective at generating feature branches, writing backend API routes with validation, and creating Vitest test suites. It also helped produce review comments for partner PRs that were detailed and aligned with the lab specification.

However, I had to actively direct the agent — it sometimes moved ahead without waiting for peer review approval. I also discovered that the initial attachment validation used a blacklist approach, which still allowed `.txt` and `.zip` files through. After reviewing the lab spec myself, I directed the agent to rewrite it as a strict whitelist. Every test count in `tests.md` was also manually verified by running `vitest run` locally before committing, since the agent's documentation sometimes differed from actual results.
