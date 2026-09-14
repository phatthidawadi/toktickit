# Lab 3 Test Plan and Quality Assurance Contract

## 1. Test Strategy and Testing Architecture

Sprint 3 (Lab 3) applies Spec-Driven Development (Spec DD) and Test-Driven Development (TDD) across the complete full-stack application. The quality assurance strategy ensures 100% coverage of all Functional Requirements (FR-01 to FR-21), Business Rules (BR-01 to BR-16), and Acceptance Criteria (AC-01 to AC-21).

### 8 Required Test Coverage Layers (Handout Section 10)
1. **Unit Tests**: Test password hashing (`bcrypt`), JWT token generation/validation, password complexity validators, and status transition matrix rules.
2. **API & Integration Tests (Server Supertest)**: Verify REST endpoints, authentication cookies, query filtering, pagination, and error shapes.
3. **UI Component Tests (Vitest + RTL)**: Verify component rendering, form control states, interactive modals, and submission handlers.
4. **UI Style Tests (Zen Green Theme)**: Verify role badge color tokens (`#DBEAFE`, `#D1FAE5`, `#E0E7FF`), amber Internal Note container styling (`#FEF3C7`, border `#FDE68A`), red required asterisks (`#C5221F`), and focus indicators.
5. **Responsive Tests (Desktop, Tablet, Mobile)**: Verify Staff Queue data table to mobile card transformation (< 768px), tablet scroll wrappers (768-991px), Admin modal responsiveness, and zero horizontal page overflow.
6. **Security & Authorization Tests**: Server-side RBAC, authenticated session cookie identity enforcement, rejection of client `requesterId` spoofing, Requester Internal Note blocks (HTTP 403), Admin self-deactivation blocks, and last-Admin deactivation blocks.
7. **Migration & Regression Tests**: Verify that existing Lab 2 Requester accounts, tickets, and attachments remain 100% intact and valid under the migrated `User` model.
8. **End-to-End (E2E) Tests (Playwright)**: Full browser user journeys across Desktop, Tablet, and Mobile viewports verifying login, mandatory password change, IT Staff queue operations, comments, internal notes, and Admin user management.

---

## 2. Planned Tests Table

### 2.1 Server Unit & API Integration Tests (31 Test Cases)

| Test ID | Coverage Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-03 | Password hashing & comparison helper | Bcrypt hashes passwords correctly; plain text comparison returns false | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| **UNIT-02** | Unit | BR-03, BR-04 | JWT session token issuance & verification | Generates valid 8h JWT token; verifies signed payload | `server/tests/lab-03/auth.unit.test.ts` | Planned |
| **UNIT-03** | Unit | BR-10 | Ticket status transition matrix validator | Validates allowed transitions; rejects invalid transitions | `server/tests/lab-03/workflow.unit.test.ts` | Planned |
| **AUTH-API-01** | API | AC-01, FR-01 | Valid user authentication (`POST /api/auth/login`) | HTTP 200 OK; sets `toktickit_session` cookie; returns profile & role | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-02** | API | AC-02, FR-02 | Inactive user authentication attempt | HTTP 401 Unauthorized; returns safe error without leaking account state | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-03** | API | AC-21, FR-01 | Invalid credentials login attempt | HTTP 401 Unauthorized; returns safe error message | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-04** | API | AC-03, FR-03 | Mandatory password change workflow enforcement | User with `mustChangePassword=true` blocked from app APIs until changed | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-05** | API | AC-03, BR-03 | Password change validation rules (`POST /api/auth/change-password`) | HTTP 400 Bad Request if < 8 chars, missing uppercase/lowercase/number | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-06** | API | AC-04, FR-04 | Logout session invalidation (`POST /api/auth/logout`) | HTTP 200 OK; clears `toktickit_session` cookie (`Max-Age=0`) | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTH-API-07** | API | FR-05 | Current user context (`GET /api/auth/me`) | HTTP 200 OK; returns authenticated profile; HTTP 401 if unauthenticated | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **SEC-AUTH-03** | Security/Auth | AC-21, BR-01 | Invalid login attempts & brute force rejection | HTTP 401 Unauthorized for repeated bad password attempts | `server/tests/lab-03/auth.api.test.ts` | Planned |
| **AUTHZ-API-01**| Security/Auth | AC-05, BR-04 | Requester ownership spoofing rejection | Ignores client `requesterId` header; extracts identity solely from cookie | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| **AUTHZ-API-02**| Security/Auth | AC-06, FR-07 | Unauthenticated request to protected endpoints | HTTP 401 Unauthorized for all protected routes without valid session cookie | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| **AUTHZ-API-03**| Security/Auth | AC-06, BR-06 | Role-based forbidden access | HTTP 403 Forbidden when Requester accesses `/api/admin/users` or `/api/staff/tickets` | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| **QUEUE-API-01**| API | AC-07, FR-12 | IT Staff Ticket Queue retrieval (`GET /api/staff/tickets`) | HTTP 200 OK; returns paginated queue with search, category, status, priority filters | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| **QUEUE-API-02**| Security/Auth | AC-06, BR-06 | Requester access to IT Staff Queue | HTTP 403 Forbidden when Requester attempts to query queue API | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| **STAFF-API-01**| API | AC-08, FR-13 | Ticket ownership claim & reassignment (`PATCH /api/staff/tickets/:id/assign`) | HTTP 200 OK; updates `assignedStaffId` to active IT Staff or Admin user ID | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **STAFF-API-02**| API | AC-09, FR-14 | IT Priority update (`PATCH /api/staff/tickets/:id/priority`) | HTTP 200 OK; updates `itPriority` while `requestedPriority` remains unchanged | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **STAFF-API-03**| API | AC-10, FR-15 | Valid status transition (`NEW` -> `IN_PROGRESS`) | HTTP 200 OK; updates `currentStatus` adhering to BR-10 matrix | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **STAFF-API-04**| API | AC-11, BR-10 | Invalid status transition rejection (`NEW` -> `CLOSED`) | HTTP 400 Bad Request when attempting unpermitted transition | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| **COMMENT-API-01**| API | AC-12, FR-10 | Public Comment creation & retrieval (`POST /api/tickets/:id/comments`) | HTTP 201 Created; appends comment visible to Requester, IT Staff, Admin | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **API-COMM-03** | API | BR-10 | Requester comment status auto-transition | Auto transitions status from `WAITING_FOR_REQUESTER` to `IN_PROGRESS` on Requester comment | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **NOTE-API-01** | API | AC-13, FR-16 | Internal Note creation & retrieval (`POST /api/tickets/:id/notes`) | HTTP 201 Created; saves note visible ONLY to IT Staff and Admin | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **NOTE-API-02** | Security/Auth | AC-14, BR-07 | Requester access rejection to Internal Notes | HTTP 403 Forbidden when Requester requests notes endpoint | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| **REQ-API-01**  | API | AC-15, FR-11 | Requester "Problem Appears Resolved" toggle (`PATCH /api/tickets/:id/resolve-ack`)| HTTP 200 OK; sets `isRequesterResolved=true` without altering `currentStatus` | `server/tests/lab-03/requester-workflow.api.test.ts` | Planned |
| **API-REQ-REG-01**| Migration/Reg| FR-09 | Requester Ticket Creation & Owned Tickets Regression | HTTP 201 Created; verifies Lab 2 ticket creation and list functions under session auth | `server/tests/lab-03/requester-workflow.api.test.ts` | Planned |
| **ADMIN-API-01**| API | AC-16, FR-17 | Admin user list retrieval (`GET /api/admin/users`) | HTTP 200 OK; returns user accounts with search (name/email) and role filter | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **ADMIN-API-02**| API | AC-17, BR-13 | Admin duplicate email creation rejection | HTTP 409 Conflict when creating user with an existing email | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **API-ADM-05**  | API | BR-13 | Admin edit user duplicate email rejection (`PATCH /api/admin/users/:id`) | HTTP 409 Conflict when updating user email to an existing email | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **ADMIN-API-03**| Security/Auth | AC-18, BR-14 | Admin self-deactivation rejection | HTTP 400 Bad Request when Admin attempts to deactivate own account | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **ADMIN-API-04**| Security/Auth | AC-19, BR-15 | Admin last active administrator deactivation rejection | HTTP 400 Bad Request when attempting to deactivate the last active Admin | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **ADMIN-API-05**| API | FR-20 | Admin set new initial password (`POST /api/admin/users/:id/reset-password`) | HTTP 200 OK; resets password hash and sets `mustChangePassword=true` | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| **MIG-API-01**  | Migration/Reg | FR-08, BR-01, BR-02 | Lab 2 Data Migration Integrity check | Verifies all pre-existing Lab 2 tickets & attachments remain readable under new `User` model | `server/tests/lab-03/migration.api.test.ts` | Planned |

---

### 2.2 Client UI Component Tests (10 Test Cases)

| Test ID | Coverage Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-LOGIN-01** | UI Component | AC-01, AC-21 | Login form rendering & validation | Displays email/password inputs, red validation messages, busy state on submit | `client/tests/lab-03/Login.test.tsx` | Planned |
| **UI-LOGIN-02** | UI Component | AC-02 | Inactive user login error message display | Renders error callout banner and resets password field on inactive user attempt | `client/tests/lab-03/Login.test.tsx` | Planned |
| **UI-PASS-01**  | UI Component | AC-03 | Password Change screen rendering & checklist | Displays current/new/confirm password fields and complexity rule checklist | `client/tests/lab-03/ChangePassword.test.tsx` | Planned |
| **UI-HEADER-01**| UI Component | AC-04, FR-04 | Role-authenticated header navigation | Renders User Name, Role Badge (`Requester`/`IT Staff`/`Admin`), and Logout button | `client/tests/lab-03/Header.test.tsx` | Planned |
| **UI-QUEUE-01** | UI Component | AC-07 | Staff Ticket Queue table & filters | Displays search, filter bars, status/priority pills, ownership badges | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| **UI-DETAIL-01**| UI Component | AC-08, AC-09, AC-10 | Staff Ticket Detail operational controls | Displays Claim/Reassign dropdown, IT Priority dropdown, permitted status matrix dropdown | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Planned |
| **UI-COMMENT-01**| UI Component | AC-12 | Public Comments stream component | Renders Public Comment list with author profile, role badge, timestamp, and append form | `client/tests/lab-03/PublicComments.test.tsx` | Planned |
| **UI-NOTE-01**  | UI Component | AC-13, AC-14 | Internal Note form & amber highlight container rendering | Renders amber-styled Internal Notes component for Staff/Admin | `client/tests/lab-03/InternalNotes.test.tsx` | Planned |
| **UI-ADMIN-01** | UI Component | AC-16, AC-17 | Admin User Management user table & creation modal | Displays user listing, search, role filters, user creation modal | `client/tests/lab-03/UserManagement.test.tsx` | Planned |
| **UI-ADMIN-02** | UI Component | AC-18, AC-19 | Admin User Edit & Role/Status Toggle modal | Displays edit user modal, self-deactivation warning, last admin warning | `client/tests/lab-03/UserManagement.test.tsx` | Planned |

---

### 2.3 Explicit UI Style Tests (3 Test Cases)

| Test ID | Coverage Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **STYLE-01** | UI Style | AC-20 | Role badge Zen Green token verification | Verifies role badges match tokens: `Requester` (`#DBEAFE`), `IT Staff` (`#D1FAE5`), `Administrator` (`#E0E7FF`) | `client/tests/lab-03/UIStyle.test.tsx` | Planned |
| **STYLE-02** | UI Style | AC-13, AC-14 | Internal Note amber container styling | Verifies confidential Internal Notes container uses amber background (`#FEF3C7`), border (`#FDE68A`), and text (`#92400E`) | `client/tests/lab-03/UIStyle.test.tsx` | Planned |
| **STYLE-03** | UI Style | AC-20 | Focus rings, required markers & touch targets | Asserts visible focus ring styling (`2px solid #0B7A46`), red asterisks (`#C5221F`), and min button height (≥ 44px) | `client/tests/lab-03/UIStyle.test.tsx` | Planned |

---

### 2.4 Explicit Responsive Tests (2 Test Cases)

| Test ID | Coverage Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RESP-01** | Responsive | AC-20 | Staff Ticket Queue mobile card transformation & tablet scroll | Transforms table into stacked card list on mobile (< 768px); renders tablet scroll wrapper (768-991px); zero horizontal scroll | `client/tests/lab-03/Responsive.test.tsx` | Planned |
| **RESP-02** | Responsive | AC-20 | Admin User Management & modal responsive behavior | Stacked form inputs on mobile (< 768px); responsive modal scaling across Desktop, Tablet, Mobile | `client/tests/lab-03/Responsive.test.tsx` | Planned |

---

### 2.5 End-to-End Playwright Tests (3 Test Scenarios)

| Test ID | Coverage Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-01** | E2E | AC-01, AC-03, AC-04 | Auth & Mandatory Password Change E2E User Journey | Log in with initial password -> redirected to Change Password -> save new password -> access app shell -> logout | `e2e/lab-03/authentication.spec.ts` | Planned |
| **E2E-02** | E2E | AC-07, AC-08, AC-09, AC-10, AC-12, AC-13 | IT Staff Queue & Ticket Operations E2E Journey | Log in as IT Staff -> view queue -> filter & search -> open ticket detail -> claim ticket -> update IT Priority -> change status -> post Public Comment & Internal Note | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| **E2E-03** | E2E | AC-16, AC-17, AC-18, AC-19 | Admin User Management & Safety Safeguards E2E Journey | Log in as Admin -> view user list -> search user -> create new IT Staff account -> verify duplicate email block -> attempt self-deactivation block -> reset initial password | `e2e/lab-03/user-administration.spec.ts` | Planned |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Mapped Planned Test IDs | Coverage Status |
| :--- | :--- | :--- |
| **AC-01** (Valid active user login) | `AUTH-API-01`, `UI-LOGIN-01`, `E2E-01` | 100% Covered |
| **AC-02** (Inactive account rejection) | `AUTH-API-02`, `UI-LOGIN-02` | 100% Covered |
| **AC-03** (Mandatory first-login password change) | `AUTH-API-04`, `AUTH-API-05`, `UI-PASS-01`, `E2E-01` | 100% Covered |
| **AC-04** (Logout session invalidation) | `AUTH-API-06`, `UI-HEADER-01`, `E2E-01` | 100% Covered |
| **AC-05** (Requester session identity enforcement) | `AUTHZ-API-01` | 100% Covered |
| **AC-06** (Unauthenticated & unauthorized RBAC block) | `AUTHZ-API-02`, `AUTHZ-API-03`, `QUEUE-API-02` | 100% Covered |
| **AC-07** (IT Staff Queue search/filter/sort/page) | `QUEUE-API-01`, `UI-QUEUE-01`, `E2E-02` | 100% Covered |
| **AC-08** (IT Staff ticket ownership claim) | `STAFF-API-01`, `UI-DETAIL-01`, `E2E-02` | 100% Covered |
| **AC-09** (IT Priority independent update) | `STAFF-API-02`, `UI-DETAIL-01`, `E2E-02` | 100% Covered |
| **AC-10** (Valid ticket status transition matrix) | `UNIT-03`, `STAFF-API-03`, `UI-DETAIL-01`, `E2E-02` | 100% Covered |
| **AC-11** (Invalid ticket status transition rejection) | `UNIT-03`, `STAFF-API-04` | 100% Covered |
| **AC-12** (Public Comment stream & creation) | `COMMENT-API-01`, `UI-COMMENT-01`, `E2E-02` | 100% Covered |
| **AC-13** (Internal Note stream & creation) | `NOTE-API-01`, `UI-NOTE-01`, `STYLE-02`, `E2E-02` | 100% Covered |
| **AC-14** (Requester Internal Note access block) | `NOTE-API-02`, `UI-NOTE-01`, `STYLE-02` | 100% Covered |
| **AC-15** (Requester "Problem Appears Resolved" toggle) | `REQ-API-01` | 100% Covered |
| **AC-16** (Admin User Management search & role filter) | `ADMIN-API-01`, `UI-ADMIN-01`, `E2E-03` | 100% Covered |
| **AC-17** (Admin duplicate email creation rejection) | `ADMIN-API-02`, `UI-ADMIN-01`, `E2E-03` | 100% Covered |
| **AC-18** (Admin self-deactivation block) | `ADMIN-API-03`, `UI-ADMIN-02`, `E2E-03` | 100% Covered |
| **AC-19** (Admin last active administrator block) | `ADMIN-API-04`, `UI-ADMIN-02`, `E2E-03` | 100% Covered |
| **AC-20** (Zen Green UI, focus rings & mobile responsiveness) | `STYLE-01`, `STYLE-02`, `STYLE-03`, `RESP-01`, `RESP-02`, `E2E-01`, `E2E-02`, `E2E-03` | 100% Covered |
| **AC-21** (Invalid credentials login rejection) | `AUTH-API-03`, `SEC-AUTH-03`, `UI-LOGIN-01` | 100% Covered |

---

## 4. Planned Test Execution Commands

```bash
# 1. Execute Server Unit and REST API Tests
npm test --prefix server

# 2. Execute Client Vitest UI Component, UI Style & Responsive Tests
npm test --prefix client

# 3. Execute End-to-End Playwright Tests
npx playwright test --config=e2e/playwright.config.ts
```
