# Lab 1 — AI Use and Reflection

**LLM/agent used:** Gemini 3.6 Flash (High) via Antigravity

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | Help me create an implementation plan for Issue 1 project foundation and git setup. | Reviewed and approved the plan to structure the repository correctly. |
| 2 | Reset main and lab1-staging to empty branches and move all files to feature/1-project-foundation. | Approved the restructuring. The agent moved the scaffold to the correct branch. |
| 3 | Update README.md with detailed setup instructions based on peer review comment. | The agent added comprehensive setup instructions and recorded the peer review. |
| 4 | Implement Issue 2 API health check. | The agent updated `app.ts` to return `{ status: "ok" }` and verified the test passed. |
| 5 | Implement Issue 3 Category Model and Seeding. | The agent updated `schema.prisma` and `seed.ts` to implement the Category model and idempotent seeding logic, then successfully seeded the DB. |

## Reflection
Using the AI agent significantly sped up the initial project scaffold and Git setup. I had to correct the agent when it initially put the scaffold files directly into `main` and `lab1-staging` instead of `feature/1-project-foundation` (because the instructions dictate an empty foundation). The agent was very effective at modifying the endpoints and models and running tests to verify.
