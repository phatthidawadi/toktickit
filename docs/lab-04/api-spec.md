# Lab 4 REST API Specification & Contract

**Sprint Title:** Actions Taken, Dashboards, and Final Regression  
**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Target Repository:** `toktickit`  
**Status:** Approved API Contract  

---

## 1. Authentication, Security Architecture & Protocol Standards

### 1.1 Session Management & Cookie Credentials
- All authenticated endpoints rely on a signed JSON Web Token (JWT) transmitted via an **HTTP-only, SameSite=Strict** cookie named `toktickit_session`.
- The client does not manually construct or transmit `Authorization: Bearer <token>` headers. The browser transmits cookies automatically with `credentials: "include"`.
- **Session Duration**: Tokens expire in **8 hours** (28,800 seconds) from issuance (`expiresIn: "8h"`, `Max-Age=28800`).
- **Stateless Logout**: `POST /api/auth/logout` sets `Set-Cookie: toktickit_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict; Max-Age=0`.

### 1.2 Role-Based Access Control (RBAC)
- All protected endpoints execute `authenticateSession` followed by `requireRole([...])`.
- Roles: `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- Any access violation terminates immediately with **HTTP 403 Forbidden**.
- Users with `mustChangePassword === true` are blocked from executing operational or workflow endpoints (HTTP 403 `MUST_CHANGE_PASSWORD`) until `POST /api/auth/change-password` succeeds.

### 1.3 Safe Error Response Architecture
All failure responses (4xx and 5xx) strictly return a sanitized, machine-readable JSON structure. **Internal stack traces, SQL syntax strings, database driver errors, and sensitive environment details are strictly suppressed from all API responses.**

```json
{
  "error": "Human-readable explanation of why the request failed",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "details": []
}
```

#### Standard HTTP Status Codes

| Code | Label | Typical Usage Scenario |
| :---: | :--- | :--- |
| **200** | `OK` | Successful retrieval, status update, or action modification. |
| **201** | `Created` | Successful creation of an `ActionTaken`, ticket, comment, note, or user. |
| **400** | `Bad Request` | Validation error (e.g. missing required follow-up note, invalid transition). |
| **401** | `Unauthorized` | Missing, expired, or invalid `toktickit_session` cookie. |
| **403** | `Forbidden` | Authenticated user lacks required role, violates ownership, or pending password change. |
| **404** | `Not Found` | Target Ticket, Action Taken, User, or Attachment does not exist. |
| **409** | `Conflict` | Optimistic locking version mismatch (`CONCURRENCY_CONFLICT`) or duplicate user email. |
| **410** | `Gone` | Attempting to download a soft-removed attachment (`ATTACHMENT_REMOVED`). |
| **500** | `Internal Error` | Unhandled runtime failure (sanitized message returned). |

### 1.4 Optimistic Concurrency Control & Conflict Handling (HTTP 409)
To prevent lost updates when multiple staff members manage a ticket concurrently:
1. `Ticket` and `ActionTaken` entities maintain a monotonic integer `version` field (initialized to `1`).
2. Mutation endpoints (`PATCH /api/staff/tickets/:id/status`, `PATCH /api/staff/tickets/:id/priority`, `PATCH /api/staff/tickets/:id/assign`, and `PATCH /api/actions/:id`) accept an integer `version` field representing the client's observed state.
3. The server executes an atomic conditional update:
   `UPDATE ... WHERE id = :id AND version = :submittedVersion`
4. If zero rows match because another update intervened, the server aborts the transaction and returns:
   ```json
   {
     "error": "The record was updated by another user. Please refresh and review before retrying.",
     "code": "CONCURRENCY_CONFLICT"
   }
   ```
5. On successful update, the entity's `version` increments by 1.

### 1.5 Duplicate-Submit & Idempotency Protection
- Frontend action buttons enter a disabled "busy" state upon click until request settlement.
- Backend idempotent operations (e.g. repeated status update to the same value or re-assigning the same staff) gracefully return the current record with HTTP 200 without creating redundant transitions or throwing unhandled errors.

---

## 2. Actions Taken Endpoints

### 2.1 Create Action Taken
`POST /api/tickets/:id/actions`

- **Purpose**: Log a technical intervention or planned action under a specific ticket.
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`. (Requesters blocked with HTTP 403).
- **Request Headers**:
  - `Cookie: toktickit_session=<jwt>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "description": "Replaced RAM module in slot 2 and ran memtest diagnostics.",
    "result": "Passed 4 passes of memtest86 with 0 errors.",
    "status": "COMPLETED",
    "followUpRequired": true,
    "followUpNote": "Check stability with user after 24 hours of operation.",
    "attachmentNotes": "RAM_receipt.pdf and memtest_result.png in physical cabinet.",
    "assigneeId": 2
  }
  ```
- **Validation Rules**:
  - `:id`: Valid positive integer matching an existing ticket.
  - `description`: Non-empty string, trimmed length between 1 and 2,000 characters.
  - `result`: Non-empty string, trimmed length between 1 and 2,000 characters.
  - `status`: Optional enum string (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`). Defaults to `COMPLETED` if omitted.
  - `followUpRequired`: Boolean (default `false`).
  - `followUpNote`: **Mandatory** non-empty string (1–1,000 characters) if `followUpRequired === true`. Must be null or omitted if `followUpRequired === false`.
  - `attachmentNotes`: Optional string (max 1,000 characters).
  - `assigneeId`: Optional integer. If provided, the referenced user must exist, have role `IT_STAFF` or `ADMINISTRATOR`, and have `isActive === true`.
- **Processing Logic**:
  - Automatically records `actionDateTime` as current server timestamp.
  - Automatically records `performedById` from the authenticated session user (`req.user.id`).
- **Response `201 Created`**:
  ```json
  {
    "id": 1,
    "ticketId": 101,
    "actionDateTime": "2026-10-15T16:30:00.000Z",
    "description": "Replaced RAM module in slot 2 and ran memtest diagnostics.",
    "result": "Passed 4 passes of memtest86 with 0 errors.",
    "status": "COMPLETED",
    "followUpRequired": true,
    "followUpNote": "Check stability with user after 24 hours of operation.",
    "attachmentNotes": "RAM_receipt.pdf and memtest_result.png in physical cabinet.",
    "performedById": 2,
    "assigneeId": 2,
    "version": 1,
    "createdAt": "2026-10-15T16:30:00.000Z",
    "updatedAt": "2026-10-15T16:30:00.000Z",
    "performedBy": {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.b@example.com",
      "role": "IT_STAFF"
    },
    "assignee": {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.b@example.com",
      "role": "IT_STAFF"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Follow-up note is required when follow-up is requested", "code": "VALIDATION_ERROR" }`
  - `400 Bad Request`: `{ "error": "Assigned user is inactive or not IT staff", "code": "INVALID_ASSIGNEE" }`
  - `401 Unauthorized`: Missing or invalid session cookie.
  - `403 Forbidden`: Authenticated user is a `REQUESTER`.
  - `404 Not Found`: `{ "error": "Ticket not found", "code": "TICKET_NOT_FOUND" }`

---

### 2.2 List Actions Taken for a Ticket
`GET /api/tickets/:id/actions`

- **Purpose**: Retrieve the chronological list of all Actions Taken lines for a specific ticket.
- **Authorized Roles**:
  - `IT_STAFF`, `ADMINISTRATOR`: Access to all tickets.
  - `REQUESTER`: Permitted **only** if `ticket.requesterId === req.user.id`.
- **Request Headers**:
  - `Cookie: toktickit_session=<jwt>`
- **Ordering**: Sorted chronologically by `actionDateTime ASC, id ASC`.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "ticketId": 101,
      "actionDateTime": "2026-10-15T16:30:00.000Z",
      "description": "Replaced RAM module in slot 2 and ran memtest diagnostics.",
      "result": "Passed 4 passes of memtest86 with 0 errors.",
      "status": "COMPLETED",
      "followUpRequired": true,
      "followUpNote": "Check stability with user after 24 hours of operation.",
      "attachmentNotes": "RAM_receipt.pdf and memtest_result.png in physical cabinet.",
      "performedById": 2,
      "assigneeId": 2,
      "version": 1,
      "createdAt": "2026-10-15T16:30:00.000Z",
      "updatedAt": "2026-10-15T16:30:00.000Z",
      "performedBy": {
        "id": 2,
        "name": "Michael Brown",
        "email": "michael.b@example.com",
        "role": "IT_STAFF"
      },
      "assignee": {
        "id": 2,
        "name": "Michael Brown",
        "email": "michael.b@example.com",
        "role": "IT_STAFF"
      }
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Unauthenticated.
  - `403 Forbidden`: `{ "error": "You do not have permission to view actions on this ticket", "code": "FORBIDDEN" }`
  - `404 Not Found`: `{ "error": "Ticket not found", "code": "TICKET_NOT_FOUND" }`

---

### 2.3 Update Action Taken
`PATCH /api/actions/:id`

- **Purpose**: Modify an existing Action Taken record or update its status.
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
  ```json
  {
    "description": "Updated intervention notes after secondary check.",
    "result": "System remains stable; user reported no issues.",
    "status": "COMPLETED",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "Updated log file attached.",
    "assigneeId": 2,
    "version": 1
  }
  ```
- **Validation Rules**:
  - `version`: Mandatory integer matching the current record version.
  - `status`: Must be valid `ActionTakenStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - Follow-up validation: If `followUpRequired === true`, `followUpNote` must not be empty.
  - Assignee validation: If `assigneeId` changed, target user must be active IT Staff or Administrator.
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "ticketId": 101,
    "description": "Updated intervention notes after secondary check.",
    "result": "System remains stable; user reported no issues.",
    "status": "COMPLETED",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "Updated log file attached.",
    "performedById": 2,
    "assigneeId": 2,
    "version": 2,
    "updatedAt": "2026-10-15T17:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Missing session.
  - `403 Forbidden`: Requester role.
  - `404 Not Found`: `{ "error": "Action Taken record not found", "code": "ACTION_NOT_FOUND" }`
  - `409 Conflict`:
    ```json
    {
      "error": "The action item was updated by another user. Please refresh and review.",
      "code": "CONCURRENCY_CONFLICT"
    }
    ```

---

## 3. Ticket Status & Workflow Endpoints

### 3.1 Authoritative Status Transition
`PATCH /api/staff/tickets/:id/status`

- **Purpose**: Transition ticket status adhering strictly to the Section 5.1 lifecycle matrix.
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`. (`REQUESTER` receives HTTP 403 Forbidden).
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "version": 1
  }
  ```
- **Validation Rules**:
  - `status`: Mandatory string matching one of the 8 `TicketStatus` enums.
  - `version`: Mandatory integer matching current `ticket.version`.
  - Matrix Evaluation: Evaluates `(currentStatus, targetStatus)` against the permitted transitions:
    - `NEW` $\to$ `OPEN`, `IN_PROGRESS`, `CANCELLED`
    - `OPEN` $\to$ `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED`
    - `IN_PROGRESS` $\to$ `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
    - `WAITING_FOR_REQUESTER` $\to$ `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
    - `RESOLVED` $\to$ `CLOSED`, `REOPENED`
    - `CLOSED` $\to$ `REOPENED`
    - `REOPENED` $\to$ `IN_PROGRESS`
    - `CANCELLED` $\to$ None
- **Response `200 OK`**:
  ```json
  {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "currentStatus": "RESOLVED",
    "version": 2,
    "updatedAt": "2026-10-15T17:15:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`:
    ```json
    {
      "error": "Invalid status transition from NEW to RESOLVED",
      "code": "INVALID_STATUS_TRANSITION"
    }
    ```
  - `403 Forbidden`: User role is `REQUESTER`.
  - `404 Not Found`: Ticket not found.
  - `409 Conflict`:
    ```json
    {
      "error": "The ticket was updated by another session. Please refresh and retry.",
      "code": "CONCURRENCY_CONFLICT"
    }
    ```

---

### 3.2 Advisory Requester Resolution Acknowledgment
`PATCH /api/tickets/:id/resolve-ack`

- **Purpose**: Requester advisory indicator that an issue appears resolved.
- **Authorized Roles**: `REQUESTER` (owned ticket), `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
  ```json
  {
    "isRequesterResolved": true,
    "version": 1
  }
  ```
- **Validation Rules**:
  - `isRequesterResolved`: Mandatory boolean.
  - `version`: Mandatory integer matching current `ticket.version`.
- **Behavior (Resolution Gate Enforcement)**:
  - Updates `ticket.isRequesterResolved` to `true` (or `false`) and increments `ticket.version`.
  - **Does NOT modify `ticket.currentStatus`**. The ticket remains in its active status (`IN_PROGRESS` or `WAITING_FOR_REQUESTER`) until formally verified and updated by IT Staff.
- **Response `200 OK`**:
  ```json
  {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "isRequesterResolved": true,
    "currentStatus": "IN_PROGRESS",
    "version": 2,
    "updatedAt": "2026-10-15T17:20:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Unauthenticated.
  - `403 Forbidden`: Requester does not own this ticket.
  - `404 Not Found`: Ticket not found.
  - `409 Conflict`:
    ```json
    {
      "error": "The ticket was updated by another session. Please refresh and retry.",
      "code": "CONCURRENCY_CONFLICT"
    }
    ```

---

### 3.3 Requester Ticket Cancellation (NEW status only)
`PATCH /api/tickets/:id/cancel`

- **Purpose**: Allow a Requester to withdraw an owned ticket before triage commences.
- **Authorized Roles**: `REQUESTER` (owned ticket in `NEW` status only).
  - *Note*: `IT_STAFF` and `ADMINISTRATOR` execute ticket cancellations across all permitted lifecycle states via the authoritative status transition endpoint `PATCH /api/staff/tickets/:id/status` with payload `{ "status": "CANCELLED", "version": <int> }`.
- **Request Body**:
  ```json
  {
    "version": 1
  }
  ```
- **Validation Rules**:
  - `version`: Mandatory integer matching current `ticket.version`.
- **Behavior**:
  - Validates that `ticket.currentStatus === 'NEW'`. If the ticket has already progressed to `OPEN` or `IN_PROGRESS`, Requester cancellation is rejected.
  - Increments `ticket.version` on transition to `CANCELLED`.
- **Response `200 OK`**:
  ```json
  {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "currentStatus": "CANCELLED",
    "version": 2,
    "updatedAt": "2026-10-15T17:25:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "Cannot cancel ticket once triage or work has commenced", "code": "INVALID_STATUS_TRANSITION" }`
  - `403 Forbidden`: Not ticket owner.
  - `404 Not Found`: Ticket not found.
  - `409 Conflict`:
    ```json
    {
      "error": "The ticket was updated by another session. Please refresh and retry.",
      "code": "CONCURRENCY_CONFLICT"
    }
    ```

---

## 4. Role-Based Dashboard Endpoints (Concise Aggregates)

Dashboard endpoints compute summary metrics on the server from authoritative database records and return concise JSON aggregates. **They do not return full collections of tickets.**

### 4.1 Requester Dashboard
`GET /api/dashboard/requester`

- **Purpose**: Supply authoritative summary counters and the 5 most recent tickets for the authenticated Requester.
- **Authorized Roles**: `REQUESTER` only. (`IT_STAFF` or `ADMINISTRATOR` receive HTTP 403 Forbidden).
- **Query / Calculation Logic**:
  - `totalOpenTickets`: `COUNT(*)` where `requesterId == req.user.id` and `currentStatus IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')`.
  - `ticketsWaitingForRequester`: `COUNT(*)` where `requesterId == req.user.id` and `currentStatus == 'WAITING_FOR_REQUESTER'`.
  - `recentlyResolvedTickets`: `COUNT(*)` where `requesterId == req.user.id`, `currentStatus == 'RESOLVED'`, and `updatedAt >= NOW() - INTERVAL '30 days'`.
  - `myRecentTickets`: Top 5 tickets owned by user sorted by `updatedAt DESC`.
- **Response `200 OK`**:
  ```json
  {
    "metrics": {
      "totalOpenTickets": 2,
      "ticketsWaitingForRequester": 1,
      "recentlyResolvedTickets": 4
    },
    "recentTickets": [
      {
        "id": 101,
        "ticketNumber": "TKT-2026-000101",
        "summary": "VPN connection drops every 10 minutes",
        "currentStatus": "WAITING_FOR_REQUESTER",
        "requestedPriority": "HIGH",
        "updatedAt": "2026-10-15T16:00:00.000Z"
      },
      {
        "id": 98,
        "ticketNumber": "TKT-2026-000098",
        "summary": "Keyboard spacebar sticky",
        "currentStatus": "IN_PROGRESS",
        "requestedPriority": "MEDIUM",
        "updatedAt": "2026-10-14T11:20:00.000Z"
      }
    ]
  }
  ```
- **Zero-State Behavior**:
  - If a requester has zero tickets:
    `metrics: { totalOpenTickets: 0, ticketsWaitingForRequester: 0, recentlyResolvedTickets: 0 }`, `recentTickets: []`.

---

### 4.2 IT Staff & Administrator Dashboard
`GET /api/dashboard/staff`

- **Purpose**: Supply operational queue metrics for IT Staff, plus user account breakdown if requested by an Administrator.
- **Authorized Roles**: `IT_STAFF`, `ADMINISTRATOR`. (Requesters blocked with HTTP 403 Forbidden).
- **Calculation Logic**:
  - `unassignedTickets`: `COUNT(*)` where `assignedStaffId IS NULL` and `currentStatus IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')`.
  - `myAssignedTickets`: `COUNT(*)` where `assignedStaffId == req.user.id` and `currentStatus NOT IN ('CLOSED', 'CANCELLED')`.
  - `urgentTicketsCount`: `COUNT(*)` where `itPriority == 'URGENT'` and `currentStatus NOT IN ('CLOSED', 'CANCELLED')`.
  - `waitingForRequesterCount`: `COUNT(*)` where `currentStatus == 'WAITING_FOR_REQUESTER'`.
  - `ticketsByStatus`: Aggregated counts grouped by `currentStatus` for all 8 statuses.
  - `ticketsByPriority`: Aggregated counts of open tickets grouped by `itPriority`.
  - `recentQueueTickets`: Top 5 tickets updated across the helpdesk.
  - `adminUserSummary`: Included **only** if `req.user.role === 'ADMINISTRATOR'`:
    - `totalUsers`: Total rows in `User`.
    - `activeUsers`: Count of users where `isActive == true`.
    - `usersByRole`: Breakdown counts for `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- **Response `200 OK` (when invoked by `ADMINISTRATOR`)**:
  ```json
  {
    "metrics": {
      "unassignedTickets": 5,
      "myAssignedTickets": 3,
      "urgentTicketsCount": 2,
      "waitingForRequesterCount": 4,
      "ticketsByStatus": {
        "NEW": 4,
        "OPEN": 3,
        "IN_PROGRESS": 6,
        "WAITING_FOR_REQUESTER": 4,
        "RESOLVED": 10,
        "CLOSED": 15,
        "REOPENED": 1,
        "CANCELLED": 2
      },
      "ticketsByPriority": {
        "LOW": 3,
        "MEDIUM": 8,
        "HIGH": 4,
        "URGENT": 2
      }
    },
    "recentQueueTickets": [
      {
        "id": 110,
        "ticketNumber": "TKT-2026-000110",
        "summary": "Office printer paper jam",
        "currentStatus": "NEW",
        "itPriority": "LOW",
        "assignedStaffName": null,
        "updatedAt": "2026-10-15T17:25:00.000Z"
      }
    ],
    "adminUserSummary": {
      "totalUsers": 18,
      "activeUsers": 17,
      "usersByRole": {
        "REQUESTER": 10,
        "IT_STAFF": 6,
        "ADMINISTRATOR": 2
      }
    }
  }
  ```
- **Response `200 OK` (when invoked by `IT_STAFF`)**:
  - Same as above, but `adminUserSummary` is strictly `null` or omitted from the response.

---

## 5. Preserved Regression Endpoints (Labs 1–3 Continuity)

All existing endpoints established in Labs 1, 2, and 3 continue to function with exact backward compatibility:

| Endpoint | Method | Role | Description |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | Public | System status, database connectivity verification. |
| `/api/categories` | `GET` | Public | Active ticket categories. |
| `/api/related-systems` | `GET` | Public | Systems mapped to a category (`?categoryId=`). |
| `/api/auth/login` | `POST` | Public | Credentials authentication, rate-limited, sets cookie. |
| `/api/auth/logout` | `POST` | Authenticated | Clears `toktickit_session` cookie. |
| `/api/auth/me` | `GET` | Authenticated | Current user profile and permissions. |
| `/api/auth/change-password` | `POST` | Authenticated | Updates password and resets `mustChangePassword`. |
| `/api/tickets` | `POST` | Requester | Submits new ticket under session requester. |
| `/api/tickets` | `GET` | Requester | Paginated tickets owned by requester with priority sort. |
| `/api/tickets/:id` | `GET` | Requester | Detailed ticket view (read-only for owner). |
| `/api/staff/tickets` | `GET` | Staff / Admin | Paginated IT Staff queue with keyword and role filters. |
| `/api/staff/tickets/:id` | `GET` | Staff / Admin | Detailed operational ticket view. |
| `/api/staff/tickets/:id/assign` | `PATCH` | Staff / Admin | Sets or clears `assignedStaffId`. Supports `version`. |
| `/api/staff/tickets/:id/priority` | `PATCH` | Staff / Admin | Updates `itPriority`. Supports `version`. |
| `/api/tickets/:id/comments` | `GET/POST`| All permitted | Public message stream (triggers auto-transition if waiting). |
| `/api/tickets/:id/notes` | `GET/POST`| Staff / Admin | Confidential internal notes (amber container, forbidden to Requesters). |
| `/api/tickets/:id/attachments` | `POST` | Permitted owner | Uploads attachment (5 active file maximum limit). |
| `/api/attachments/:id/download`| `GET` | Permitted owner | Downloads file. Returns **410 Gone** if soft-removed. |
| `/api/attachments/:id` | `DELETE`| Permitted owner | Soft-removes attachment with mandatory reason text. |
| `/api/admin/users` | `GET/POST`| Admin only | User administration and creation with initial password. |
| `/api/admin/users/:id` | `PATCH` | Admin only | Updates user role/active state (safety blocks self-deactivation). |
| `/api/admin/users/:id/reset-password` | `POST` | Admin only | Resets initial password enforcing `mustChangePassword`. |
