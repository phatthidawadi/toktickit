# Lab 3 REST API Specification & Contract

## 1. Authentication & Security Architecture

### Session Cookie & JWT Expiration Mechanism
- Authentication uses a signed JWT token stored in an **HTTP-only, SameSite=Strict** cookie named `toktickit_session`.
- The client does NOT pass manual auth headers (`Authorization` or `x-requester-id`). The server automatically extracts and validates the session cookie on protected requests.
- **JWT Expiration Duration**: Tokens expire in **8 hours** (28,800 seconds) from issuance (`expiresIn: "8h"`). The cookie header sets `Max-Age=28800`.
- **Logout Behavior**:
  - **Client-side**: On `POST /api/auth/logout`, the server sends a response header clearing the cookie (`Set-Cookie: toktickit_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict; Max-Age=0`).
  - **Server-side**: Returns HTTP 200 OK with `{ "message": "Successfully logged out" }`. Stateless token validation rejects subsequent requests without cookie as HTTP 401 Unauthorized.

### Password Security & Hashing
- Passwords are hashed using `bcrypt` (salt rounds = 10). Plaintext passwords are never logged, returned in API responses, or stored in the database.

### Standard Error Response Shape
All error responses adhere to a consistent JSON format:
```json
{
  "error": "Detailed error message explaining the failure",
  "code": "ERROR_CODE_IDENTIFIER"
}
```

---

## 2. API Endpoints

### 2.1 Authentication Endpoints

#### `POST /api/auth/login`
- **Description**: Authenticate user credentials and establish session.
- **Access**: Public.
- **Request Body**:
```json
{
  "email": "jennifer.a@example.com",
  "password": "Password123!"
}
```
- **Responses**:
  - `200 OK`: Sets `toktickit_session` cookie (`Max-Age=28800`, `HttpOnly`, `SameSite=Strict`). Returns authenticated user object.
```json
{
  "user": {
    "id": 1,
    "name": "Jennifer Anderson",
    "email": "jennifer.a@example.com",
    "role": "REQUESTER",
    "isActive": true,
    "mustChangePassword": true
  }
}
```
  - `401 Unauthorized`: Invalid credentials or inactive account (`isActive = false`).
```json
{ "error": "Invalid email or password", "code": "INVALID_CREDENTIALS" }
```

#### `POST /api/auth/logout`
- **Description**: Invalidate current session and clear authentication cookie.
- **Access**: Authenticated.
- **Responses**:
  - `200 OK`: Sends `Set-Cookie` header clearing `toktickit_session` (`Max-Age=0`).
```json
{ "message": "Successfully logged out" }
```

#### `GET /api/auth/me`
- **Description**: Retrieve profile and role of currently authenticated user.
- **Access**: Authenticated.
- **Responses**:
  - `200 OK`: Returns authenticated user details.
  - `401 Unauthorized`: No active session cookie found.

#### `POST /api/auth/change-password`
- **Description**: Update user password. Mandatory for users with `mustChangePassword = true`.
- **Access**: Authenticated.
- **Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```
- **Responses**:
  - `200 OK`: Updates password hash, sets `mustChangePassword = false`.
```json
{ "message": "Password updated successfully" }
```
  - `400 Bad Request`: Validation failure (min 8 chars, uppercase, lowercase, number required, or identical to current password).

---

### 2.2 IT Staff Ticket Queue & Workflow Endpoints

#### `GET /api/staff/tickets`
- **Description**: Retrieve paginated IT Staff Ticket Queue.
- **Access**: `IT_STAFF`, `ADMINISTRATOR`.
- **Query Parameters**:
  - `search` (string): Keyword matching ticket number, summary, description.
  - `categoryId` (number): Filter by Category ID.
  - `status` (string): Filter by ticket status.
  - `requestedPriority` (string): Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `itPriority` (string): Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `assignedStaffId` (string/number): `unassigned` (null), `me` (current staff ID), or specific User ID.
  - `sort` (string): `createdAt_desc` (default), `createdAt_asc`, `priority_desc`.
  - `page` (number, default 1), `limit` (number, default 10, max 50).
- **Responses**:
  - `200 OK`: Returns paginated tickets with total metrics.
  - `403 Forbidden`: User role is `REQUESTER`.

#### `GET /api/staff/tickets/:id`
- **Description**: Retrieve detailed ticket view for Staff/Admin operational review.
- **Access**: `IT_STAFF`, `ADMINISTRATOR`.
- **Responses**:
  - `200 OK`: Returns full ticket, requester details, assigned staff details, attachments, comments, and notes.
  - `403 Forbidden`: User role is `REQUESTER`.
  - `404 Not Found`: Ticket ID does not exist.

#### `PATCH /api/staff/tickets/:id/assign`
- **Description**: Claim or reassign ticket ownership.
- **Access**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
```json
{
  "assignedStaffId": 5
}
```
*(Note: Pass `assignedStaffId: null` or user ID. Passing `{ "claim": true }` assigns to current user).*
- **Responses**:
  - `200 OK`: Returns updated ticket.
  - `400 Bad Request`: Target assigned user is inactive or not an IT Staff/Admin.

#### `PATCH /api/staff/tickets/:id/priority`
- **Description**: Update IT Priority (`itPriority`).
- **Access**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
```json
{
  "itPriority": "HIGH"
}
```
- **Responses**:
  - `200 OK`: Returns updated ticket.

#### `PATCH /api/staff/tickets/:id/status`
- **Description**: Transition ticket status adhering to BR-10 status matrix.
- **Access**: `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```
- **Responses**:
  - `200 OK`: Returns updated ticket.
  - `400 Bad Request`: Transition is invalid according to BR-10 status transition matrix.

---

### 2.3 Comments & Internal Notes Endpoints

#### `GET /api/tickets/:id/comments`
- **Description**: Fetch Public Comments for a ticket.
- **Access**: Ticket Owner (`REQUESTER`), `IT_STAFF`, `ADMINISTRATOR`.
- **Responses**:
  - `200 OK`: Returns array of Public Comments with author profile.
  - `403 Forbidden`: Requester accessing another user's ticket.

#### `POST /api/tickets/:id/comments`
- **Description**: Post a Public Comment on a ticket.
- **Access**: Ticket Owner (`REQUESTER`), `IT_STAFF`, `ADMINISTRATOR`.
- **Request Body**:
```json
{
  "content": "Thank you for the update. The issue has improved."
}
```
- **Responses**:
  - `201 Created`: Returns created `TicketComment`.
  - `400 Bad Request`: Content is empty or exceeds 1000 characters.

#### `GET /api/tickets/:id/notes`
- **Description**: Fetch confidential Internal Notes for a ticket.
- **Access**: `IT_STAFF`, `ADMINISTRATOR` ONLY.
- **Responses**:
  - `200 OK`: Returns array of `TicketInternalNote`.
  - `403 Forbidden`: User role is `REQUESTER` (strictly blocked without leaking note content).

#### `POST /api/tickets/:id/notes`
- **Description**: Post a private Internal Note on a ticket.
- **Access**: `IT_STAFF`, `ADMINISTRATOR` ONLY.
- **Request Body**:
```json
{
  "content": "Replaced network interface card on switch port 4B."
}
```
- **Responses**:
  - `201 Created`: Returns created `TicketInternalNote`.
  - `403 Forbidden`: User role is `REQUESTER`.

---

### 2.4 Requester Specific Endpoints

#### `PATCH /api/tickets/:id/resolve-ack`
- **Description**: Requester indicates "Problem Appears Resolved". Sets `isRequesterResolved = true`.
- **Access**: Ticket Owner (`REQUESTER`).
- **Responses**:
  - `200 OK`: Returns updated ticket with `isRequesterResolved = true`.
  - `403 Forbidden`: Accessing another user's ticket.

---

### 2.5 Administrator User Management Endpoints

#### `GET /api/admin/users`
- **Description**: List all user accounts with search and role filter.
- **Access**: `ADMINISTRATOR` ONLY.
- **Query Parameters**:
  - `search` (string): Search name or email.
  - `role` (string): Filter by `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- **Responses**:
  - `200 OK`: Returns array of user objects.
  - `403 Forbidden`: Non-Administrator user.

#### `POST /api/admin/users`
- **Description**: Create a new user account with initial password.
- **Access**: `ADMINISTRATOR` ONLY.
- **Request Body**:
```json
{
  "name": "Alexander Vance",
  "email": "alex.v@example.com",
  "role": "IT_STAFF",
  "isActive": true,
  "initialPassword": "Password123!"
}
```
- **Responses**:
  - `201 Created`: Returns created user object (`mustChangePassword = true`).
  - `409 Conflict`: Email address already exists.
  - `400 Bad Request`: Validation failure.

#### `PATCH /api/admin/users/:id`
- **Description**: Update existing user basic details, role, or activation status.
- **Access**: `ADMINISTRATOR` ONLY.
- **Request Body**:
```json
{
  "name": "Alexander Vance Updated",
  "role": "IT_STAFF",
  "isActive": false
}
```
- **Responses**:
  - `200 OK`: Returns updated user object.
  - `400 Bad Request`: Admin attempting to deactivate own account or deactivating the last active Admin.

#### `POST /api/admin/users/:id/reset-password`
- **Description**: Reset user initial password, requiring password change on next login.
- **Access**: `ADMINISTRATOR` ONLY.
- **Request Body**:
```json
{
  "initialPassword": "NewInitialPassword123!"
}
```
- **Responses**:
  - `200 OK`: Resets password hash, sets `mustChangePassword = true`.
