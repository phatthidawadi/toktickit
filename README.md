# TokTickIT - Enterprise IT Service Desk Application

TokTickIT is a full-stack IT Service Desk application designed to streamline organizational IT support workflows, including Account & Access, Hardware, Software, and Network service requests. The application has evolved across four major engineering sprints (Lab 1, Lab 2, Lab 3, and Lab 4) into a production-grade, multi-role enterprise system.

---

## Evolution & Feature Increments Across Labs

### Lab 1 — System Foundation & Category Services
- **Backend Architecture**: Node.js, Express, TypeScript, and Prisma ORM setup.
- **Health Check & Core APIs**: System health endpoint (`GET /api/health`) and Category listing (`GET /api/categories`).
- **Database Initial Seed**: Baseline category seeding for Account, Hardware, Software, and Network requests.

### Lab 2 — Ticket & Attachment Lifecycle Management
- **Ticket Core Workflows**: Ticket creation (`POST /api/tickets`), ticket number generation (`TKT-YYYY-XXXXXX`), requester ticket listing (`GET /api/tickets`), and read-only detail view (`GET /api/tickets/:id`).
- **Attachment Lifecycle**: File upload processing (`POST /api/tickets/:id/attachments`), active attachment streaming (`GET /api/attachments/:id/download`), and soft removal with mandatory reason tracking (`DELETE /api/attachments/:id`).
- **Development Requester Selector**: Temporary client-side selector supporting identity context during early development.

### Lab 3 — Multi-Role Access Control, Admin Portal & Operational Workflows
- **Authentication & Session Security**: HTTP-only JWT cookie authentication (`toktickit_session`), password hashing with `bcrypt`, user context API (`GET /api/auth/me`), session invalidation logout (`POST /api/auth/logout`), and mandatory first-login password change workflow (`POST /api/auth/change-password`).
- **Server-Side Role-Based Authorization (RBAC)**: Strict role enforcement across three roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`) via `requireRole` and `checkPasswordChangeState` middleware, blocking unauthorized access with safe HTTP 401 / 403 responses.
- **Database Schema Evolution & User Migration**: Prisma DDL migration (`20260914000000_init_lab3`) consolidating scaffold `RequesterUser` accounts into a unified `User` model, preserving foreign key relations with zero data loss.
- **IT Staff Operational Queue & Ticket Workflow**: Ticket Queue with keyword search, multi-criteria filtering, sorting, pagination, ownership claim/reassignment, independent IT Priority editing (`itPriority`), permitted status transition matrix enforcement (BR-10), Public Comments stream, and confidential Internal Notes stream (`#FEF3C7`).
- **Administrator User Management Portal**: User management interface (`/admin/users`) with search, role filters, user creation, account editing, initial password resets, and safety protections against self-deactivation and last-admin deactivation.
### Lab 4 — Actions Taken, Dashboards, and Final Hardening
- **Actions Taken Subsystem**: Chronological tracking of IT troubleshooting activities (`POST /api/tickets/:id/actions`, `GET /api/tickets/:id/actions`, `PATCH /api/actions/:id`), follow-up required validation, inactive assignee guard, and optimistic concurrency version tracking.
- **Ticket Resolution Lifecycle & Advisory Gate**: Requester "Problem Appears Resolved" toggle (`PATCH /api/tickets/:id/resolve-ack`), advisory callout banner guiding staff resolution, strict transition matrix enforcement (`NEW -> RESOLVED` forbidden), and auto-transition to `IN_PROGRESS` on requester public comment.
- **Role-Based Operational Dashboards**: Authoritative server-side aggregated metrics for Requesters (`/api/dashboard/requester`) and IT Staff/Admin (`/api/dashboard/staff`), interactive metric card drill-downs, and Administrator user account summaries.
- **Accessibility & Design Hardening**: Full Zen Green visual system audit (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`), visible keyboard focus rings (`focus:ring-2 focus:ring-emerald-500`), semantic ARIA dialog roles on modals, and >= 44px mobile touch targets.
- **End-to-End Automated Testing**: Comprehensive Playwright journeys covering Actions Taken logging, resolution workflows, and dashboards across Desktop, Tablet, and Mobile viewports.

---

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Custom Zen Green Design System / TailwindCSS
- **Backend**: Node.js + Express + TypeScript + JWT Cookies + Bcrypt
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Testing**:
  - Unit & REST API Integration: Vitest & Supertest
  - UI Component & Style: Vitest & React Testing Library
  - End-to-End Automation: Playwright (Chromium, Tablet, Mobile)

---

## Setup & Local Development Guide

### 1. Prerequisites
Ensure the following tools are installed on your environment:
- **Git** (v2.30 or higher)
- **Node.js** (v18.0.0 or higher)
- **PostgreSQL** (running locally on port `5432`)

### 2. Clone Repository & Install Dependencies

```bash
# Clone repository
git clone https://github.com/phatthidawadi/toktickit.git
cd toktickit

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables Setup

Create `.env` configuration files in both `server` and `client` directories.

**Backend Configuration (`server/.env`):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/toktickit?schema=public"
JWT_SECRET="toktickit_super_secret_jwt_key_2026"
PORT=3000
NODE_ENV="development"
```

**Frontend Configuration (`client/.env`):**
```env
VITE_API_URL="http://localhost:3000"
```

---

## Database Migration & Initial Seeding

Ensure your PostgreSQL service is running, then execute Prisma migrations and seed initial data:

```bash
cd server

# Apply database migrations for Lab 4 schema
npx prisma migrate deploy

# Seed database with categories, related systems, users, tickets, and actions taken
npx prisma db seed
```

### Pre-configured Seed Credentials

All seeded accounts start with `mustChangePassword = true` and initial password `Password123!`:

| User Role | Email Address | Initial Password | Default Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin.toktickit@example.com` | `Password123!` | Full user management, ticket oversight, internal notes |
| **IT Staff** | `staff.somchai@example.com` | `Password123!` | Ticket queue, claim/reassign, IT priority, status transitions, internal notes |
| **IT Staff** | `staff.somsri@example.com` | `Password123!` | Ticket queue, claim/reassign, IT priority, status transitions, internal notes |
| **IT Staff** | `staff.wichai@example.com` | `Password123!` | Ticket queue, claim/reassign, IT priority, status transitions, internal notes |
| **Requester** | `jennifer.a@example.com` | `Password123!` | Create tickets, view owned tickets/attachments, public comments, resolve toggle |
| **Requester** | `michael.b@example.com` | `Password123!` | Create tickets, view owned tickets/attachments, public comments, resolve toggle |

---

## Running the Application

Start both backend and frontend development servers in separate terminal windows:

### 1. Start Backend Server
```bash
cd server
npm run dev
# Server listening at http://localhost:3000
```

### 2. Start Frontend Application
```bash
cd client
npm run dev
# Web application available at http://localhost:5173
```

---

## Running Automated Test Suites

The codebase includes complete automated test coverage across all layers.

### 1. Server Unit & REST API Integration Tests
```bash
cd server
npm test
# Executes 115 tests across 22 test files (100% Pass)
```

### 2. Client UI Component, Style & Responsive Tests
```bash
cd client
npm test
# Executes 52 component and style tests across 22 test files (100% Pass)
```

### 3. Client Production Build Verification
```bash
cd client
npm run build
# Compiles TypeScript and builds Vite bundle (0 errors)
```

### 4. Playwright End-to-End Tests
```bash
# Run from repository root
npm run test:e2e
# Executes 24 E2E tests across Desktop, Tablet, and Mobile viewports (100% Pass)
```