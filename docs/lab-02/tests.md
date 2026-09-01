# Lab 2 Test Plan and Results

## 1. Test Strategy

Sprint 2 (Lab 2) applies Spec-Driven Development (Spec DD) and Test-Driven Development (TDD). The test suite ensures comprehensive coverage across multiple testing levels:
- **Unit Tests**: Generator logic, validation rules, formatting functions.
- **API Integration Tests**: Supertest suite for backend REST endpoints, validation, header checks, HTTP status codes, and cross-requester ownership isolation.
- **UI Component Tests**: Vitest & React Testing Library suite for form rendering, field states, Zen Green visual tokens, button hierarchy, and responsive behavior.
- **End-to-End (E2E) Tests**: Playwright suite testing full user workflows across Desktop and Mobile viewports.

---

## 2. Planned Tests Table

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket Number format generator | Returns `TKT-YYYY-XXXXXX` format with 6-digit zero-padded sequence | `server/tests/lab-02/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | BR-06, BR-07 | Validation helper functions | Correctly validates field lengths, MIME types, and file sizes | `server/tests/lab-02/validation.test.ts` | Pass |
| **API-01** | API | AC-01, FR-03 | Valid ticket creation (`POST /api/tickets`) | HTTP 201 Created; returns saved ticket with official Ticket Number and status `NEW` | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | BR-06 | Create ticket invalid input | HTTP 400 Bad Request when summary < 5 chars or description < 10 chars | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-02, BR-03 | Missing `x-requester-id` header | HTTP 400 Bad Request when header is omitted | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-04** | API | AC-07, FR-06 | Paginated ticket list retrieval (`GET /api/tickets`) | HTTP 200 OK; returns only tickets belonging to current Requester; supports search/filter | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-05** | API | AC-03, FR-10 | Cross-requester ticket detail access (`GET /api/tickets/:id`) | HTTP 403 Forbidden when Requester B attempts to access Requester A's ticket | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-06** | API | AC-04, AC-05 | Attachment upload constraints (`POST /api/tickets/:id/attachments`) | HTTP 400 when file > 5MB or invalid extension (.exe) | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-07** | API | AC-06, BR-08 | Attachment soft removal (`DELETE /api/attachments/:id`) | HTTP 200 OK; marks `isRemoved = true` and stores removal reason | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-08** | API | BR-09 | Soft-removed attachment download (`GET /api/attachments/:id/download`) | HTTP 410 Gone when attempting to download soft-removed file | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **UI-01** | UI | AC-02 | Development Requester Selector screen rendering | Displays dropdown with active Requesters and explanation banner | `client/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-02** | UI | BR-06 | Create Ticket form inline validation | Displays red error messages below invalid summary/description fields | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | UI-Spec | Submit button busy state | Button displays loading indicator and becomes disabled during API request | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-04** | UI | AC-07 | My Tickets search and filter controls | Filters list dynamically when search term or category is selected | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-05** | UI | AC-08 | My Tickets responsive layout | Renders table on desktop (>=992px) and card list on mobile (<768px) | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-06** | UI | AC-06 | Soft removal modal confirmation | Prompts for mandatory removal reason before calling API | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-02 | Complete ticket creation user flow | Selects Requester, fills form, submits ticket, verifies Ticket Number | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-02** | E2E | AC-07 | Ticket search and pagination E2E flow | Searches for created ticket in My Tickets and opens Ticket Detail | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-06 | Attachment upload and soft removal E2E flow | Uploads PDF attachment, verifies in list, soft-removes with reason | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Planned Test IDs | Test Coverage Status |
| :--- | :--- | :--- |
| **AC-01** (Valid submission & Ticket Number) | `API-01`, `E2E-01` | Covered |
| **AC-02** (Development Requester Selection context) | `API-03`, `UI-01`, `E2E-01` | Covered |
| **AC-03** (Cross-requester access rejection) | `API-05` | Covered |
| **AC-04** (Invalid file type rejection) | `API-06` | Covered |
| **AC-05** (Oversized file rejection) | `API-06` | Covered |
| **AC-06** (Soft removal with reason & download block) | `API-07`, `API-08`, `UI-06`, `E2E-03` | Covered |
| **AC-07** (My Tickets search & filter) | `API-04`, `UI-04`, `E2E-02` | Covered |
| **AC-08** (Mobile responsive card layout) | `UI-05` | Covered |

---

## 4. Responsive and Visual Checklist

- [x] **Desktop Viewport (>=992px)**: Header, 2-column form grid, full My Tickets data table, centered card layouts.
- [x] **Tablet Viewport (768px - 991px)**: 2-column grid adapts cleanly; table remains legible without clipping.
- [x] **Mobile Viewport (<768px)**: Forms collapse to 1-column stack; My Tickets table transforms to card list; zero horizontal scrolling.
- [x] **Zen Green Color Tokens**: Verified Primary Green (`#006B3C`), Secondary Green (`#0B7A46`), Pale Green (`#EAF6EF`), Read-only background (`#F0F4F2`).
- [x] **Field Feedback**: Required asterisks in red (`#C5221F`), inline error placement, busy states on buttons.

---

## 5. Test Execution Commands

```bash
# Server Unit & API Tests
npm test --prefix server

# Client UI Component Tests
npm test --prefix client

# End-to-End Tests
npx playwright test --config=e2e/playwright.config.ts
```

---

## 6. Final Results Summary

| Test Suite | Total Tests | Passed | Failed | Skipped | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Server Unit Tests | 2 | 2 | 0 | 0 | Pass |
| Server API Integration Tests | 8 | 8 | 0 | 0 | Pass |
| Client UI Component Tests | 6 | 6 | 0 | 0 | Pass |
| E2E Playwright Tests | 3 | 3 | 0 | 0 | Pass |
| **Total** | **19** | **19** | **0** | **0** | **Pass** |

---

## 7. Known Limitations or Deferred Tests
- Authentication security (passwords, tokens, sessions) and IT Staff workflow tests are explicitly deferred to Lab 3 as specified in the handout scope.
