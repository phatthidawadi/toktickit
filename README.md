# TokTickIT - Enterprise IT Service Desk Application

TokTickIT is a full-stack IT Service Desk application designed to streamline organizational IT support workflows, including Account & Access, Hardware, Software, and Network service requests. The application has evolved across three major engineering sprints (Lab 1, Lab 2, and Lab 3) into a production-grade, multi-role enterprise system.

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
- **Zen Green Design System & Responsive Layouts**: Unified visual design tokens, role badges, interactive focus outlines, touch target standards (>= 44px), and responsive viewport adaptations across Desktop (>= 992px), Tablet (768px - 991px), and Mobile (< 768px).
- **Automated Test Architecture**: 100% test coverage across 8 layers including Unit, REST API Integration, UI Components, UI Style, Responsive, Security/Auth, Migration/Regression, and Playwright E2E tests.

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

# Apply database migration for Lab 3 schema
npx prisma migrate dev --name init_lab3

# Seed database with categories, related systems, users, and tickets
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
npx vitest run --fileParallelism=false
# Executes 84 tests across 18 test files (100% Pass)
```

### 2. Client UI Component, Style & Responsive Tests
```bash
cd client
npx vitest run tests/lab-03
# Executes 24 component tests across 10 test files (100% Pass)
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
npx playwright test --config e2e/playwright.config.ts
# Executes 21 E2E tests across Desktop, Tablet, and Mobile viewports (100% Pass)
```

---

## Project Structure & Documentation Index

```text
toktickit/
├── docs/
│   ├── lab-01/                   # Lab 1 Specification & Test Notes
│   ├── lab-02/                   # Lab 2 Specification, API Spec, Tests & Reviewer Record
│   └── lab-03/                   # Lab 3 Core Engineering Contracts
│       ├── specification.md      # Lab 3 Functional Specs, Business Rules & Matrices
│       ├── ui-spec.md            # Zen Green Design Tokens & Component UI Wireframes
│       ├── api-spec.md           # REST API Endpoint Contracts & Error Schemas
│       ├── tests.md              # Test Strategy & AC-to-Test Traceability Matrix
│       ├── reviewer.md           # Peer Reviewer Records (PR #51 - PR #62)
│       └── ai-use.md             # AI Pair Programming Prompts & Reflection
├── server/
│   ├── prisma/                   # Prisma Schema, Migrations & Seed Script
│   ├── src/                      # Express App, Controllers, Middleware & Auth Utils
│   └── tests/                    # Server Unit & API Test Suites (lab-01, lab-02, lab-03)
├── client/
│   ├── src/                      # React Components, Context, API Fetch & CSS Tokens
│   └── tests/                    # Client UI Component Test Suites (lab-02, lab-03)
├── e2e/
│   ├── lab-03/                   # Playwright E2E Specs (Authentication, Staff Flow, Admin)
│   └── playwright.config.ts      # Playwright Multi-Viewport Configuration
└── artifacts/
    └── lab-03/screenshots/       # Automated E2E Screenshot Evidence
        ├── authentication/       # Login, Password Change, Authenticated Shell, Logout
        ├── staff-queue/          # Staff Ticket Queue Data & Search Screenshots
        ├── staff-ticket-detail/  # Claimed Operations, Comments/Notes & Requester View
        └── user-management/      # User Table, Create Modal, Password Reset, Safety Warnings
```