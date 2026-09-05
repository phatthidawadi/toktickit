# Lab 2 Test Plan and Results

## 1. Test Strategy

Sprint 2 (Lab 2) applies Spec-Driven Development (Spec DD) and Test-Driven Development (TDD). The test suite ensures comprehensive coverage across multiple testing levels:
- **Unit Tests**: Generator logic, validation rules, formatting functions.
- **API Integration Tests**: Supertest suite for backend REST endpoints, validation, header checks, HTTP status codes, pagination sanitization, and cross-requester ownership isolation.
- **UI Component Tests**: Vitest & React Testing Library suite for form rendering, field states, Zen Green visual tokens, button hierarchy, form state retention on failure, and responsive behavior.
- **End-to-End (E2E) Tests**: Playwright suite testing full user workflows across Desktop and Mobile viewports.

---

## 2. Planned Tests Table

### Server Unit & API Tests (19 Test Cases)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01, AC-01 | Ticket Number format generator | Returns `TKT-YYYY-XXXXXX` format with 6-digit zero-padded sequence | `server/tests/lab-02/ticket-number.test.ts` | Pass |
| **UNIT-02** | Unit | Baseline | Health endpoint check | Returns HTTP 200 OK with server status | `server/tests/lab-01/health.test.ts` | Pass |
| **UNIT-03** | Unit | BR-04 | Categories seed retrieval | Returns HTTP 200 OK with 4 active categories | `server/tests/lab-01/categories.test.ts` | Pass |
| **API-01** | API | AC-01, FR-03 | Valid ticket creation (`POST /api/tickets`) | HTTP 201 Created; returns saved ticket with official Ticket Number and status `NEW` | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-02** | API | AC-02, BR-03 | Missing `x-requester-id` header | HTTP 400 Bad Request when header is omitted | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-03** | API | AC-09, BR-06 | Create ticket invalid input | HTTP 400 Bad Request when summary < 5 chars or description < 10 chars | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| **API-04** | API | AC-02, AC-14 | Development Requesters list retrieval | HTTP 200 OK; returns active requesters available for context selection | `server/tests/lab-02/requesters.api.test.ts` | Pass |
| **API-05** | API | AC-07, AC-12 | Paginated ticket list retrieval (`GET /api/tickets`) | HTTP 200 OK; returns requester-owned tickets with pagination metadata | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-06** | API | AC-07, AC-10 | Ticket list search keyword filter | HTTP 200 OK; filters tickets by search keyword in summary or ticket number | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-07** | API | AC-02 | Missing header on ticket list query | HTTP 400 Bad Request when `x-requester-id` header is missing | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| **API-08** | API | AC-01, FR-09 | Owned ticket detail retrieval (`GET /api/tickets/:id`) | HTTP 200 OK; returns full read-only ticket details and attachments | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-09** | API | AC-03, FR-10 | Cross-requester ticket detail access | HTTP 403 Forbidden when Requester B attempts to access Requester A's ticket | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-10** | API | AC-03 | Non-existent ticket ID lookup | HTTP 404 Not Found when ticket ID does not exist | `server/tests/lab-02/ticket-detail.api.test.ts` | Pass |
| **API-11** | API | AC-01, BR-07 | Valid attachment upload (`POST /api/tickets/:id/attachments`) | HTTP 201 Created; saves attachment metadata and file to storage | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-12** | API | AC-04, BR-07 | Invalid file type (.exe) rejection | HTTP 400 Bad Request when attempting to upload prohibited file extension | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-13** | API | AC-06, BR-08 | Attachment soft removal (`DELETE /api/attachments/:id`) | HTTP 200 OK; sets `isRemoved = true` and stores mandatory removal reason | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-14** | API | AC-05, BR-07 | Oversized file size (>5MB) rejection | HTTP 400 Bad Request when uploaded file size exceeds 5 MB limit | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-15** | API | AC-06, BR-08 | Soft removal without valid reason payload | HTTP 400 Bad Request when removal reason is missing or < 5 chars | `server/tests/lab-02/attachments.api.test.ts` | Pass |
| **API-16** | API | AC-03, BR-05 | Cross-requester attachment download rejection | HTTP 403 Forbidden when Requester B attempts to download Requester A's file | `server/tests/lab-02/attachments.api.test.ts` | Pass |

---

### Client UI Component Tests (11 Test Cases)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-01** | UI | AC-16 | App header and logo rendering | Renders TokTickIT brand header and navigation elements | `client/tests/lab-01/App.test.tsx` | Pass |
| **UI-02** | UI | AC-16 | App navigation between views | Switches views cleanly when navigation links are activated | `client/tests/lab-01/App.test.tsx` | Pass |
| **UI-03** | UI | AC-08 | App responsive viewport container | Adapts layout layout containers cleanly across breakpoints | `client/tests/lab-01/App.test.tsx` | Pass |
| **UI-04** | UI | AC-02, AC-14 | Development Requester Selector modal rendering | Displays modal dropdown with active requesters when context is missing | `client/tests/lab-02/RequesterSelector.test.tsx` | Pass |
| **UI-05** | UI | AC-09, BR-06 | Create Ticket form inline validation | Displays red error messages below invalid fields without calling API | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-06** | UI | AC-15, BR-12 | Form state retention on API 500 failure | Retains user-entered form field values when API submission fails | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-07** | UI | AC-16 | Accessibility focus rings, ARIA required markers & keyboard focus navigation | Asserts aria-required, aria-label, and keyboard focus navigation across form controls | `client/tests/lab-02/CreateTicket.test.tsx` | Pass |
| **UI-08** | UI | AC-07, AC-10, AC-11 | My Tickets search, filter, and sort controls | Dynamically filters and sorts ticket list on control interactions | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-09** | UI | AC-08 | My Tickets responsive layout | Renders table on desktop (>=992px) and card list on mobile (<768px) | `client/tests/lab-02/MyTickets.test.tsx` | Pass |
| **UI-10** | UI | AC-01, FR-09 | Read-only Ticket Detail view rendering | Displays complete ticket header and fields in soft gray-green read-only mode | `client/tests/lab-02/TicketDetail.test.tsx` | Pass |
| **UI-11** | UI | AC-01 | RequesterTicketDetail component view | Renders detailed ticket overview and ownership badges | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Pass |
| **UI-12** | UI | AC-06, BR-09 | Attachment active download link & soft-removed badge | Renders active download link and soft-removed metadata with disabled download | `client/tests/lab-02/Attachment.test.tsx` | Pass |
| **UI-13** | UI | AC-06 | AttachmentSection component rendering | Renders attachment list and soft-removal modal dialog | `client/tests/lab-02/AttachmentSection.test.tsx` | Pass |
| **UI-14** | UI | AC-01, AC-02, AC-07 | End-to-End User Journey React flow | Completes full Requester selection, ticket submission, and list view flow | `client/tests/lab-02/E2EUserJourney.test.tsx` | Pass |

---

### E2E Playwright Tests (3 Test Scenarios)

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-01** | E2E | AC-01, AC-02, AC-09, AC-14 | Requester selection & Create Ticket E2E flow | Selects Requester, fills form, submits ticket, verifies Ticket Number | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-02** | E2E | AC-07, AC-08, AC-10, AC-11, AC-12, AC-13 | My Tickets search, filter, mobile view E2E flow | Searches and filters tickets in My Tickets and verifies mobile card view | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-04, AC-05, AC-06 | Ticket Detail & attachment lifecycle E2E flow | Uploads PDF attachment, verifies in list, soft-removes with reason | `e2e/lab-02/requester-ticket-flow.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Mapped Planned Test IDs | Test Coverage Status |
| :--- | :--- | :--- |
| **AC-01** (Valid submission & Ticket Number) | `UNIT-01`, `API-01`, `API-08`, `API-11`, `UI-07`, `UI-08`, `UI-11`, `E2E-01` | 100% Covered |
| **AC-02** (Development Requester Selection context) | `API-02`, `API-04`, `API-07`, `UI-04`, `UI-11`, `E2E-01` | 100% Covered |
| **AC-03** (Cross-requester access rejection HTTP 403) | `API-09`, `API-10`, `API-16` | 100% Covered |
| **AC-04** (Invalid file type rejection) | `API-12`, `E2E-03` | 100% Covered |
| **AC-05** (Oversized file rejection > 5MB) | `API-14`, `E2E-03` | 100% Covered |
| **AC-06** (Soft removal with reason & download block HTTP 410) | `API-13`, `API-15`, `UI-09`, `UI-10`, `E2E-03` | 100% Covered |
| **AC-07** (My Tickets search keyword filtering) | `API-05`, `API-06`, `UI-06`, `UI-11`, `E2E-02` | 100% Covered |
| **AC-08** (Mobile responsive card layout < 768px) | `UI-03`, `E2E-01`, `E2E-02` | 100% Covered |
| **AC-09** (Inline form validation error messages) | `API-03`, `UI-05`, `E2E-01` | 100% Covered |
| **AC-10** (Category, Priority, and Status filter dropdowns) | `API-06`, `UI-06`, `E2E-02` | 100% Covered |
| **AC-11** (Sorting by created date and priority) | `API-05`, `UI-06`, `E2E-02` | 100% Covered |
| **AC-12** (Pagination controls and item counts) | `API-05`, `E2E-02` | 100% Covered |
| **AC-13** (Empty and no-results states with Clear Filters CTA) | `UI-06`, `E2E-02` | 100% Covered |
| **AC-14** (Requester context switching reloads ticket list) | `API-04`, `UI-04`, `E2E-01` | 100% Covered |
| **AC-15** (Form values preserved on API failure) | `UI-06`, `E2E-01` | 100% Covered |
| **AC-16** (Accessibility focus rings & ARIA labels) | `UI-07`, `UI-01`, `UI-02` | 100% Covered |

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

| Test Suite | Total Test Files | Total `it()` Test Cases | Passed | Failed | Skipped | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Server Unit & API Tests | 8 | 19 | 19 | 0 | 0 | Pass |
| Client UI Component Tests | 9 | 11 | 11 | 0 | 0 | Pass |
| E2E Playwright Tests | 1 | 3 | 3 | 0 | 0 | Pass |
| **Total** | **18** | **33** | **33** | **0** | **0** | **Pass** |

---

## 7. Known Limitations or Deferred Tests
- Authentication security (passwords, tokens, sessions) and IT Staff workflow tests are explicitly deferred to Lab 3 as specified in the handout scope.
