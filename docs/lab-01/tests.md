# Lab 1 — Test Plan and Evidence

All test files live under `server/tests/lab-01/` and `client/tests/lab-01/`.

| # | Tool | Test File | Test Description | Result |
|---|------|-----------|------------------|--------|
| 1 | Supertest | `health.test.ts` | GET /api/health returns 200, status=ok | PASSED |
| 2 | Supertest | `categories.test.ts` | GET /api/categories returns 4 seeded categories in id order | PASSED |
| 3 | Vitest | `App.test.tsx` | Heading renders TokTickIT | PASSED |
| 4 | Vitest | `App.test.tsx` | Success state shows Online + category list | PASSED |
| 5 | Vitest | `App.test.tsx` | Error state shows Offline + error message | PASSED |

## Terminal Output Evidence

### Server Tests (Supertest)
```text
 > toktickit-server@1.0.0 test
 > vitest run

 RUN  v2.1.9 C:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 36ms
 ✓ tests/lab-01/categories.test.ts (1 test) 138ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Start at  20:40:15
   Duration  1.19s (transform 117ms, setup 0ms, collect 813ms, tests 174ms, environment 1ms, prepare 410ms)
```

### Client Tests (Vitest)
```text
 > toktickit-client@1.0.0 test
 > vitest run

 RUN  v2.1.9 C:/Users/Acer/Downloads/Lab1_Starter_Scaffold/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 232ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  20:41:01
   Duration  49.28s (transform 167ms, setup 6.87s, collect 8.60s, tests 232ms, environment 32.06s, prepare 940ms)
```
