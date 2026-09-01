# Lab 2 — Test Plan and Evidence

All test files live under server/tests/lab-02/ and client/tests/lab-02/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Vitest | generateTicketNumber sequence formatting | Pass |
| 2 | Supertest | GET /api/requesters returns active requesters | Pass |
| 3 | Supertest | POST /api/tickets creates ticket with status NEW and TKT-YYYY-XXXXXX | Pass |
| 4 | Supertest | POST /api/tickets missing x-requester-id returns 400 | Pass |
| 5 | Supertest | POST /api/tickets invalid field validation returns 400 | Pass |
| 6 | Supertest | GET /api/tickets returns paginated tickets for requester | Pass |
| 7 | Supertest | GET /api/tickets search, category, status, priority filtering | Pass |
| 8 | Supertest | GET /api/tickets/:id returns ticket detail | Pass |
| 9 | Supertest | GET /api/tickets/:id cross-requester access returns 403 Forbidden | Pass |
| 10 | Supertest | GET /api/tickets/:id non-existent ID returns 404 Not Found | Pass |
| 11 | Supertest | POST /api/tickets/:id/attachments uploads attachment (5MB limit) | Pass |
| 12 | Supertest | POST /api/tickets/:id/attachments rejected .exe file returns 400 | Pass |
| 13 | Supertest | DELETE /api/attachments/:id soft removal stores reason | Pass |
| 14 | Supertest | GET /api/attachments/:id/download soft-removed file returns 410 Gone | Pass |
| 15 | Vitest | RequesterSelectorScreen modal rendering & context switch | Pass |
| 16 | Vitest | CreateTicketForm inline validation & submit state | Pass |
| 17 | Vitest | MyTicketsView table, search input, & mobile cards | Pass |
| 18 | Vitest | TicketDetailView read-only fields & attachment list | Pass |
| 19 | Vitest | Attachment upload box & soft removal confirmation modal | Pass |
| 20 | Vitest | E2E User Journey (Selector -> Create Ticket -> My Tickets -> Detail) | Pass |

## Test Evidence

### Issue 8: Development Requester Context
```
 ✓ tests/lab-02/requesters.api.test.ts (1 test) 152ms
 ✓ tests/lab-02/RequesterSelector.test.tsx (1 test) 130ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
```

### Issue 9: Create Ticket API & Form Validation
```
 ✓ tests/lab-02/ticket-number.test.ts (1 test) 4ms
 ✓ tests/lab-02/create-ticket.api.test.ts (3 tests) 284ms
 ✓ tests/lab-02/CreateTicket.test.tsx (1 test) 143ms

 Test Files  3 passed (3)
      Tests  5 passed (5)
```

### Issue 10: My Tickets List & Filtering
```
 ✓ tests/lab-02/my-tickets.api.test.ts (3 tests) 325ms
 ✓ tests/lab-02/MyTickets.test.tsx (1 test) 189ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### Issue 11: Requester Ticket Detail Read-Only View
```
 ✓ tests/lab-02/ticket-detail.api.test.ts (3 tests) 369ms
 ✓ tests/lab-02/TicketDetail.test.tsx (1 test) 182ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### Issue 12: Attachment Lifecycle
```
 ✓ tests/lab-02/attachments.api.test.ts (3 tests) 414ms
 ✓ tests/lab-02/Attachment.test.tsx (1 test) 190ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### Issue 13: E2E User Journey Test
```
 ✓ tests/lab-02/E2EUserJourney.test.tsx (1 test) 296ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```
