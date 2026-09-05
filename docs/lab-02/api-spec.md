# Lab 2 REST API Specification Contract

## 1. Overview & General Conventions

This document specifies the REST API contract for Sprint 2 (Lab 2) of the TokTickIT Requester-facing application.

- **Base URL**: `/api`
- **Simulated Authentication Header**: All Requester-scoped API requests must include the HTTP header:
  `x-requester-id: <number>`
  Requests missing this header or providing an invalid/inactive Requester ID shall be rejected with HTTP 400 Bad Request or 403 Forbidden.
- **Content-Type**: `application/json` (except file uploads which use `multipart/form-data`).

---

## 2. Endpoints Summary Table

| Method | Endpoint | Description | Auth Header Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/requesters` | Retrieve active Development Requesters | No |
| `GET` | `/api/categories` | Retrieve active Ticket Categories | No |
| `GET` | `/api/related-systems` | Retrieve active Related Systems | No |
| `POST` | `/api/tickets` | Create a new ticket | Yes |
| `GET` | `/api/tickets` | List tickets owned by current Requester (with search/filter/sort/pagination) | Yes |
| `GET` | `/api/tickets/:id` | Retrieve owned ticket details | Yes |
| `POST` | `/api/tickets/:id/attachments` | Upload an attachment file | Yes |
| `GET` | `/api/attachments/:id` | Retrieve single attachment metadata | Yes |
| `GET` | `/api/attachments/:id/download` | Download an active attachment file | Yes |
| `DELETE` | `/api/attachments/:id` | Soft-remove an attachment with reason | Yes |

---

## 3. Detailed Endpoint Contracts

### 3.1 GET /api/requesters
Retrieve all active Development Requesters available for selection in the simulated login screen.

- **Headers**: None required
- **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Jennifer Anderson",
    "email": "jennifer.a@example.com",
    "department": "Human Resources",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Michael Brown",
    "email": "michael.b@example.com",
    "department": "Finance",
    "isActive": true
  },
  {
    "id": 3,
    "name": "Sarah Johnson",
    "email": "sarah.j@example.com",
    "department": "Marketing",
    "isActive": true
  },
  {
    "id": 4,
    "name": "David Lee",
    "email": "david.l@example.com",
    "department": "Engineering",
    "isActive": true
  }
]
```

---

### 3.2 GET /api/categories
Retrieve active ticket categories.

- **Success Response (200 OK)**:
```json
[
  { "id": 1, "name": "Account and Access", "description": "Login, password, and permission requests", "isActive": true },
  { "id": 2, "name": "Hardware", "description": "Laptop, monitor, printer, and peripheral issues", "isActive": true },
  { "id": 3, "name": "Software", "description": "Application crashes, installation, and license issues", "isActive": true },
  { "id": 4, "name": "Network", "description": "Wi-Fi, VPN, and connectivity problems", "isActive": true }
]
```

---

### 3.3 GET /api/related-systems
Retrieve active related systems.

- **Success Response (200 OK)**:
```json
[
  { "id": 1, "name": "Email", "categoryId": 1, "isActive": true },
  { "id": 2, "name": "Corporate Laptop", "categoryId": 2, "isActive": true },
  { "id": 3, "name": "Printer", "categoryId": 2, "isActive": true },
  { "id": 4, "name": "LEB2 App", "categoryId": 3, "isActive": true },
  { "id": 5, "name": "Grade Submission App", "categoryId": 3, "isActive": true },
  { "id": 6, "name": "Campus Wi-Fi", "categoryId": 4, "isActive": true },
  { "id": 7, "name": "VPN Service", "categoryId": 4, "isActive": true }
]
```

---

### 3.4 POST /api/tickets
Create a new support ticket for the selected Requester.

- **Headers**:
  `x-requester-id: 1`
- **Request Body**:
```json
{
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when the system is idle.",
  "categoryId": 2,
  "relatedSystemId": 2,
  "requestedPriority": "MEDIUM"
}
```
- **Success Response (201 Created)**:
```json
{
  "id": 12,
  "ticketNumber": "TKT-2026-000012",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when the system is idle.",
  "requestedPriority": "MEDIUM",
  "currentStatus": "NEW",
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 2,
  "createdAt": "2026-09-01T10:15:00.000Z",
  "updatedAt": "2026-09-01T10:15:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (missing required fields, summary length < 5 or > 100, description length < 10 or > 1000, invalid priority enum).
  - `400 Bad Request`: Missing `x-requester-id` header.

---

### 3.5 GET /api/tickets
Query tickets owned exclusively by the currently selected Requester.

- **Headers**:
  `x-requester-id: 1`
- **Query Parameters**:
  - `search` (optional string): Keyword matching `ticketNumber`, `summary`, or `description`.
  - `categoryId` (optional number): Filter by Category ID.
  - `priority` (optional enum): `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `status` (optional enum): `NEW`.
  - `sort` (optional string): `createdAt_desc` (default), `createdAt_asc`, `priority_desc`.
  - `page` (optional number): Page index (default: 1).
  - `limit` (optional number): Page size (default: 10, max: 50).

#### Invalid Query Parameter Behavior (§6.1)
- If `page` < 1 or invalid string, system sanitizes value to default `page = 1`.
- If `limit` < 1 or > 50, system sanitizes value to bounds (`limit = 10` or capped at 50).
- If `sort` is invalid or omitted, system defaults to `createdAt DESC`.
- Invalid filter parameters that produce no database matches safely return HTTP 200 OK with an empty array `data: []` and `totalItems: 0`.

- **Success Response (200 OK)**:
```json
{
  "tickets": [
    {
      "id": 12,
      "ticketNumber": "TKT-2026-000012",
      "summary": "Laptop battery drains quickly",
      "requestedPriority": "MEDIUM",
      "currentStatus": "NEW",
      "createdAt": "2026-09-01T10:15:00.000Z",
      "updatedAt": "2026-09-01T10:15:00.000Z",
      "category": { "id": 2, "name": "Hardware" },
      "relatedSystem": { "id": 2, "name": "Corporate Laptop" }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3.6 GET /api/tickets/:id
Retrieve detailed information for a single owned ticket.

- **Headers**:
  `x-requester-id: 1`
- **Success Response (200 OK)**:
```json
{
  "id": 12,
  "ticketNumber": "TKT-2026-000012",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when the system is idle.",
  "requestedPriority": "MEDIUM",
  "currentStatus": "NEW",
  "requesterId": 1,
  "requester": { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.a@example.com" },
  "category": { "id": 2, "name": "Hardware" },
  "relatedSystem": { "id": 2, "name": "Corporate Laptop" },
  "attachments": [
    {
      "id": 5,
      "filename": "battery_diagnostic.pdf",
      "originalName": "battery_diagnostic.pdf",
      "mimeType": "application/pdf",
      "size": 1048576,
      "isRemoved": false,
      "createdAt": "2026-09-01T10:16:00.000Z"
    }
  ],
  "createdAt": "2026-09-01T10:15:00.000Z",
  "updatedAt": "2026-09-01T10:16:00.000Z"
}
```
- **Error Responses**:
  - `403 Forbidden`: Requester does not own the requested ticket.
  - `404 Not Found`: Ticket ID does not exist.

---

### 3.7 POST /api/tickets/:id/attachments
Upload a permitted attachment to an existing ticket owned by the Requester.

- **Headers**:
  `x-requester-id: 1`
  `Content-Type: multipart/form-data`
- **Form Data**:
  - `file`: Binary file data.
- **Success Response (201 Created)**:
```json
{
  "id": 5,
  "ticketId": 12,
  "filename": "battery_diagnostic.pdf",
  "originalName": "battery_diagnostic.pdf",
  "mimeType": "application/pdf",
  "size": 1048576,
  "isRemoved": false,
  "createdAt": "2026-09-01T10:16:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid file type (only JPG, PNG, WEBP, PDF allowed).
  - `400 Bad Request`: File size exceeds 5 MB (5,242,880 bytes).
  - `400 Bad Request`: Maximum active attachments limit (5 per ticket) reached.
  - `403 Forbidden`: Requester does not own the target ticket.

---

### 3.8 GET /api/attachments/:id
Retrieve metadata for a single attachment on an owned ticket.

- **Headers**:
  `x-requester-id: 1`
- **Success Response (200 OK)**:
```json
{
  "id": 5,
  "ticketId": 12,
  "filename": "battery_diagnostic.pdf",
  "originalName": "battery_diagnostic.pdf",
  "mimeType": "application/pdf",
  "size": 1048576,
  "isRemoved": false,
  "createdAt": "2026-09-01T10:16:00.000Z"
}
```
- **Error Responses**:
  - `403 Forbidden`: Requester does not own the ticket associated with this attachment.
  - `404 Not Found`: Attachment ID does not exist.

---

### 3.9 GET /api/attachments/:id/download
Download an active attachment file.

- **Headers**:
  `x-requester-id: 1`
- **Success Response (200 OK)**:
  - Binary file stream with `Content-Type` matching attachment `mimeType` and `Content-Disposition: attachment; filename="..."`.
- **Error Responses**:
  - `410 Gone`: Attachment has been soft-removed.
  - `403 Forbidden`: Requester does not own the ticket associated with this attachment.
  - `404 Not Found`: Attachment ID does not exist.

---

### 3.10 DELETE /api/attachments/:id
Soft-remove an attachment with mandatory reason input.

- **Headers**:
  `x-requester-id: 1`
- **Request Body**:
```json
{
  "reason": "Uploaded incorrect log file by mistake"
}
```
- **Success Response (200 OK)**:
```json
{
  "id": 5,
  "ticketId": 12,
  "filename": "battery_diagnostic.pdf",
  "isRemoved": true,
  "removedReason": "Uploaded incorrect log file by mistake",
  "removedAt": "2026-09-01T10:20:00.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid removal reason (reason length < 5 characters).
  - `403 Forbidden`: Requester does not own the ticket associated with this attachment.

---

## 4. HTTP Status Code Conventions

| Status Code | Meaning | Use Case |
| :--- | :--- | :--- |
| `200 OK` | Success | Successful data retrieval, query, update, or soft removal. |
| `201 Created` | Created | Successful resource creation (Ticket, Attachment). |
| `400 Bad Request` | Client Error | Validation error, missing required header, invalid payload format. |
| `403 Forbidden` | Access Denied | Requester attempted to access or modify resources owned by another Requester. |
| `404 Not Found` | Not Found | Requested Ticket ID or Attachment ID does not exist. |
| `410 Gone` | Resource Removed | Download requested for a soft-removed attachment. |
| `500 Internal Server Error` | Server Failure | Unexpected server/database failure. |
