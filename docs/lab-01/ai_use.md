# Lab 1 — AI Use and Reflection

**LLM/agent used:** Antigravity (Gemini 3.5 Flash / Gemini 3.6 Flash)

## Selected key prompts (6–10)
| # | Prompt Name | Actual Prompt Text | What I did with the result / My Reflection |
|---|---|---|---|
| 1 | Plan Lab 1 Implementation | Read the enclosed TokTickIT Lab 1 requirements. Summarize the four GitHub Issues, their dependencies, required outputs, and required automated tests. Propose an implementation order. | Reviewed the structured plan and accepted the implementation sequence. |
| 2 | Set Up Project Foundation | Check the baseline TokTickIT project tech stack (React, TypeScript, Vite, Bootstrap, Node.js, Express, Prisma, PostgreSQL). Configure .env and README setup instructions. | Generated initial README.md and verified environment configuration. |
| 3 | Implement Health Check API | Implement GET /api/health returning status 200 with JSON { status: "ok", service: "TokTickIT API" } and run Supertest verification. | Verified the route implementation against health.test.ts. |
| 4 | Prisma Category Model & Migration | Define Prisma Category model with id, unique name, and createdAt fields, then run migration init. | Applied migration successfully to PostgreSQL database. |
| 5 | Idempotent Seed Script | Implement prisma/seed.ts using upsert to seed Account and Access, Hardware, Software, Network without producing duplicate records when run multiple times. | Verified by running npm run prisma:seed twice consecutively. |
| 6 | Category List API Route | Add GET /api/categories endpoint returning all categories sorted by ID in ascending order. | Verified with Supertest test in categories.test.ts. |
| 7 | Build Check System UI & Vitest Tests | Update App.tsx and api.ts to handle idle, loading, success (Online status + category list), and error (Offline status) states. Write Vitest UI unit tests. | Ran npm test in client directory; all 3 UI tests passed cleanly. |

## Reflection
By providing explicit context regarding the Git Flow strategy and acceptance criteria from the Lab 1 specification, the AI agent produced highly accurate full-stack implementations in a single pass. When configuring database connection credentials, I had to ensure PostgreSQL user privileges and connection strings were properly aligned before running Prisma migrations.
