# Lab 1 — Test Plan and Evidence  (fill this in)

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | Pass |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | |
| 3 | Vitest | Heading renders | |
| 4 | Vitest | Success state shows Online + category list | |
| 5 | Vitest | Error state shows Offline + message | |

## Test Evidence

### Issue 2: API health check
```
 ✓ tests/lab-01/health.test.ts (1 test) 35ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  21:44:46
   Duration  1.03s
```

### Issue 4: Category list (Backend Integration)

*Pending implementation in Issue 4.*
