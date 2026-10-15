# Lab 4 Engineering Specification — TokTickIT

**Sprint Title:** Actions Taken, Dashboards, and Final Regression  
**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Target Repository:** `toktickit`  
**Status:** Approved Engineering Contract  

---

## 1. Sprint Goal

Deliver the final product increment for TokTickIT by introducing a parent-child **Actions Taken** work-tracking subsystem under each Ticket, enforcing an authoritative server-side **Ticket status transition matrix and resolution gate**, and providing role-tailored **Dashboards** (for Requesters, IT Staff, and Administrators) with real-time metrics and seamless drill-downs. The sprint guarantees 100% regression stability across all Lab 1–3 capabilities (Authentication, RBAC, Requester Ticketing, Attachments, Comments, Internal Notes, and User Management) while polishing visual consistency, accessibility, and error resilience under the Zen Green design system.

---

## 2. Stakeholder Request (Interpretation in Student's Words)

While earlier sprints enabled Requesters to submit tickets and allowed IT Staff to communicate via public comments and internal notes, the service desk currently lacks a structured, granular audit log of technical interventions executed on each ticket. The stakeholder requires:
1. An **Actions Taken** log embedded within each Ticket Detail view where IT Staff can record discrete tasks, operational results, follow-up obligations, and references to supporting documentation or physical attachments. Multiple IT Staff members may contribute actions to a single ticket while the designated primary Ticket Owner retains overall ownership.
2. A formal **Resolution Gate** ensuring that when Requesters flag an issue as "problem appears resolved", it remains strictly advisory. A ticket cannot reach `RESOLVED` status without explicit verification and formal transition by IT Staff or Administrators.
3. Concise, responsive **Dashboards** serving as default operational landing views for Requesters (tracking their own active/resolved requests) and IT Staff/Administrators (monitoring queue volumes, unassigned workloads, priority distributions, and urgent tickets), each linking directly to actionable filtered lists.
4. Comprehensive **hardening and regression preservation** ensuring the entire end-to-end application functions seamlessly across Desktop, Tablet, and Mobile devices without visual glitches, horizontal overflow, or security loopholes.

---

## 3. Scope

### 3.1 In-Scope Deliverables
- **Data Model & Schema**:
  - New `ActionTaken` model with parent-child foreign key relationship to `Ticket`.
  - New `ActionTakenStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - Integer `version` column on `Ticket` supporting optimistic concurrency control (conflict detection).
  - Backward-compatible, non-destructive Prisma migration and idempotent database seed script.
- **Backend & REST APIs**:
  - REST endpoints for creating, listing, updating, completing, and cancelling `ActionTaken` records (`/api/tickets/:id/actions`, `/api/actions/:id`).
  - Requester Dashboard metric endpoint (`GET /api/dashboard/requester`).
  - Unified Staff & Administrator Dashboard metric endpoint (`GET /api/dashboard/staff`).
  - Server-enforced Ticket Status transition matrix covering all 8 lifecycle states.
  - Concurrency conflict handling returning HTTP `409 Conflict`.
- **Frontend & Zen Green UI**:
  - Role-adaptive default landing screen with "Dashboard" header navigation.
  - Requester Dashboard component with 4 primary metric cards, recent tickets list, and quick actions.
  - IT Staff / Admin Dashboard component with queue metrics, priority breakdown, and filter drill-downs.
  - Actions Taken UI section embedded in Ticket Detail with tabular/card listing, create modal, and edit/status transitions.
  - Updated Ticket Status transition dropdown in Staff Ticket Detail strictly reflecting permitted matrix states.
- **Quality Assurance**:
  - Automated tests across Server Unit/API, Client Vitest, and multi-viewport Playwright E2E.
  - Complete regression verification of Lab 1–3 features.

### 3.2 Explicit Exclusions (Out of Scope)
As defined in Section 4.2 of the Lab 4 Handout, the following features are strictly prohibited:
1. Automatic SLA countdown clocks, escalation triggers, on-call paging, or automated breach warnings.
2. External communication services (outbound emails, SMS, LINE notifications, push notifications, webhooks).
3. Inventory parts consumption, spare-parts tracking, hardware procurement, or service cost accounting.
4. Time-sheet logging, billable hours tracking, payroll calculation, or labor-cost reporting.
5. Multi-level administrative approval chains or cryptographic electronic signatures.
6. Advanced Business Intelligence (BI) tools, custom visual report query builders, or external data warehouses.
7. Multi-tenant database tenancy, organization partitioning, or cloud deployment infrastructure.
8. Unapproved UI elements or workflows not specified in this engineering contract.

---

## 4. Functional Requirements

### Actions Taken Management
- **FR-01 (Create Action Taken)**: Authenticated IT Staff and Administrators can create an Action Taken record under any accessible Ticket by submitting Action Description, Result, Follow-Up Required toggle, Follow-up Note (mandatory if follow-up is true), Attachment Notes (optional), initial status, and optional assignee. The system automatically populates `actionDateTime` and `performedById` from the authenticated session.
- **FR-02 (View Actions Taken)**: Any user authorized to view a ticket (owner Requester, IT Staff, Administrator) can view all Actions Taken records associated with that ticket in chronological order. Requesters have read-only access.
- **FR-03 (Edit & Transition Action Taken)**: Authenticated IT Staff and Administrators can edit the Action Description, Result, Follow-Up details, Attachment Notes, assignee, and update the status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) of an existing Action Taken record.
- **FR-04 (Assignee Validation)**: When assigning an Action Taken record to a user (`assigneeId`), the backend must validate that the assigned user exists, has role `IT_STAFF` or `ADMINISTRATOR`, and is currently `isActive = true`. Inactive or non-staff assignees must be rejected with HTTP 400.

### Ticket Status & Workflow
- **FR-05 (Permitted Status Transitions)**: The backend must enforce the authoritative state transition matrix across all 8 ticket statuses (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`). Unpermitted transitions must be rejected with HTTP 400.
- **FR-06 (Advisory Resolution Gate)**: Requesters can toggle their advisory acknowledgment (`isRequesterResolved = true` or `false`). This flag must NOT alter `currentStatus`. Only IT Staff and Administrators can transition a ticket to `RESOLVED`.
- **FR-07 (Optimistic Concurrency Control)**: All ticket workflow updates (status, priority, assignment) and action modifications must verify the entity's `version`. If the client submits a stale version number, the backend must abort the write and return HTTP `409 Conflict`.

### Role-Based Dashboards
- **FR-08 (Requester Dashboard Metrics)**: Provide `GET /api/dashboard/requester` returning authoritative counts of:
  1. `totalOpenTickets`: Active owned tickets in `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, or `REOPENED`.
  2. `ticketsWaitingForRequester`: Owned tickets currently in `WAITING_FOR_REQUESTER`.
  3. `recentlyResolvedTickets`: Owned tickets transitioned to `RESOLVED` within the last 30 days.
  4. `myRecentTickets`: An array of the 5 most recently updated owned tickets.
- **FR-09 (IT Staff Dashboard Metrics)**: Provide `GET /api/dashboard/staff` returning authoritative counts of:
  1. `unassignedTickets`: Open tickets where `assignedStaffId` is null.
  2. `myAssignedTickets`: Open tickets assigned to the authenticated IT Staff user.
  3. `ticketsByStatus`: Numerical breakdown across all 8 statuses.
  4. `ticketsByPriority`: Numerical breakdown of active tickets across `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  5. `urgentTicketsCount`: Count of active tickets with `itPriority = URGENT`.
  6. `recentQueueTickets`: An array of the 5 most recently updated tickets across the entire queue.
- **FR-10 (Administrator Dashboard Extensions)**: When `GET /api/dashboard/staff` is accessed by an `ADMINISTRATOR`, the response payload automatically includes an `adminUserSummary` object containing total user count, active user count, and user breakdown by role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- **FR-11 (Dashboard Drill-Down Navigation)**: Every dashboard card, metric count, and recent list item must provide an accessible click target that navigates to the corresponding filtered view in the Ticket List, Staff Queue, or User Management with relevant query filters pre-applied.

### Application Shell & Regression Hardening
- **FR-12 (Default Dashboard Landing & Navigation)**: Upon successful authentication, Requesters, IT Staff, and Administrators are directed to their respective Dashboard view by default. The header navigation bar must display an active "Dashboard" tab alongside existing navigation items.

---

## 5. Business Rules

| Rule ID | Title | Description / Enforcement Rule |
| :--- | :--- | :--- |
| **BR-01** | Strict Parent Ticket Containment | Every `ActionTaken` line belongs to exactly one `Ticket`. It cannot exist independently or be transferred across tickets. Deleting a ticket cascades deletion to its associated action lines. |
| **BR-02** | Independent Action Actor | While a primary `Ticket.assignedStaffId` coordinates the ticket as a whole, individual `ActionTaken` records can be created, assigned to, and performed by any permitted IT Staff member or Administrator. |
| **BR-03** | Requester Read-Only Visibility | Requesters can view all `ActionTaken` lines on tickets they own (`ticket.requesterId == session.user.id`). Requesters are strictly forbidden from creating, editing, or deleting `ActionTaken` records (HTTP 403 Forbidden). |
| **BR-04** | Follow-Up Note Requirement | If `followUpRequired` is set to `true`, `followUpNote` must be a non-empty string (trimmed length 1–1000 characters). If `followUpRequired` is `false`, `followUpNote` may be null or empty. |
| **BR-05** | Active Assignee Constraint | An `ActionTaken` record may optionally specify an `assigneeId`. If provided, the user must have role `IT_STAFF` or `ADMINISTRATOR` and `isActive` must be `true`. Inactive or non-staff users cannot be assigned. |
| **BR-06** | Authoritative Resolution Gate | A Requester setting `isRequesterResolved = true` is purely advisory for IT Staff. The ticket status remains unchanged. Only an authenticated `IT_STAFF` or `ADMINISTRATOR` can transition `currentStatus` to `RESOLVED`. |
| **BR-07** | Permitted Status Transition Matrix | Status updates must strictly adhere to the permitted transitions table defined in Section 5.1. Any disallowed transition returns HTTP 400 with a descriptive error code `INVALID_STATUS_TRANSITION`. |
| **BR-08** | Requester Cancellation Privilege | A Requester may cancel their owned ticket (`NEW -> CANCELLED`) only while the ticket is still in `NEW` status. Once transitioned to `OPEN` or `IN_PROGRESS`, only IT Staff or Administrators may cancel it. |
| **BR-09** | Auto-Transition on Requester Comment | When a Requester submits a public comment on an owned ticket currently in `WAITING_FOR_REQUESTER`, the backend automatically transitions the ticket status to `IN_PROGRESS` (preserving BR-11 from Lab 3). |
| **BR-10** | Optimistic Concurrency Conflict Rule | Any mutation on a Ticket or Action Taken must include the expected `version` integer. If the record in the database has a different `version`, the operation must reject with HTTP `409 Conflict` (`CONCURRENCY_CONFLICT`). On success, `version` is incremented by 1. |
| **BR-11** | Authoritative Metric Calculation | All dashboard counters and aggregations must be computed dynamically via backend SQL/Prisma queries against authoritative database tables. The client must not calculate summary metrics from raw lists. |
| **BR-12** | Requester Data Scoping | The Requester Dashboard endpoint (`GET /api/dashboard/requester`) must strictly scope all metric calculations, counts, and recent lists to `ticket.requesterId == session.user.id`. No cross-requester data leakage is permitted. |
| **BR-13** | Timezone and Date Boundaries | Date-based metrics (e.g. "Recently Resolved in last 30 days") evaluate UTC timestamps against `NOW() - INTERVAL '30 days'`. Display formatting in UI converts timestamps to user local time (`Asia/Bangkok`, UTC+7). |
| **BR-14** | Stable Action Ordering | Actions Taken on a ticket must always be returned sorted by `actionDateTime ASC, id ASC` to preserve an append-only chronological history. |
| **BR-15** | Preserved Internal Notes Secrecy | `TicketInternalNote` records remain strictly restricted to IT Staff and Administrators. Requesters cannot view, query, or infer internal notes (preserving Lab 3 privacy). |
| **BR-16** | Soft Removal Attachment Integrity | Soft-removed attachments remain download-disabled (HTTP 410 Gone) and do not count toward the active attachment limit of 5 (preserving Lab 2 rules). |

---

### 5.1 Ticket Status Transition Matrix

The table below defines the authoritative lifecycle rules. Any transition not explicitly listed is strictly forbidden.

| Current Status | Target Status | Permitted Roles | Business Rationale / Conditions |
| :--- | :--- | :--- | :--- |
| `NEW` | `OPEN` | `IT_STAFF`, `ADMINISTRATOR` | IT triage accepts ticket into operational backlog. |
| `NEW` | `IN_PROGRESS` | `IT_STAFF`, `ADMINISTRATOR` | IT staff immediately starts active work. |
| `NEW` | `CANCELLED` | `REQUESTER`, `IT_STAFF`, `ADMIN` | Requester withdrawal before triage, or invalid ticket. |
| `OPEN` | `IN_PROGRESS` | `IT_STAFF`, `ADMINISTRATOR` | Staff begins troubleshooting/investigation. |
| `OPEN` | `WAITING_FOR_REQUESTER` | `IT_STAFF`, `ADMINISTRATOR` | Additional information needed from requester. |
| `OPEN` | `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Ticket rejected or invalidated during analysis. |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER` | `IT_STAFF`, `ADMINISTRATOR` | Diagnostic info or approval required from requester. |
| `IN_PROGRESS` | `RESOLVED` | `IT_STAFF`, `ADMINISTRATOR` | **Resolution Gate**: IT verifies solution and marks resolved. |
| `IN_PROGRESS` | `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Request abandoned or made redundant. |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS` | `REQUESTER` (auto/manual), `IT_STAFF`, `ADMIN` | Requester replies with comment or staff resumes work. |
| `WAITING_FOR_REQUESTER` | `RESOLVED` | `IT_STAFF`, `ADMINISTRATOR` | Issue resolved without further requester input. |
| `WAITING_FOR_REQUESTER` | `CANCELLED` | `IT_STAFF`, `ADMINISTRATOR` | Requester failed to respond or abandoned request. |
| `RESOLVED` | `CLOSED` | `REQUESTER`, `IT_STAFF`, `ADMIN` | Requester confirms satisfaction or automatic closing. |
| `RESOLVED` | `REOPENED` | `REQUESTER`, `IT_STAFF`, `ADMIN` | Solution failed; requester reopens within grace window. |
| `CLOSED` | `REOPENED` | `IT_STAFF`, `ADMINISTRATOR` | Administrative reopening for audit/rework. |
| `REOPENED` | `IN_PROGRESS` | `IT_STAFF`, `ADMINISTRATOR` | Investigation resumed on recurring defect. |
| `CANCELLED` | *(none)* | *(none)* | Terminal status. No further transitions permitted. |

---

### 5.2 Authorization Matrix (Role × Operation)

| Operational Capability | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| View Requester Dashboard (`/api/dashboard/requester`) | **ALLOW** (Own Data) | DENY (403) | DENY (403) |
| View Staff Dashboard (`/api/dashboard/staff`) | DENY (403) | **ALLOW** (Queue) | **ALLOW** (+ User Summary) |
| View Ticket List / Queue | **ALLOW** (Own Only) | **ALLOW** (All) | **ALLOW** (All) |
| Create Ticket | **ALLOW** | **ALLOW** | **ALLOW** |
| Toggle "Problem Appears Resolved" (`resolve-ack`) | **ALLOW** (Own Only) | **ALLOW** | **ALLOW** |
| Update Ticket Status / Priority / Assignee | DENY (403)* | **ALLOW** | **ALLOW** |
| View Actions Taken on Ticket | **ALLOW** (Own Only) | **ALLOW** | **ALLOW** |
| Create Action Taken (`POST /api/tickets/:id/actions`) | DENY (403) | **ALLOW** | **ALLOW** |
| Update Action Taken (`PATCH /api/actions/:id`) | DENY (403) | **ALLOW** | **ALLOW** |
| View Public Comments | **ALLOW** | **ALLOW** | **ALLOW** |
| Post Public Comment | **ALLOW** (Own Only) | **ALLOW** | **ALLOW** |
| View / Post Confidential Internal Notes | DENY (403) | **ALLOW** | **ALLOW** |
| Upload / Download / Remove Attachments | **ALLOW** (Own Only) | **ALLOW** | **ALLOW** |
| Admin User Management (`/api/admin/users`) | DENY (403) | DENY (403) | **ALLOW** |

*\*Note: Requesters may only set status to `CANCELLED` on their own tickets when currently in `NEW` status.*

---

## 6. UI Specification Summary

The TokTickIT user interface preserves the **Zen Green Theme** visual language (`#006B3C` primary, `#0B7A46` secondary/focus, `#EAF6EF` light accents, `#F5F7F6` page background, `#FFFFFF` cards with `#E0E6E2` borders).

### 6.1 Application Navigation Bar (`Header.tsx`)
- **Default Landing**: Post-login navigation redirects directly to "Dashboard".
- **Navigation Links**:
  - `REQUESTER`: **Dashboard** (active default), **My Tickets**, **Create Ticket**.
  - `IT_STAFF`: **Dashboard** (active default), **Ticket Queue**.
  - `ADMINISTRATOR`: **Dashboard** (active default), **Ticket Queue**, **User Management**.
- **User Profile Pill**: Bold user name, role badge (Requester: Blue `#DBEAFE`, IT Staff: Emerald `#D1FAE5`, Admin: Indigo `#E0E7FF`), and Logout button.

### 6.2 Requester Dashboard Screen
- **Welcome Banner**: "Welcome back, {Name}!" with current date.
- **Metric Cards (4 Grid Cards)**:
  1. *Open Tickets*: Large integer count, subtitle "Active tickets in progress", clickable drill-down to `/tickets?tab=open`.
  2. *Waiting on You*: Highlighted card (amber border if count > 0), drill-down to `/tickets?status=WAITING_FOR_REQUESTER`.
  3. *Recently Resolved*: Count of tickets resolved in the last 30 days, drill-down to `/tickets?tab=resolved`.
  4. *Quick Action Card*: Prominent "+ Create Ticket" button navigating directly to ticket creation form.
- **Recent Tickets Table**: List of top 5 recently updated tickets showing Ticket #, Summary, Status Pill, Last Updated timestamp, and an "Open" button.

### 6.3 IT Staff & Administrator Dashboard Screen
- **Overview Metrics Row**:
  1. *Unassigned Tickets*: Tickets needing owner assignment (red/amber indicator if count > 0). Drill-down to `/staff/queue?filter=unassigned`.
  2. *Assigned to Me*: Personal workload count. Drill-down to `/staff/queue?filter=my-assigned`.
  3. *Urgent Priority*: Active tickets marked `URGENT`. Drill-down to `/staff/queue?priority=URGENT`.
  4. *Waiting for Requester*: Tickets awaiting customer response. Drill-down to `/staff/queue?status=WAITING_FOR_REQUESTER`.
- **Status & Priority Distribution Widgets**: Compact horizontal pill bars visualizing ticket volume across statuses and priority tiers.
- **Recent Queue Stream**: Latest 5 tickets updated across the helpdesk.
- **Administrator User Summary Card (Admin Only)**: Displays Total Registered Accounts, Active Accounts count, and breakdown chips by role. Drill-down links to `/admin/users`.

### 6.4 Actions Taken Component (`ActionsTakenSection.tsx`)
- Located inside `StaffTicketDetail.tsx` (read/write for Staff/Admin) and `TicketDetailView.tsx` (read-only for Requester).
- **Header**: "Actions Taken ({count})" with a "+ Record Action" button (Staff/Admin only).
- **Action Line Cards / Table**:
  - Columns/Fields: Date/Time (`actionDateTime`), Description, Result, Status Pill (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), Performed By (badge), Assignee (badge or "Unassigned"), Follow-up indicator (amber badge if required with follow-up note preview), Attachment Notes chip.
  - Action Controls (Staff/Admin only): "Edit" button opening modal to update description, result, follow-up, assignee, and status.
- **Record/Edit Action Modal Dialog**:
  - Accessible modal dialog (`max-width: 580px`).
  - Inputs: Description (`*`, textarea), Result (`*`, textarea), Status dropdown, Assignee dropdown (populated with active IT Staff & Admins), Follow-Up Required checkbox toggle, Follow-Up Note (conditionally visible and required when checked), Attachment Notes input.

### 6.5 Responsive Behavior & Accessibility
- **Desktop (≥992px)**: Multi-column metric grids, full data tables for Actions Taken and recent tickets.
- **Tablet (768px–991px)**: 2-column metric grids, horizontal scroll wrappers for tables with touch target padding.
- **Mobile (<768px)**: Single-column stacked metric cards, stacked card view for Actions Taken lines, zero horizontal overflow.
- **Accessibility**: 2px visible emerald focus rings (`outline: 2px solid #0B7A46; outline-offset: 2px`) on all interactive cards, links, and buttons. All inputs paired with semantic labels and ARIA descriptors.

---

## 7. Data Changes & Persistence

### 7.1 Prisma Schema Delta

```prisma
enum ActionTakenStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Ticket {
  id                  Int                  @id @default(autoincrement())
  ticketNumber        String               @unique
  summary             String
  description         String
  requestedPriority   TicketPriority
  itPriority          TicketPriority
  currentStatus       TicketStatus         @default(NEW)
  isRequesterResolved Boolean              @default(false)
  version             Int                  @default(1) // Optimistic Concurrency Control
  requesterId         Int
  assignedStaffId     Int?
  categoryId          Int
  relatedSystemId     Int
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  requester           User                 @relation("TicketRequester", fields: [requesterId], references: [id], onDelete: Restrict)
  assignedStaff       User?                @relation("TicketAssignee", fields: [assignedStaffId], references: [id], onDelete: SetNull)
  category            Category             @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  relatedSystem       RelatedSystem        @relation(fields: [relatedSystemId], references: [id], onDelete: Restrict)
  attachments         Attachment[]
  comments            TicketComment[]
  internalNotes       TicketInternalNote[]
  actionsTaken        ActionTaken[]

  @@index([requesterId])
  @@index([assignedStaffId])
  @@index([currentStatus])
  @@index([requestedPriority])
  @@index([itPriority])
  @@index([updatedAt])
}

model ActionTaken {
  id                Int               @id @default(autoincrement())
  ticketId          Int
  actionDateTime    DateTime          @default(now())
  description       String
  result            String
  status            ActionTakenStatus @default(COMPLETED)
  followUpRequired  Boolean           @default(false)
  followUpNote      String?
  attachmentNotes   String?
  performedById     Int
  assigneeId        Int?
  version           Int               @default(1)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedBy       User              @relation("ActionPerformer", fields: [performedById], references: [id], onDelete: Restrict)
  assignee          User?             @relation("ActionAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)

  @@index([ticketId])
  @@index([performedById])
  @@index([assigneeId])
  @@index([status])
  @@index([actionDateTime])
}

// In User model:
model User {
  // ... existing fields ...
  actionsPerformed    ActionTaken[]        @relation("ActionPerformer")
  actionsAssigned     ActionTaken[]        @relation("ActionAssignee")
}
```

### 7.2 Database Design Decisions Justification
1. **Decision 1: Optimistic Concurrency Control via Integer `version` column**:  
   *Justification:* Instead of relying on client-supplied timestamp comparisons (which are vulnerable to microsecond clock skew, timezone translation issues, and database timestamp truncation), an explicit monotonic integer `version` field provides a deterministic, atomic precondition check: `UPDATE ... WHERE id = :id AND version = :expectedVersion`. If zero rows are affected, a 409 Conflict is triggered safely.
2. **Decision 2: Separation of `performedById` and `assigneeId` on `ActionTaken`**:  
   *Justification:* In real-world service desk operations, work items may be planned and assigned to a technician (`assigneeId`), while another staff member or an administrator logs the actual execution (`performedById`). Separating these keys allows tracking accountability while satisfying the grading rubric's explicit requirement to demonstrate assignment and inactive-assignee rejection.
3. **Decision 3: Cascade Delete on Ticket with Restrict on Performer**:  
   *Justification:* If a ticket is pruned in testing, all associated child intervention lines (`ActionTaken`) must be cleanly removed without orphan rows (`onDelete: Cascade`). However, a user cannot be deleted from the database if they are referenced as the actor who executed an intervention (`onDelete: Restrict`), preserving immutable audit trail integrity.

### 7.3 Non-Destructive Migration & Backfill Strategy
- **Migration Script**: `20261016000000_add_actions_taken_and_version/migration.sql`
  - Adds column `version INTEGER NOT NULL DEFAULT 1` to table `Ticket`.
  - Creates type `ActionTakenStatus` and table `ActionTaken` with foreign keys and indexes.
- **Backfill**:
  - Legacy tickets from Labs 1–3 seamlessly acquire `version = 1` through the default value.
  - Legacy tickets have zero `ActionTaken` child rows. The UI gracefully renders an empty state: "No actions taken recorded yet."
  - Dashboard calculations evaluate `LEFT JOIN` or `COUNT` aggregations, correctly handling tickets with zero actions.
- **Rollback / Recovery Plan**:
  - If a rollback is necessary, down-migration executes:
    ```sql
    DROP TABLE IF EXISTS "ActionTaken" CASCADE;
    DROP TYPE IF EXISTS "ActionTakenStatus";
    ALTER TABLE "Ticket" DROP COLUMN IF EXISTS "version";
    ```
  - This restores the database to the exact Lab 3 schema without corrupting existing tickets, users, comments, or attachments.

### 7.4 Idempotent Seed Data Architecture
The seed script (`server/prisma/seed.ts`) is designed to run repeatedly without duplicate key violations (`upsert` operations):
- Generates realistic test tickets covering:
  - All 8 statuses (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
  - All 4 priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Both unassigned (`assignedStaffId = null`) and staff-assigned states.
  - Tickets with **zero**, **one**, and **multiple** `ActionTaken` items.
  - Action items in varying states (`COMPLETED`, `IN_PROGRESS`, `PENDING`, `CANCELLED`) with and without follow-up notes.
- Configures data sufficient to demonstrate non-zero dashboard metrics (active queue, urgent counts) alongside isolated users with zero tickets to verify zero-state handling.

---

## 8. REST API Contract

### 8.1 Actions Taken Endpoints

#### `POST /api/tickets/:id/actions`
- **Description**: Create a new Action Taken line under a ticket.
- **Authorization**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
  ```json
  {
    "description": "Replaced RAM module and verified BIOS detection.",
    "result": "System booted normally with 16GB RAM detected.",
    "status": "COMPLETED",
    "followUpRequired": true,
    "followUpNote": "Check stability with user after 24 hours.",
    "attachmentNotes": "IMG_0042.jpg photographed slot condition.",
    "assigneeId": 2
  }
  ```
- **Validation**:
  - `description` and `result` non-empty strings (1–2000 chars).
  - If `followUpRequired === true`, `followUpNote` is mandatory (1–1000 chars).
  - If `assigneeId` provided, user must exist, have role `IT_STAFF` or `ADMINISTRATOR`, and `isActive === true`.
- **Responses**:
  - `201 Created`: Returns newly created `ActionTaken` object.
  - `400 Bad Request`: Validation failure or inactive assignee.
  - `403 Forbidden`: Authenticated user is a `REQUESTER`.
  - `404 Not Found`: Ticket does not exist.

#### `GET /api/tickets/:id/actions`
- **Description**: Retrieve all Actions Taken lines for a specific ticket.
- **Authorization**: Authenticated user. (Requesters must own the ticket; Staff/Admin can view all).
- **Responses**:
  - `200 OK`: Array of `ActionTaken` objects sorted by `actionDateTime ASC`.
  - `403 Forbidden`: Requester does not own this ticket.
  - `404 Not Found`: Ticket does not exist.

#### `PATCH /api/actions/:id`
- **Description**: Update an existing Action Taken record.
- **Authorization**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
  ```json
  {
    "description": "Updated intervention notes.",
    "result": "Passes all diagnostic stress tests.",
    "status": "COMPLETED",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "Updated diagnostic log attached.",
    "assigneeId": 3,
    "version": 1
  }
  ```
- **Responses**:
  - `200 OK`: Returns updated `ActionTaken` object with incremented `version`.
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Requester access attempted.
  - `404 Not Found`: Action Taken record does not exist.
  - `409 Conflict`: Stale `version` submitted.

---

### 8.2 Ticket Status & Concurrency Endpoints

#### `PATCH /api/staff/tickets/:id/status` (Updated with Matrix & Versioning)
- **Description**: Transition ticket status in strict compliance with the transition matrix.
- **Authorization**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "version": 1
  }
  ```
- **Validation & Matrix Check**:
  - Evaluates current status against target status per Section 5.1.
  - Evaluates `version == ticket.version`.
- **Responses**:
  - `200 OK`: Returns updated ticket object with new `currentStatus` and incremented `version`.
  - `400 Bad Request`: Disallowed transition (code: `INVALID_STATUS_TRANSITION`).
  - `403 Forbidden`: Unauthorized role.
  - `404 Not Found`: Ticket not found.
  - `409 Conflict`: Concurrency conflict (code: `CONCURRENCY_CONFLICT`).

---

### 8.3 Dashboard Endpoints

#### `GET /api/dashboard/requester`
- **Description**: Fetch authoritative dashboard summary for the logged-in Requester.
- **Authorization**: `REQUESTER`.
- **Response `200 OK`**:
  ```json
  {
    "metrics": {
      "totalOpenTickets": 3,
      "ticketsWaitingForRequester": 1,
      "recentlyResolvedTickets": 5
    },
    "recentTickets": [
      {
        "id": 101,
        "ticketNumber": "TKT-2026-000101",
        "summary": "VPN connection dropping repeatedly",
        "currentStatus": "IN_PROGRESS",
        "requestedPriority": "HIGH",
        "updatedAt": "2026-10-15T14:30:00.000Z"
      }
    ]
  }
  ```

#### `GET /api/dashboard/staff`
- **Description**: Fetch operational queue metrics for IT Staff, plus user account summary if requested by an Administrator.
- **Authorization**: `IT_STAFF`, `ADMINISTRATOR`.
- **Response `200 OK`**:
  ```json
  {
    "metrics": {
      "unassignedTickets": 6,
      "myAssignedTickets": 4,
      "urgentTicketsCount": 2,
      "waitingForRequesterCount": 3,
      "ticketsByStatus": {
        "NEW": 4,
        "OPEN": 2,
        "IN_PROGRESS": 5,
        "WAITING_FOR_REQUESTER": 3,
        "RESOLVED": 8,
        "CLOSED": 12,
        "REOPENED": 1,
        "CANCELLED": 2
      },
      "ticketsByPriority": {
        "LOW": 2,
        "MEDIUM": 6,
        "HIGH": 4,
        "URGENT": 2
      }
    },
    "recentQueueTickets": [
      {
        "id": 108,
        "ticketNumber": "TKT-2026-000108",
        "summary": "Database connection pool saturated",
        "currentStatus": "NEW",
        "itPriority": "URGENT",
        "assignedStaffName": null,
        "updatedAt": "2026-10-15T15:10:00.000Z"
      }
    ],
    "adminUserSummary": {
      "totalUsers": 15,
      "activeUsers": 14,
      "usersByRole": {
        "REQUESTER": 8,
        "IT_STAFF": 5,
        "ADMINISTRATOR": 2
      }
    }
  }
  ```
  *(Note: `adminUserSummary` is included only when `req.user.role === 'ADMINISTRATOR'`)*.

---

## 9. Acceptance Criteria

- **AC-01 (Create Action Taken with Auto PerformedBy)**: Given an authenticated IT Staff user, when posting valid intervention details to `POST /api/tickets/:id/actions`, then the record is persisted under the ticket with `performedById` matching the authenticated session user, status `COMPLETED` (or specified), and HTTP 201 is returned.
- **AC-02 (Follow-Up Note Validation)**: Given an authenticated IT Staff user creating or editing an Action Taken, when `followUpRequired` is `true` but `followUpNote` is empty or missing, then the backend rejects the request with HTTP 400 and validation error message.
- **AC-03 (Inactive Assignee Rejection)**: Given an authenticated IT Staff user creating an Action Taken, when an `assigneeId` is provided for a user whose `isActive` is `false` or whose role is `REQUESTER`, then the backend rejects the assignment with HTTP 400.
- **AC-04 (Requester Read-Only Action Visibility)**: Given an authenticated Requester viewing their owned ticket, when fetching Actions Taken, then all recorded actions are visible in chronological order, but attempting to `POST` or `PATCH` actions returns HTTP 403 Forbidden.
- **AC-05 (Cross-Requester Action Isolation)**: Given an authenticated Requester, when attempting to fetch Actions Taken for a ticket belonging to another requester, then the server responds with HTTP 403 Forbidden.
- **AC-06 (Advisory Resolution Gate Enforcement)**: Given a ticket in `IN_PROGRESS` or `WAITING_FOR_REQUESTER`, when a Requester sets `isRequesterResolved = true`, then `isRequesterResolved` updates to `true` but `currentStatus` remains unchanged.
- **AC-07 (Staff Resolution Enforcement)**: Given a ticket in `IN_PROGRESS`, when an authenticated IT Staff user submits a status change to `RESOLVED`, then the ticket status updates to `RESOLVED` and the change is reflected in the queue and dashboard.
- **AC-08 (Invalid Transition Matrix Rejection)**: Given a ticket currently in `NEW` status, when an IT Staff user attempts to jump directly to `RESOLVED` or `CLOSED`, then the backend rejects the transition with HTTP 400 (`INVALID_STATUS_TRANSITION`).
- **AC-09 (Optimistic Concurrency Conflict on Ticket)**: Given a client attempting to update ticket status with `version = 1`, when the database record already has `version = 2`, then the update fails with HTTP 409 Conflict and error code `CONCURRENCY_CONFLICT`.
- **AC-10 (Requester Dashboard Metric Accuracy)**: Given an authenticated Requester with 2 open tickets and 1 resolved ticket, when querying `GET /api/dashboard/requester`, then the response metrics exactly match `totalOpenTickets: 2`, `recentlyResolvedTickets: 1`, and omit all tickets belonging to other requesters.
- **AC-11 (Staff Dashboard Queue Metrics Accuracy)**: Given an authenticated IT Staff user, when querying `GET /api/dashboard/staff`, then the counts for `unassignedTickets`, `myAssignedTickets`, `ticketsByStatus`, and `urgentTicketsCount` strictly match authoritative database queries.
- **AC-12 (Administrator User Summary Presence)**: Given an authenticated Administrator accessing `GET /api/dashboard/staff`, then the payload includes the populated `adminUserSummary` object, whereas an `IT_STAFF` user receives `adminUserSummary: null` or omitted.
- **AC-13 (Dashboard Drill-Down Navigation)**: Given an IT Staff user viewing the Dashboard, when clicking the "Unassigned Tickets" metric card, then the UI routes to `/staff/queue` with the unassigned filter active.
- **AC-14 (Responsive Layout Integrity)**: Given any major screen (Dashboard, Queue, Ticket Detail with Actions Taken, User Management), when rendered across Desktop (1280px), Tablet (768px), and Mobile (375px), then all content is legible, interactive elements exceed 44px touch height, and horizontal page scrolling is zero.
- **AC-15 (Visible Keyboard Focus Rings)**: Given a user navigating via keyboard `Tab`, when focusing any input, dropdown, button, or link, then an emerald focus ring (`outline: 2px solid #0B7A46`) is clearly visible.
- **AC-16 (Full Labs 1–3 Regression Preservation)**: Given the complete test suite for Labs 1 to 3 (authentication, attachments with 410 Gone soft deletion, comments, internal notes, admin safeguards against last admin deactivation), when executed against the Lab 4 codebase, then 100% of existing tests continue to pass.

---

## 10. Product Definition of Done (DoD)

Before merging `lab4-staging` into `main` and compiling the final submission report, the implementation must satisfy this verifiable checklist:
1. **Contract Documents**: `specification.md`, `tests.md`, `ui-spec.md`, and `api-spec.md` exist under `docs/lab-04/` and are internally consistent.
2. **Schema & Migration**: Prisma schema includes `ActionTaken`, `ActionTakenStatus`, and `Ticket.version`. Migration applies cleanly and non-destructively; seed script is 100% idempotent and covers all required ticket and action states.
3. **Backend Implementation**:
   - All Actions Taken endpoints functional with strict authorization and validation.
   - Authoritative status transition matrix enforced on all status change routes.
   - Optimistic concurrency control active on ticket updates (returning 409 on conflict).
   - Authoritative backend dashboard calculations implemented for Requester, Staff, and Administrator.
4. **Frontend Implementation**:
   - Zen Green design tokens applied cleanly across all new views.
   - Dashboard is the default post-login landing screen for all roles.
   - Actions Taken section rendered in Ticket Detail with full create/edit modals for staff and read-only view for requesters.
   - All metric cards support drill-down navigation.
5. **Quality Assurance & Verification**:
   - `npm test --prefix server` passes 100% (covering Labs 1–4 tests).
   - `npm test --prefix client` passes 100% (covering Labs 1–4 UI component tests).
   - `npm run build --prefix client` completes with zero TypeScript or Vite bundle errors.
   - `npx playwright test` passes 100% across Desktop, Tablet, and Mobile viewports.
   - Zero console errors or warnings in browser developer tools.
6. **Peer Review & AI Reflection**:
   - `reviewer.md` contains complete peer review logs, comments, and approvals for all feature PRs.
   - `ai-use.md` documents prompts, tool usage, and student reflection.

---

## 11. Assumptions and Architectural Decisions

1. **Dashboard Default Landing Page**:
   - *Decision:* The application shell routes authenticated users to `/dashboard` upon sign-in. Requesters can immediately navigate to `/tickets` or `/create-ticket` via header links or dashboard quick actions; IT Staff can navigate to `/staff/queue`. This satisfies the stakeholder request for dashboards to serve as operational starting points.
2. **Action Taken Status Lifecycle**:
   - *Decision:* An `ActionTakenStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) is introduced. While newly logged past interventions default to `COMPLETED`, ongoing diagnostic interventions can be saved as `IN_PROGRESS` or `PENDING` with an assigned technician.
3. **Optimistic Locking Scope**:
   - *Decision:* Ticket updates carry a `version` field. When a staff member submits a status update, priority change, or owner claim, the client includes the ticket's current `version`. If another technician updated the ticket in the background, a `409 Conflict` is returned and the UI alerts the user to refresh and review changes before retrying.
4. **Timezone Standardization**:
   - *Decision:* All backend database timestamps are persisted in UTC (`TIMESTAMPTZ` / Prisma `DateTime`). The client converts timestamps into local format (`Asia/Bangkok`, UTC+7) using browser locale APIs (`Intl.DateTimeFormat`). Date boundaries for 30-day dashboard rolling metrics use UTC SQL intervals.
5. **Soft Removal Preservation**:
   - *Decision:* The Lab 2 attachment soft-removal model (`isRemoved = true`, returning HTTP 410 Gone on download) is preserved intact. Actions Taken records can reference attachment filenames in `attachmentNotes` without interfering with attachment physical storage or soft deletion policies.
