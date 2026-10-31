# Lab 4 Test Plan and Quality Assurance Contract

**Sprint Title:** Actions Taken, Dashboards, and Final Regression  
**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Target Repository:** `toktickit`  
**Status:** Approved Test Plan Contract  

---

## 1. Test Strategy and Testing Architecture

Sprint 4 applies Spec-Driven Development (Spec DD) and Test-Driven Development (TDD) across the complete TokTickIT full-stack architecture. The testing strategy enforces 100% verification of all Functional Requirements (`FR-01` to `FR-12`), Business Rules (`BR-01` to `BR-16`), and Acceptance Criteria (`AC-01` to `AC-17`).

### Coverage Layers (Handout Section 10)
1. **Unit & Domain Tests**: Optimistic locking conflict logic, ticket status transition matrix validator, and date interval boundaries.
2. **Server API & Integration Tests (Supertest)**: Actions Taken CRUD, server-enforced RBAC, advisory resolution gate, status transition matrix, Requester dashboard metrics, Staff dashboard metrics, and Admin user summaries.
3. **UI Component Tests (Vitest + React Testing Library)**: Rendering of Requester Dashboard, Staff Dashboard, Actions Taken table/card views, Create/Edit action modals, and dynamic status transition dropdowns.
4. **UI Style & Design Consistency Tests**: Zen Green palette tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`), action status badges (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), and amber follow-up alerts.
5. **Responsive Viewport Tests**: Multi-device verification across Desktop ($\ge 992\text{px}$), Tablet ($768\text{px} - 991\text{px}$), and Mobile ($< 768\text{px}$) with table-to-card transformations and zero horizontal page overflow.
6. **Security & Authorization Tests**: Server-side role enforcement, cross-requester data isolation, rejection of inactive assignees, and Requester write protection on Actions Taken.
7. **Migration & Regression Tests**: Non-destructive Prisma migration verification, legacy ticket compatibility (zero actions), and 100% passing test status for all Lab 1–3 test suites.
8. **End-to-End (E2E) Browser Journeys (Playwright)**: Full multi-viewport browser journeys testing Actions Taken logging, ticket resolution workflow, and dashboard metric drill-downs across Chromium, Tablet, and Mobile.
9. **Performance-Smoke Tests**: Latency benchmarks across dashboard aggregations (< 200ms), actions chronological queries (< 150ms), and burst concurrency conflict throughput under operational loads.

---

## 2. Planned Tests Table

### 2.1 Server Unit & API Integration Tests

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACT-API-01** | API | AC-01, FR-01 | Create valid Action Taken line (`POST /api/tickets/:id/actions`) | HTTP 201 Created; auto-populates `performedById` from session; returns action object | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-02** | API | AC-02, BR-04 | Follow-up note validation enforcement | HTTP 400 Bad Request when `followUpRequired=true` but `followUpNote` is empty | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-03** | API | AC-03, BR-05 | Inactive or non-staff assignee rejection | HTTP 400 Bad Request when assigning to inactive user or user with role `REQUESTER` | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-04** | Security | AC-04, BR-03 | Requester creation block on Actions Taken | HTTP 403 Forbidden when Requester attempts to `POST /api/tickets/:id/actions` | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-05** | API | AC-04, FR-02 | Requester view actions on owned ticket | HTTP 200 OK; returns chronological array of actions for ticket owned by user | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-06** | Security | AC-05, BR-12 | Cross-requester action access block | HTTP 403 Forbidden when Requester attempts to fetch actions for another user's ticket | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-07** | API | FR-03, BR-14 | List actions ordering | HTTP 200 OK; actions strictly sorted by `actionDateTime ASC, id ASC` | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-08** | API | FR-03, BR-02 | Update Action Taken (`PATCH /api/actions/:id`) | HTTP 200 OK; updates description, result, status, and assignee | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **ACT-API-09** | Concurrency | AC-09, BR-10 | Optimistic concurrency conflict on Action Taken | HTTP 409 Conflict when submitting update with stale `version` | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **FLOW-API-01**| Workflow | AC-06, BR-06 | Requester "Problem Appears Resolved" toggle (`PATCH /api/tickets/:id/resolve-ack`) | HTTP 200 OK; sets `isRequesterResolved=true`, increments version, preserves active status | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-02**| Workflow | AC-07, FR-05 | IT Staff formal resolution (`IN_PROGRESS -> RESOLVED`) | HTTP 200 OK; updates `currentStatus` to `RESOLVED` and increments `version` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-03**| Workflow | AC-08, BR-07 | Invalid status transition rejection (`NEW -> RESOLVED`) | HTTP 400 Bad Request with error code `INVALID_STATUS_TRANSITION` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-04**| Workflow | BR-08 | Requester ticket cancellation in `NEW` status | HTTP 200 OK; transitions `NEW -> CANCELLED`; rejects cancellation if `OPEN` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-05**| Workflow | BR-09 | Auto-transition on Requester comment | Submitting public comment on `WAITING_FOR_REQUESTER` auto-transitions to `IN_PROGRESS` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-06**| Concurrency | AC-09, BR-10 | Optimistic locking on ticket status update | HTTP 409 Conflict when submitting status update with stale `ticket.version` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-07**| Concurrency | AC-09, BR-10 | Optimistic locking on resolve-ack toggle | HTTP 409 Conflict when submitting resolve-ack with stale `ticket.version` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-08**| Concurrency | AC-09, BR-10 | Optimistic locking on requester ticket cancellation | HTTP 409 Conflict when submitting cancel with stale `ticket.version` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **FLOW-API-09**| Security | BR-07 | Requester formal status transition block | HTTP 403 Forbidden when Requester calls `/api/staff/tickets/:id/status` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **DASH-API-01**| API | AC-10, FR-08 | Requester dashboard metrics (`GET /api/dashboard/requester`) | HTTP 200 OK; returns `totalOpenTickets`, `ticketsWaitingForRequester`, `recentlyResolvedTickets` | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **DASH-API-02**| Security | BR-12 | Requester dashboard ownership isolation | HTTP 200 OK; metrics strictly omit tickets belonging to other requesters | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **DASH-API-03**| API | FR-08, BR-13 | Requester dashboard recent tickets stream | HTTP 200 OK; returns up to 5 most recently updated owned tickets | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **DASH-API-04**| Security | FR-08 | Staff/Admin access block on Requester dashboard | HTTP 403 Forbidden when non-requester calls `/api/dashboard/requester` | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **DASH-API-05**| API | AC-11, FR-09 | IT Staff dashboard queue metrics (`GET /api/dashboard/staff`) | HTTP 200 OK; returns `unassignedTickets`, `myAssignedTickets`, status & priority breakdowns | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **DASH-API-06**| API | AC-12, FR-10 | Administrator user account summary inclusion | HTTP 200 OK; includes `adminUserSummary` for Admin; omitted for IT Staff | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **DASH-API-07**| Security | FR-09 | Requester access block on Staff dashboard | HTTP 403 Forbidden when Requester calls `/api/dashboard/staff` | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **MIG-API-01** | Migration | AC-16, BR-01 | Database migration non-destructive check | All pre-existing Lab 1–3 tickets, users, comments, and attachments remain readable | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |

---

### 2.2 Client Vitest UI Component, Style & Responsive Tests

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-ACT-01** | UI Component | AC-04, FR-02 | Requester read-only Actions Taken rendering | Renders chronological action lines; "+ Record Action" and "Edit" buttons omitted | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-ACT-02** | UI Component | AC-01, FR-01 | IT Staff record action modal | Opens modal, submits valid action description/result, triggers API POST and updates list | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-ACT-03** | UI Component | AC-02, BR-04 | Follow-up toggle & mandatory validation | Checking follow-up toggle reveals note input; prevents submit if empty | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-ACT-04** | UI Component | AC-03, BR-05 | Inactive assignee alert feedback | Displays validation error alert when assigned user is rejected by server | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-ACT-05** | UI Component | AC-09, BR-10 | Concurrency conflict handling in edit modal | Displays warning banner on HTTP 409 and preserves entered form text | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-FLOW-01**| UI Component | FR-05, BR-07 | Permitted status transition dropdown options | Dropdown displays ONLY matrix-allowed transitions for current ticket status | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-FLOW-02**| UI Component | AC-06, BR-06 | Advisory resolution callout banner | Renders amber callout when `isRequesterResolved=true` guiding staff to verify work | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-FLOW-03**| UI Component | AC-08, BR-07 | Status update submission with version | Submits target status with `ticket.version`; displays error alert on failure | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-DASH-01**| UI Component | AC-10, FR-08 | Requester dashboard metrics & cards | Renders 3 summary cards, recent tickets table, and "+ Create Ticket" button | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **UI-DASH-02**| UI Component | AC-13, FR-11 | Requester metric drill-down click | Clicking "Waiting on You" metric card navigates to filtered ticket list | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **UI-DASH-03**| UI Component | FR-08 | Requester dashboard empty zero-state | Displays friendly zero-state callout when user has 0 active tickets | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **UI-DASH-04**| UI Component | AC-11, FR-09 | IT Staff dashboard operational triage view | Renders 4 operational cards, status distribution, and recent queue activity | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-DASH-05**| UI Component | AC-12, FR-10 | Administrator user account summary card | Renders Admin user account card with role counts; hidden for IT Staff | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-DASH-06**| UI Component | AC-13, FR-11 | Staff queue metric drill-down click | Clicking "Unassigned Tickets" card navigates to `/staff/queue?filter=unassigned` | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-NAV-01** | UI Component | FR-12 | Header navigation with active Dashboard tab | Post-login directs to Dashboard; header displays highlighted active tab | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |

---

### 2.3 End-to-End (E2E) Playwright Tests

| Test ID | Viewport | Requirement / AC | User Journey Tested | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-01-A** | Desktop (1280px)| AC-01, AC-02 | IT Staff logs in, claims ticket, records Action Taken with follow-up note | Action line appears in list with green status pill and amber follow-up note | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| **E2E-01-B** | Tablet (768px) | AC-04, AC-14 | Requester logs in, views owned ticket Actions Taken | Actions Taken rendered in read-only format; zero create/edit buttons visible | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| **E2E-01-C** | Mobile (375px) | AC-14, AC-15 | Mobile stacked card view for Actions Taken | Actions table collapses into vertical cards; 44px touch targets; no horizontal scroll | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| **E2E-02-A** | Desktop (1280px)| AC-06, AC-07 | Requester marks problem resolved $\to$ IT Staff verifies and marks `RESOLVED` | Advisory flag shown; only staff transition updates status to `RESOLVED` | `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| **E2E-02-B** | Desktop (1280px)| AC-08, AC-09 | Permitted status transitions & optimistic locking | Permitted dropdown values verified; concurrent update conflict safely alerts user | `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| **E2E-03-A** | Desktop (1280px)| AC-10, AC-13 | Requester logs in $\to$ lands on Dashboard $\to$ clicks drill-down | Dashboard renders accurate counts; drill-down filters ticket view | `e2e/lab-04/dashboards.spec.ts` | Passed |
| **E2E-03-B** | Desktop (1280px)| AC-11, AC-12 | Admin logs in $\to$ views Staff Dashboard with User Summary card | Unassigned counts, status breakdown, and user administration counts match DB | `e2e/lab-04/dashboards.spec.ts` | Passed |
| **E2E-03-C** | Mobile (375px) | AC-14, AC-15 | Mobile dashboard layout & focus indicators | Single-column stacked metric cards; visible focus rings; responsive navigation | `e2e/lab-04/dashboards.spec.ts` | Passed |

---

### 2.4 Performance-Smoke Tests (Handout Section 10)

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PERF-SMK-01** | Performance | AC-17 | Dashboard metric queries latency under load (100+ tickets in DB) | `GET /api/dashboard/requester` and `/api/dashboard/staff` respond with p95 < 200ms | `server/tests/lab-04/performance-smoke.test.ts` | Passed |
| **PERF-SMK-02** | Performance | AC-17 | Actions Taken chronological query latency (ticket with 20+ action lines) | `GET /api/tickets/:id/actions` responds with p95 < 150ms | `server/tests/lab-04/performance-smoke.test.ts` | Passed |
| **PERF-SMK-03** | Performance | AC-17, BR-10 | Burst concurrency conflict throughput (10 concurrent updates) | 1 write succeeds, 9 fail with 409 Conflict safely; average latency < 300ms | `server/tests/lab-04/performance-smoke.test.ts` | Passed |

---

## 3. Acceptance Criteria Traceability Matrix

Every Acceptance Criterion defined in `specification.md` maps directly to verified automated test cases:

| Acceptance Criterion | Linked Automated Test Cases | Verification Scope | Target Coverage |
| :--- | :--- | :--- | :---: |
| **AC-01** (Create Action Taken & Auto Performer) | `ACT-API-01`, `UI-ACT-02`, `E2E-01-A` | Server API, Client UI Modal, Playwright E2E | **100%** |
| **AC-02** (Follow-Up Note Validation) | `ACT-API-02`, `UI-ACT-03`, `E2E-01-A` | Server validation, Client form validation, E2E | **100%** |
| **AC-03** (Inactive Assignee Rejection) | `ACT-API-03`, `UI-ACT-04` | Server RBAC, Client error alert | **100%** |
| **AC-04** (Requester Read-Only Visibility) | `ACT-API-04`, `ACT-API-05`, `UI-ACT-01`, `E2E-01-B` | Supertest RBAC, Client render, E2E journey | **100%** |
| **AC-05** (Cross-Requester Action Isolation) | `ACT-API-06` | Server ownership middleware | **100%** |
| **AC-06** (Advisory Resolution Gate Enforcement)| `FLOW-API-01`, `UI-FLOW-02`, `E2E-02-A` | Server API, Client banner, E2E workflow | **100%** |
| **AC-07** (Staff Formal Resolution Enforcement) | `FLOW-API-02`, `UI-FLOW-03`, `E2E-02-A` | Server transition matrix, Client submit, E2E | **100%** |
| **AC-08** (Invalid Transition Matrix Rejection) | `FLOW-API-03`, `FLOW-API-09`, `UI-FLOW-01`, `E2E-02-B` | Server 400 rejection, UI dropdown filtering | **100%** |
| **AC-09** (Optimistic Concurrency Conflict 409) | `ACT-API-09`, `FLOW-API-06`, `FLOW-API-07`, `FLOW-API-08`, `UI-ACT-05`, `E2E-02-B` | Server 409 conflict, Client modal handling | **100%** |
| **AC-10** (Requester Dashboard Metric Accuracy) | `DASH-API-01`, `DASH-API-03`, `UI-DASH-01`, `E2E-03-A` | Server aggregation, Client UI, E2E journey | **100%** |
| **AC-11** (Staff Dashboard Queue Metrics Accuracy)| `DASH-API-05`, `UI-DASH-04`, `E2E-03-B` | Server queue aggregation, Client UI, E2E | **100%** |
| **AC-12** (Administrator User Summary Presence) | `DASH-API-06`, `UI-DASH-05`, `E2E-03-B` | Server conditional payload, UI render, E2E | **100%** |
| **AC-13** (Dashboard Drill-Down Navigation) | `UI-DASH-02`, `UI-DASH-06`, `E2E-03-A` | Client router click targets, E2E navigation | **100%** |
| **AC-14** (Responsive Layout Integrity) | `E2E-01-C`, `E2E-03-C` | Multi-viewport Playwright (Desktop/Tablet/Mobile) | **100%** |
| **AC-15** (Visible Keyboard Focus Rings) | `E2E-01-C`, `E2E-03-C` | Keyboard Tab navigation & CSS focus styles | **100%** |
| **AC-16** (Full Labs 1–3 Regression Preservation)| `MIG-API-01`, existing test suites | Server 84 tests, Client 24 tests, Playwright 21 tests | **100%** |
| **AC-17** (Performance-Smoke Benchmarks) | `PERF-SMK-01`, `PERF-SMK-02`, `PERF-SMK-03` | Latency thresholds (< 200ms, < 150ms), burst safety | **100%** |

---

## 4. Planned Test Execution Commands

```bash
# 1. Execute Server Unit and REST API Tests (Labs 1–4)
npm test --prefix server

# 2. Execute Client Vitest UI Component, UI Style & Responsive Tests (Labs 1–4)
npm test --prefix client

# 3. Execute Client Production Build Validation
npm run build --prefix client

# 4. Execute End-to-End Playwright Multi-Device Tests
npx playwright test --config=e2e/playwright.config.ts
```
