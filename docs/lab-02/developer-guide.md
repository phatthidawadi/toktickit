# Sprint 2 Developer Guide and Architecture Documentation

## 1. Executive Summary & Architecture Overview

The TokTickIT Requester Portal (Sprint 2 / Lab 2) is designed as a modern 3-tier web application for IT Service Desk ticket management. The architecture enforces strict Requester data isolation, spec-compliant field validation, and complete file attachment lifecycle management.

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|  React 18 + TypeScript + Vite + Zen Green Theme (#006B3C)              |
|  - RequesterContext (LocalStorage persistence: toktickit_selected_...) |
|  - RequesterSelectorScreen (Simulated Auth Modal)                     |
|  - CreateTicketForm (Validation rules BR-06)                          |
|  - MyTicketsView (Table & Mobile Cards AC-08)                         |
|  - TicketDetailView (Read-Only 5.4 & Soft Removal Modal AC-06)        |
+-----------------------------------++----------------------------------+
                                    || HTTP / REST API (Header: x-requester-id)
                                    \/
+-----------------------------------------------------------------------+
|                           SERVER LAYER                                |
|  Node.js + Express 4 + TypeScript + Multer Middleware                 |
|  - GET /api/requesters (Active user context list)                     |
|  - GET /api/categories & GET /api/related-systems                     |
|  - POST /api/tickets (TKT-YYYY-XXXXXX Sequence generator)             |
|  - GET /api/tickets & GET /api/tickets/:id (403 Forbidden owner check) |
|  - POST /api/tickets/:id/attachments (5MB limit & .exe block AC-04)   |
|  - GET /api/attachments/:id/download (410 Gone for soft-removed)      |
|  - DELETE /api/attachments/:id (Soft removal with reason BR-07)       |
+-----------------------------------++----------------------------------+
                                    || Prisma ORM 5
                                    \/
+-----------------------------------------------------------------------+
|                          DATABASE LAYER                               |
|  PostgreSQL Database ("toktickit")                                    |
|  - RequesterUser (id, name, email, department, isActive)              |
|  - Category (id, name, description, isActive)                         |
|  - RelatedSystem (id, name, description, categoryId, isActive)        |
|  - Ticket (id, ticketNumber, summary, description, priority, status)  |
|  - Attachment (id, ticketId, filename, isRemoved, removedReason)      |
+-----------------------------------------------------------------------+
```

---

## 2. Key Technical Subsystems & Data Lifecycle

### 2.1 Ticket Number Sequence Generator (`server/src/utils/ticketNumber.ts`)
- **Format**: `TKT-YYYY-XXXXXX`
- **Rules**:
  - `YYYY`: 4-digit current calendar year.
  - `XXXXXX`: 6-digit zero-padded sequential number based on the highest existing ticket ID (`lastTicket.id + 1`).
  - Example: `TKT-2026-000001`, `TKT-2026-000101`.

### 2.2 Requester Context & Data Isolation
- **Context Switcher**: `RequesterContext.tsx` stores selected user in `localStorage` under key `toktickit_selected_requester`.
- **API Header**: Every request attaches `x-requester-id: <id>`.
- **Ownership Verification**: Backend validates `ticket.requesterId === headerRequesterId`. Returns `HTTP 403 Forbidden` if user attempts to view or modify tickets owned by another Requester.

### 2.3 Attachment Lifecycle Management
- **File Upload (`POST /api/tickets/:id/attachments`)**:
  - Max File Size: **5MB** (`5 * 1024 * 1024` bytes, HTTP 400 on exceed).
  - Executable Extension Block: Disallows `.exe`, `.bat`, `.cmd`, `.sh` (HTTP 400 on upload attempt).
- **Soft Removal (`DELETE /api/attachments/:id`)**:
  - Requires `reason` string (minimum 5 characters).
  - Sets `isRemoved = true`, records `removedReason` and `removedAt`.
- **Download Streaming (`GET /api/attachments/:id/download`)**:
  - If `isRemoved === true`, returns **HTTP 410 Gone** with error payload `{ "error": "Attachment has been removed" }`.

---

## 3. Developer Environment Setup & Commands

### 3.1 Prerequisites
- Node.js >= 18.x
- PostgreSQL Database server running on `localhost:5432` with database `toktickit`.

### 3.2 Database Setup & Seeding
From the `server` directory:
```bash
# Push Prisma Schema to PostgreSQL
npx prisma db push

# Run Idempotent Seed Script
npm run prisma:seed

# Inspect Database Tables via Prisma Studio Interface
npx prisma studio
```

### 3.3 Launching Development Servers
```bash
# Start Backend Express API (Port 3000)
npm run dev --prefix server

# Start Frontend React Vite App (Port 5173)
npm run dev --prefix client
```

---

## 4. Test Suite Architecture & Execution

The test suite covers 4 layers across 15 test files with 25 test cases (100% pass rate):

| Layer | Framework | Target Scope | Command |
| :--- | :--- | :--- | :--- |
| **Server Unit Tests** | Vitest | `generateTicketNumber` formatting & sequence | `npm test --prefix server` |
| **Server API Integration** | Vitest + Supertest | REST endpoints, 403 Forbidden, 410 Gone, 400 Bad Request | `npm test --prefix server` |
| **Client UI Components** | Vitest + RTL | Zen Green UI screens, forms, status badges, modals | `npm test --prefix client` |
| **E2E User Journey** | Vitest + RTL | Full simulated flow from selector to ticket submission & detail view | `npm test --prefix client` |
