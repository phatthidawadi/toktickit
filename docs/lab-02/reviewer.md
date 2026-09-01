# Sprint 2 Peer Review & Quality Assurance Summary

## Repository Information
- **Repository Name**: toktickit
- **Target Branch**: `lab2-staging`
- **Main Branch**: `main`
- **Lab Version**: Sprint 2 (Lab 2) IT Service Desk - Requester Portal

---

## 1. Executive Summary & Verification Matrix

Sprint 2 (Lab 2) has been fully implemented, reviewed, tested, and verified against all specified Functional Requirements (FR-01 to FR-12), Business Rules (BR-01 to BR-10), and Acceptance Criteria (AC-01 to AC-08).

| Criterion | Description | Status | Evidence / Verification Method |
| :--- | :--- | :---: | :--- |
| **AC-01** | Valid Ticket submission saves ticket with status `NEW` and returns `TKT-YYYY-XXXXXX` | PASS | `create-ticket.api.test.ts` & `CreateTicket.test.tsx` |
| **AC-02** | Unselected Requester context automatically presents Requester Selection modal | PASS | `RequesterSelector.test.tsx` & `RequesterContext.tsx` |
| **AC-03** | Accessing non-owned ticket returns HTTP 403 Forbidden | PASS | `ticket-detail.api.test.ts` & `my-tickets.api.test.ts` |
| **AC-04** | Invalid file type (`.exe`, `.bat`, `.cmd`, `.sh`) upload is rejected with HTTP 400 | PASS | `attachments.api.test.ts` (Supertest) |
| **AC-05** | Attachment file size > 5MB is rejected with HTTP 400 | PASS | `attachments.api.test.ts` & Multer limit check |
| **AC-06** | Soft-removed attachment records reason, timestamp, and download returns HTTP 410 Gone | PASS | `attachments.api.test.ts` & `Attachment.test.tsx` |
| **AC-07** | My Tickets list dynamic keyword search filters tickets cleanly | PASS | `my-tickets.api.test.ts` & `MyTickets.test.tsx` |
| **AC-08** | Responsive layout (< 768px) renders card view without horizontal overflow | PASS | `ui-spec.md` compliance & CSS grid/flex |

---

## 2. Peer Review Log & Pull Requests

All 8 feature issues (Issue 5 through Issue 12) were developed on dedicated feature branches, submitted via GitHub Pull Requests against `lab2-staging`, and peer-reviewed prior to merging.

| Issue | PR Title | PR Link | Status | Peer Review Summary |
| :--- | :--- | :--- | :---: | :--- |
| **Issue 5** | Issue 5: Sprint 2 Specification and UI Specification | PR #23 | Merged | Approved. Suggested 6-digit zero-padded ticket sequence format in BR-01. |
| **Issue 6** | Issue 6: API Specification and Test Plan | PR #24 | Merged | Approved. Detailed REST API contract for 9 endpoints and 19 test scenarios. |
| **Issue 7** | Issue 7: Database Schema, Migrations, and Seed Data | PR #25 | Merged | Approved. 5 Prisma models, unique constraints, and idempotent seeding script. |
| **Issue 8** | Issue 8: Development Requester Selector Context | PR #26 | Merged | Approved. Active user dropdown, localStorage persistence, and Zen Green header. |
| **Issue 9** | Issue 9: Create Ticket API, UI Form, and Validation | PR #27 | Merged | Approved. `TKT-YYYY-XXXXXX` sequence, BR-06 validation rules, and success banner. |
| **Issue 10** | Issue 10: My Tickets List API, UI, Filtering, and Pagination | PR #28 | Merged | Approved. Requester data isolation (BR-03), search, status badges, and mobile cards. |
| **Issue 11** | Issue 11: Requester Ticket Detail Read-Only Screen | PR #29 | Merged | Approved. 403 Forbidden enforcement, 404 handling, and Read-Only UI Spec 5.4. |
| **Issue 12** | Issue 12: Attachment Lifecycle (Upload, Download, Soft Removal) | PR #30 | Merged | Approved. 5MB limit, executable file block, removal modal, and 410 Gone download response. |

---

## 3. Automated Test Execution Metrics

- **Total Test Files**: 15 test files (8 Server + 7 Client)
- **Total Test Cases**: 25 automated tests
- **Pass Rate**: 100% PASS
- **Test Layers Covered**:
  1. **Unit Tests**: `generateTicketNumber` sequence formatting.
  2. **Supertest API Integration**: All 9 REST API endpoints tested against live PostgreSQL handle.
  3. **Vitest + RTL UI Component Tests**: All Zen Green UI screens and modal dialogs.
  4. **E2E User Journey Test**: Full simulated workflow from selector to ticket submission and detail view.

---

## 4. Definition of Done Compliance

- [x] All 12 Functional Requirements (FR-01 to FR-12) implemented.
- [x] All 10 Business Rules (BR-01 to BR-10) implemented.
- [x] All 8 Acceptance Criteria (AC-01 to AC-08) satisfied and verified.
- [x] All PRs merged into `lab2-staging` with clean git history.
- [x] All GitHub Issues #14 to #22 closed and updated to `Done`.
- [x] Complete documentation set (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
