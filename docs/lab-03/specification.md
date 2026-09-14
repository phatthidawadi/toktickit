# Lab 3 Sprint Engineering Specification

## 1. Sprint Goal
Deliver an enterprise-grade, role-authenticated IT support ticketing increment for TokTickIT. By the end of Sprint 3, the application replaces the temporary Lab 2 Development Requester selector with secure JWT/cookie-based authentication, mandatory first-login password changes, and server-side role-based authorization across three distinct roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`). The system empowers Requesters to securely manage their tickets, provides IT Staff with an operational Ticket Queue, Ticket Detail workflow (ownership assignment, IT priority, status transitions, Public Comments, and private Internal Notes), and equips Administrators with a User Management interface (user listing, account creation, role assignment, activation/deactivation, and password resets), while preserving 100% of Lab 2 ticket and attachment data and adhering to the Zen Green Theme.

---

## 2. Stakeholder Request Interpretation
The IT organization requires the transition from a temporary development selector to an authenticated, role-governed production architecture. Authentication must enforce credentials, active account verification, and first-time password changes. Role-based navigation and server-side authorization must strictly restrict feature access according to the user's role:
- **Requesters** must access only their own tickets and attachments, post Public Comments, and signal when a problem appears resolved.
- **IT Staff** need an operational Ticket Queue to search, filter, sort, and claim/reassign tickets, edit IT Priority, manage permitted status transitions, post Public Comments, and record private Internal Notes.
- **Administrators** require a User Management portal to create accounts, edit user details, set initial passwords, and manage activation states without deleting historical audit records.

Security controls must be strictly enforced on the server; hidden or disabled UI elements serve only as visual guidance and do not substitute for backend authorization.

---

## 3. Scope

### Included
- **Authentication & Session Management**: Secure login with email and hashed password, HTTP-only cookie session management, current user context API (`GET /api/auth/me`), logout (`POST /api/auth/logout`), and enforced first-login password change (`POST /api/auth/change-password`).
- **Role-Based Authorization System**: Server-side role enforcement (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`) on every protected endpoint and route with safe error responses (HTTP 401 Unauthorized, 403 Forbidden).
- **Data Model Evolution & Migration**: Evolution of PostgreSQL schema via Prisma. Migration of Lab 2 `RequesterUser` records to the unified `User` model with preserved IDs, ticket relations, default initial passwords, and `mustChangePassword` flags.
- **Requester Core Continuity & Enhancements**: Authenticated ticket creation, owned ticket listing, read-only detail view, attachment lifecycle, Public Comment posting, and "Problem Appears Resolved" indication.
- **IT Staff Ticket Queue**: Paginated queue displaying assigned/unassigned tickets with search (ticket number, summary, description), filters (category, status, requested priority, IT priority, ownership), sorting (date, priority), and queue metrics.
- **IT Staff Ticket Operations & Workflow**: Ticket Detail view with operational controls for claiming/reassigning ownership, updating IT Priority, enforcing permitted status transitions, posting Public Comments, and creating private Internal Notes.
- **Administrator User Management**: Centralized user table displaying Name, Email, Role, Status, and Edit action; user search (name/email); role filter; account creation; account edit; activation/deactivation toggle; and initial password reset.
- **Zen Green Design System Extensions**: Reusable components, role-specific badges, navigation header, status indicators, and responsive layouts across Desktop (≥ 992px), Tablet (768px - 991px), and Mobile (< 768px).

### Explicitly Excluded
- Self-registration and public sign-up.
- Email delivery services (SMTP, password reset links, email invitations).
- Multi-factor authentication (MFA), single sign-on (SSO), and social login.
- IT Staff Actions Taken log (deferred to Lab 4).
- Formal SLA calculations, automated escalation engines, and notification services.
- Multi-role assignments (each user has exactly one permitted role).
- Hard deletion of user accounts, bulk user import/export, and user activity history logs.
- Advanced user list pagination/multi-column sorting in Administrator User Management.

---

## 4. Functional Requirements

### Authentication and Session Management
- **FR-01**: The system shall provide a secure Login interface accepting user email and password, returning an HTTP-only authentication cookie upon successful credential verification.
- **FR-02**: The system shall reject authentication attempts for inactive accounts (`isActive = false`) with a safe error message without leaking sensitive account details.
- **FR-03**: The system shall enforce a mandatory password change workflow for users flagged with `mustChangePassword = true`, blocking access to normal application screens until a valid new password is saved.
- **FR-04**: The system shall provide a Logout capability that invalidates the authenticated session and removes the client authentication cookie.
- **FR-05**: The system shall expose a current-user endpoint (`GET /api/auth/me`) returning the authenticated user's profile and role.

### Authorization and Identity Continuity
- **FR-06**: The backend shall derive user identity and role exclusively from the authenticated session, ignoring any client-supplied `requesterId` or identity overrides.
- **FR-07**: The system shall enforce strict server-side role-based access control (RBAC), returning HTTP 403 Forbidden whenever an authenticated user attempts an unauthorized operation.
- **FR-08**: The system shall preserve all Lab 2 Ticket and Attachment data, ensuring existing ticket ownership maps to migrated Requester accounts.

### Requester Workflow
- **FR-09**: The system shall allow authenticated Requesters to create IT support tickets, view their owned tickets, download permitted active attachments, and soft-remove attachments with a mandatory removal reason.
- **FR-10**: The system shall allow Requesters to post Public Comments on their owned tickets.
- **FR-11**: The system shall allow Requesters to indicate that a reported issue appears resolved (`isRequesterResolved = true`), while restricting formal status transitions (`RESOLVED`, `CLOSED`) to IT Staff.

### IT Staff Workflow
- **FR-12**: The system shall provide IT Staff with a Ticket Queue featuring keyword search, category/status/priority/ownership filters, sorting, and pagination.
- **FR-13**: The system shall allow IT Staff to claim unassigned tickets or reassign ticket ownership to any active IT Staff or Administrator user.
- **FR-14**: The system shall allow IT Staff to update IT Priority (`itPriority`) independently of Requested Priority (`requestedPriority`).
- **FR-15**: The system shall enforce the permitted ticket status transition matrix for IT Staff operations.
- **FR-16**: The system shall allow IT Staff to post Public Comments and record private Internal Notes on any ticket.

### Administrator User Management
- **FR-17**: The system shall provide Administrators with a User Management interface to list, search (by name or email), and filter users by role.
- **FR-18**: The system shall allow Administrators to create new user accounts with name, email, one assigned role, activation status, and an initial password.
- **FR-19**: The system shall allow Administrators to update existing user accounts (name, email, assigned role, activation status).
- **FR-20**: The system shall allow Administrators to set a new initial password for a user, automatically setting `mustChangePassword = true`.
- **FR-21**: The system shall prevent an Administrator from deactivating their own account and prevent deactivating the last active Administrator account in the system.

---

## 5. Business Rules

### Authentication & Account Rules
- **BR-01**: **Authentication Eligibility**: Only users with `isActive = true` and valid matching password hashes can authenticate.
- **BR-02**: **Mandatory Password Change**: Users with `mustChangePassword = true` are restricted exclusively to the Change Password API (`POST /api/auth/change-password`). Access to ticket and admin APIs is blocked until a valid new password is set.
- **BR-03**: **Password Security & Complexity**:
  - Passwords must be hashed using `bcrypt` (salt rounds ≥ 10). Plaintext passwords must never be logged or stored.
  - New passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
  - The new password cannot be identical to the current initial password.
- **BR-04**: **Session & Identity Binding**: Client-supplied requester IDs or identity headers (`x-requester-id`) are strictly prohibited. Identity is extracted solely from the validated session token.

### Role & Authorization Rules
- **BR-05**: **Single Role Assignment**: Every user must possess exactly one role: `REQUESTER`, `IT_STAFF`, or `ADMINISTRATOR`.
- **BR-06**: **Authorization Matrix**:
  - `REQUESTER`: Can create tickets; view/manage owned tickets and attachments; post Public Comments; mark issue as appears resolved. Cannot view Internal Notes, access Staff Queue, or manage users.
  - `IT_STAFF`: Can view Staff Queue; view all tickets/attachments; claim/reassign tickets; set IT Priority; execute status transitions; post Public Comments; create/view Internal Notes. Cannot manage users.
  - `ADMINISTRATOR`: Can manage users via User Management screen; view all tickets/attachments; post Public Comments; create/view Internal Notes.
- **BR-07**: **Comment & Note Visibility**:
  - **Public Comments**: Visible to Requester (ticket owner), IT Staff, and Administrators.
  - **Internal Notes**: Visible ONLY to IT Staff and Administrators. Never exposed to Requesters.

### Ticket Lifecycle & Workflow Rules
- **BR-08**: **Ticket Ownership Assignment**: A ticket's primary owner (`assignedStaffId`) must be an active user with role `IT_STAFF` or `ADMINISTRATOR`. Unassigned tickets have `assignedStaffId = null`.
- **BR-09**: **IT Priority Management**: `requestedPriority` is set by the Requester upon creation and is read-only thereafter. `itPriority` is initially copied from `requestedPriority` upon creation and can subsequently be updated only by IT Staff or Administrators.
- **BR-10**: **Ticket Status Transition Matrix & Role Permissions**:
  - Requesters are strictly prohibited from changing ticket status fields (`currentStatus`). Requesters may only signal resolution via `isRequesterResolved = true` (BR-11).
  - IT Staff and Administrators may execute status transitions strictly following the permitted transition matrix table below:

| From Status | Permitted To Status | Permitted Roles | Required Conditions & Validation |
| :--- | :--- | :--- | :--- |
| `NEW` | `OPEN`, `IN_PROGRESS`, `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Transitioning to `OPEN` or `IN_PROGRESS` optional auto-claim. |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | `RESOLVED` requires IT Staff or Admin action. |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | `RESOLVED` requires resolution summary notes. |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Returns to `IN_PROGRESS` when Requester comments. |
| `RESOLVED` | `CLOSED`, `REOPENED` | `IT_STAFF`, `ADMINISTRATOR` | `CLOSED` finalizes resolution; `REOPENED` resets workflow. |
| `REOPENED` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Re-activates investigation queue. |
| `CLOSED` | `REOPENED` (Admin only) | `ADMINISTRATOR` ONLY | Final state. IT Staff cannot reopen `CLOSED` tickets. |
| `CANCELLED` | None | None | Terminal state. No further transitions allowed. |

- **BR-11**: **Requester Resolution Indication**: A Requester marking "Problem Appears Resolved" sets `isRequesterResolved = true`. This flags the ticket for IT Staff but does not change `currentStatus` to `RESOLVED` or `CLOSED`.
- **BR-12**: **Comment & Note Validation**:
  - Content must be trimmed and non-empty.
  - Content length must be between 1 and 1000 characters.
  - Entries are append-only. Editing and deletion are prohibited.

### Administrator Safety Rules
- **BR-13**: **Unique Email Enforcement**: User email addresses must be unique (case-insensitive).
- **BR-14**: **Self-Deactivation Prevention**: An Administrator cannot deactivate their own active account.
- **BR-15**: **Last Administrator Protection**: Deactivating or changing the role of the last active Administrator in the system is prohibited and rejected with HTTP 400 Bad Request.
- **BR-16**: **No Account Hard Deletion**: Account removal is implemented via soft deactivation (`isActive = false`). User deletion is prohibited to maintain relational integrity with tickets and comments.

---

## 6. UI Specification Summary
The interface builds on the **Zen Green Design System** established in Lab 2. Full wireframes, visual tokens, responsive rules, and component specs are documented in `docs/lab-03/ui-spec.md`. Key updates include:
- **Authentication Shell**: Replaces Development Selector with Login screen, Password Change screen, and Header displaying authenticated User Name, Role Badge (`Requester`, `IT Staff`, `Admin`), and Logout button.
- **IT Staff Queue View**: Responsive table on Desktop/Tablet with status/priority pills, ownership badges, quick filter bars, and card view transformation on Mobile (< 768px).
- **IT Staff Ticket Detail View**: Split tabbed or sectioned interface containing Read-Only Ticket Summary, Operational Controls (Assign, IT Priority, Status), Public Comments stream, private Internal Notes stream (highlighted in Pale Yellow/Amber container), and File Attachments list.
- **Administrator User Management View**: Searchable data table with role filters, User Creation Modal, User Edit Modal, Initial Password Reset Modal, and Activation Toggles.

---

## 7. Data Changes (Prisma Schema)

### Schema Modifications
```prisma
enum Role {
  REQUESTER
  IT_STAFF
  ADMINISTRATOR
}

model User {
  id                 Int        @id @default(autoincrement())
  name               String
  email              String     @unique
  passwordHash       String
  role               Role       @default(REQUESTER)
  isActive           Boolean    @default(true)
  mustChangePassword Boolean    @default(false)
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  submittedTickets   Ticket[]   @relation("TicketRequester")
  assignedTickets    Ticket[]   @relation("TicketAssignee")
  publicComments     TicketComment[]
  internalNotes      TicketInternalNote[]
}

// Updated Ticket Model
model Ticket {
  id                  Int      @id @default(autoincrement())
  ticketNumber        String   @unique
  summary             String
  description         String
  requestedPriority   String
  itPriority          String   @default("MEDIUM")
  currentStatus       String   @default("NEW")
  isRequesterResolved Boolean  @default(false)
  
  requesterId         Int
  assignedStaffId     Int?
  categoryId          Int
  relatedSystemId     Int
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  requester           User     @relation("TicketRequester", fields: [requesterId], references: [id], onDelete: Restrict)
  assignedStaff       User?    @relation("TicketAssignee", fields: [assignedStaffId], references: [id], onDelete: SetNull)
  category            Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  relatedSystem       RelatedSystem @relation(fields: [relatedSystemId], references: [id], onDelete: Restrict)
  attachments         Attachment[]
  comments            TicketComment[]
  internalNotes       TicketInternalNote[]

  @@index([requesterId])
  @@index([assignedStaffId])
  @@index([currentStatus])
  @@index([requestedPriority])
  @@index([itPriority])
}

model TicketComment {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([ticketId])
}

model TicketInternalNote {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([ticketId])
}
```

### Data Migration Plan
1. **Migration Script**: Create a Prisma migration (`npx prisma migrate dev --name init_lab3`) that renames/migrates `RequesterUser` records to `User` with `role = REQUESTER`, sets initial `passwordHash` (hashed `Password123!`), and sets `mustChangePassword = true`.
2. **ForeignKey Preservation**: Ensure all existing Lab 2 `Ticket.requesterId` foreign keys map directly to the newly populated `User.id` primary keys.
3. **Default Field Values**: Set `itPriority = requestedPriority` for all existing tickets and set `assignedStaffId = null`.

### Required Seed Data (`seed.ts`)
- **Requesters**: 4 Active (`jennifer.a@example.com`, `michael.b@example.com`, `sarah.j@example.com`, `david.l@example.com`), 1 Inactive (`alex.t@example.com`). Initial password: `Password123!`.
- **IT Staff**: 3 Active (`staff.somchai@example.com`, `staff.somsri@example.com`, `staff.wichai@example.com`), 1 Inactive (`staff.inactive@example.com`). Initial password: `Password123!`.
- **Administrators**: 1 Active (`admin.toktickit@example.com`). Initial password: `Password123!`.
- **Tickets & Attachments**: Pre-populated tickets across various statuses, assigned staff, priorities, public comments, and internal notes.

---

## 8. API Contract Summary
Full endpoint signatures, schemas, and HTTP status codes are documented in `docs/lab-03/api-spec.md`. Summary:
- `POST /api/auth/login`: Authenticate email/password -> HTTP-only session cookie.
- `POST /api/auth/logout`: Invalidate session.
- `GET /api/auth/me`: Retrieve authenticated user profile and role.
- `POST /api/auth/change-password`: Execute required password change.
- `GET /api/staff/tickets`: Fetch Staff Ticket Queue with search, filter, sort, pagination.
- `GET /api/staff/tickets/:id`: Fetch Ticket Detail for Staff/Admin.
- `PATCH /api/staff/tickets/:id/assign`: Claim or reassign ticket owner.
- `PATCH /api/staff/tickets/:id/priority`: Update IT Priority.
- `PATCH /api/staff/tickets/:id/status`: Update ticket status following BR-10 matrix.
- `GET /api/tickets/:id/comments`: Fetch Public Comments.
- `POST /api/tickets/:id/comments`: Post a Public Comment.
- `GET /api/tickets/:id/notes`: Fetch Internal Notes (Staff/Admin only).
- `POST /api/tickets/:id/notes`: Post an Internal Note (Staff/Admin only).
- `PATCH /api/tickets/:id/resolve-ack`: Requester "Problem Appears Resolved" toggle.
- `GET /api/admin/users`: List users with search/role filter.
- `POST /api/admin/users`: Create user account.
- `PATCH /api/admin/users/:id`: Edit user account.
- `POST /api/admin/users/:id/reset-password`: Set new initial password.

---

## 9. Acceptance Criteria

- **AC-01**: Given valid active user credentials, when logging in via `POST /api/auth/login`, then the server returns an HTTP-only authentication cookie and the user's profile and role.
- **AC-02**: Given an inactive user (`isActive = false`), when login is attempted, then the server rejects authentication with HTTP 401 Unauthorized.
- **AC-03**: Given a user with `mustChangePassword = true`, when logging in, then access to application screens is blocked until `POST /api/auth/change-password` succeeds with a valid new password.
- **AC-04**: Given an authenticated user, when clicking Logout, then `POST /api/auth/logout` clears the session cookie and redirects to the login screen.
- **AC-05**: Given an authenticated Requester, when accessing tickets or attachments, then identity is derived solely from the session cookie, and any client-supplied requester ID is ignored.
- **AC-06**: Given an unauthenticated or unauthorized user, when requesting protected endpoints (e.g. Requester accessing `/api/admin/users` or `/api/tickets/:id/notes`), then the server returns HTTP 401 or 403 Forbidden.
- **AC-07**: Given IT Staff logged in, when opening the Ticket Queue, then assigned and unassigned tickets are displayed with search, category/status/priority filters, and pagination.
- **AC-08**: Given IT Staff viewing an unassigned ticket, when clicking "Claim Ticket", then `assignedStaffId` is updated to the staff member's ID.
- **AC-09**: Given IT Staff viewing a ticket, when updating IT Priority from `MEDIUM` to `HIGH`, then `itPriority` updates while `requestedPriority` remains unchanged.
- **AC-10**: Given IT Staff viewing a ticket in `NEW` status, when changing status to `IN_PROGRESS`, then the status updates following the permitted transition matrix (BR-10).
- **AC-11**: Given IT Staff attempting an invalid status transition (e.g. `NEW` directly to `CLOSED`), then the request is rejected with HTTP 400 Bad Request.
- **AC-12**: Given a ticket owner, IT Staff, or Admin, when posting a Public Comment, then the comment appears in the comment stream with author name, role badge, and creation timestamp.
- **AC-13**: Given IT Staff or Admin, when creating an Internal Note, then the note is saved and displayed in the Internal Notes stream.
- **AC-14**: Given a Requester viewing a ticket, when requesting Internal Notes via API, then the server returns HTTP 403 Forbidden without exposing note content.
- **AC-15**: Given a Requester viewing an owned ticket, when clicking "Problem Appears Resolved", then `isRequesterResolved` becomes `true` while `currentStatus` remains unchanged.
- **AC-16**: Given an Administrator viewing User Management, when searching by name "Jennifer" or filtering by role `IT_STAFF`, then the user table filters dynamically.
- **AC-17**: Given an Administrator creating a user with an existing email address, then the server rejects the request with HTTP 409 Conflict.
- **AC-18**: Given an Administrator attempting to deactivate their own account, then the request is rejected with HTTP 400 Bad Request.
- **AC-19**: Given an Administrator attempting to deactivate the last active Administrator in the system, then the request is rejected with HTTP 400 Bad Request.
- **AC-20**: Given interactive elements across Desktop, Tablet, and Mobile viewports, when navigating via keyboard or touch, then visible focus indicators, touch targets (≥ 44px), and zero horizontal overflow are maintained.
- **AC-21**: Given invalid credentials (wrong password or non-existent email), when login is attempted via `POST /api/auth/login`, then the server rejects authentication with HTTP 401 Unauthorized and a safe error message.

---

## 10. Definition of Done

### Product Completion
- All Functional Requirements (FR-01 to FR-21) and Business Rules (BR-01 to BR-16) fully implemented.
- All Acceptance Criteria (AC-01 to AC-20) verified via automated test suites (100% pass rate).
- Database migration script executed cleanly without data loss of Lab 2 tickets/attachments.
- Zero horizontal scrolling or visual clipping on Desktop (≥ 992px), Tablet (768px - 991px), and Mobile (< 768px).

### Course Delivery Requirements
- Code developed via feature branches with Pull Requests merged into `lab3-staging` before final release PR into `main`.
- All GitHub Issues linked and moved to `Done` on Kanban board.
- Complete documentation set in `docs/lab-03/` (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
- Single consolidated PDF submission report matching Answer Part 1 to Part 9 format.

---

## 11. Assumptions and Decisions

1. **Session & Cookie Security**: Authentication uses signed JWT tokens stored in HTTP-Only, SameSite=Strict cookies (`toktickit_session`). This prevents XSS token theft while eliminating manual token management on the client.
2. **Separate Comment & Internal Note Models**: Created distinct `TicketComment` and `TicketInternalNote` models in Prisma rather than a single table with a boolean flag. This provides strict schema-level separation, explicit foreign key cascades, and foolproof authorization checks.
3. **Lab 2 User Data Migration Strategy**: Migrated Lab 2 `RequesterUser` records directly into the `User` table with `role = REQUESTER`, preserving primary key IDs so existing `Ticket.requesterId` foreign keys remain valid without orphaned records.
4. **First-Login Password Policy**: All seeded and newly created users start with `mustChangePassword = true` and an initial password (`Password123!`). Upon first login, users must submit a new password meeting BR-03 rules before accessing application features.
