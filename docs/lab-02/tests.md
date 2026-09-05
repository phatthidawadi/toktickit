# Lab 2 Test Plan and Results

## 1. Test Strategy

Sprint 2 (Lab 2) applies Spec-Driven Development (Spec DD) and Test-Driven Development (TDD). The test suite ensures comprehensive coverage across multiple testing levels:
- **Unit Tests**: Generator logic, validation rules, formatting functions.
- **API Integration Tests**: Supertest suite for backend REST endpoints, validation, header checks, HTTP status codes, pagination sanitization, and cross-requester ownership isolation.
- **UI Component Tests**: Vitest & React Testing Library suite for form rendering, field states, Zen Green visual tokens, button hierarchy, form state retention on failure, and responsive behavior.
- **End-to-End (E2E) Tests**: Playwright suite testing full user workflows across Desktop and Mobile viewports.

---

## 2. Planned Tests Table

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket Number format generator | Returns `TKT-YYYY-XXXXXX` format with 6-digit zero-padded sequence | `server/tests/lab-02/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | BR-06, BR-07 | Validation helper functions | Correctly validates field lengths, MIME types, and file sizes | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-01** | API | AC-01, FR-03 | Valid ticket creation (`POST /api/tickets`) | HTTP 201 Created; returns saved ticket with official Ticket Number and status `NEW` | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | AC-09, BR-06 | Create ticket invalid input | HTTP 400 Bad Request when summary < 5 chars or description < 10 chars | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-02, BR-03 | Missing `x-requester-id` header | HTTP 400 Bad Request when header is omitted | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-04** | API | AC-07, AC-10, AC-11, AC-12 | Paginated ticket list query (`GET /api/tickets`) | HTTP 200 OK; returns requester-owned tickets; supports search, filter, sort, pagination | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-05** | API | AC-03, FR-10 | Cross-requester ticket detail access (`GET /api/tickets/:id`) | HTTP 403 Forbidden when Requester B attempts to access Requester A's ticket | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-06** | API | AC-04, AC-05 | Attachment upload constraints (`POST /api/tickets/:id/attachments`) | HTTP 400 Bad Request when file > 5MB or invalid extension (.exe) | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-07** | API | AC-06, BR-08 | Attachment soft removal (`DELETE /api/attachments/:id`) | HTTP 200 OK; marks `isRemoved = true` and stores removal reason | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-08** | API | AC-06, BR-09 | Soft-removed attachment download (`GET /api/attachments/:id/download`) | HTTP 410 Gone when attempting to download soft-removed file | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-09** | API | §6.1 | Invalid query parameter sanitization (`GET /api/tickets?page=-1&limit=999`) | HTTP 200 OK; page defaults to 1, limit capped at 100, invalid sort defaults to desc | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **UI-01** | UI | AC-02, AC-14 | Development Requester Selector screen rendering | Displays dropdown with active Requesters and explanation banner | `client/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-02** | UI | AC-09, BR-06 | Create Ticket form inline validation | Displays red error messages below invalid summary/description fields without API call | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-03** | UI | BR-11, UI-Spec | Submit button busy state | Button displays loading spinner indicator and becomes disabled during API request | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-04** | UI | AC-07, AC-10, AC-11 | My Tickets search, filter, and sort controls | Filters list dynamically when search term, category, or sort option is selected | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-05** | UI | AC-08 | My Tickets responsive layout | Renders table on desktop (>=992px) and card list on mobile (<768px) | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-06** | UI | AC-06 | Soft removal modal confirmation | Prompts for mandatory removal reason before calling DELETE API | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **UI-07** | UI | AC-15, BR-12 | Form state retention on API failure | Retains user-entered form field values when API submission fails | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-08** | UI | AC-16 | Accessibility focus rings & ARIA labels | Displays visible focus rings and aria-labels for keyboard/screen reader users | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-02, AC-09, AC-14 | Complete ticket creation user flow | Selects Requester, fills form, submits ticket, verifies Ticket Number | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-02** | E2E | AC-07, AC-10, AC-11, AC-12, AC-13 | Ticket search, filter, and pagination E2E flow | Searches and filters tickets in My Tickets and opens Ticket Detail | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-04, AC-05, AC-06 | Attachment upload and soft removal E2E flow | Uploads PDF attachment, verifies in list, soft-removes with reason | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Mapped Planned Test IDs | Test Coverage Status |
| :--- | :--- | :--- |
| **AC-01** (Valid submission & Ticket Number) | `UNIT-01`, `API-01`, `E2E-01` | 100% Covered |
| **AC-02** (Development Requester Selection context) | `API-03`, `UI-01`, `E2E-01` | 100% Covered |
| **AC-03** (Cross-requester access rejection HTTP 403) | `API-05`, `API-08` | 100% Covered |
| **AC-04** (Invalid file type rejection) | `UNIT-02`, `API-06`, `E2E-03` | 100% Covered |
| **AC-05** (Oversized file rejection > 5MB) | `UNIT-02`, `API-06`, `E2E-03` | 100% Covered |
| **AC-06** (Soft removal with reason & download block HTTP 410) | `API-07`, `API-08`, `UI-06`, `E2E-03` | 100% Covered |
| **AC-07** (My Tickets search keyword filtering) | `API-04`, `UI-04`, `E2E-02` | 100% Covered |
| **AC-08** (Mobile responsive card layout < 768px) | `UI-05`, `E2E-01`, `E2E-02` | 100% Covered |
| **AC-09** (Inline form validation error messages) | `API-02`, `UI-02`, `E2E-01` | 100% Covered |
| **AC-10** (Category, Priority, and Status filter dropdowns) | `API-04`, `UI-04`, `E2E-02` | 100% Covered |
| **AC-11** (Sorting by created date and priority) | `API-04`, `UI-04`, `E2E-02` | 100% Covered |
| **AC-12** (Pagination controls and item counts) | `API-04`, `E2E-02` | 100% Covered |
| **AC-13** (Empty and no-results states with Clear Filters CTA) | `UI-04`, `E2E-02` | 100% Covered |
| **AC-14** (Requester context switching reloads ticket list) | `UI-01`, `E2E-01` | 100% Covered |
| **AC-15** (Form values preserved on API failure) | `UI-07` | 100% Covered |
| **AC-16** (Accessibility focus rings & ARIA labels) | `UI-08` | 100% Covered |

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
| Server Unit & API Tests | 19 | 19 | 0 | 0 | Pass |
| Client UI Component Tests | 11 | 11 | 0 | 0 | Pass |
| E2E Playwright Tests | 3 | 3 | 0 | 0 | Pass |
| **Total** | **33** | **33** | **0** | **0** | **Pass** |

---

## 7. Known Limitations or Deferred Tests
- Authentication security (passwords, tokens, sessions) and IT Staff workflow tests are explicitly deferred to Lab 3 as specified in the handout scope.
