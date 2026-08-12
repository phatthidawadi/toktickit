# TokTickIT - IT Service Desk Application

TokTickIT is an IT service desk application for managing Account & Access, Hardware, Software, and Network requests.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Bootstrap
- **Backend:** Node.js + Express + TypeScript
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Testing:** Vitest & Supertest

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database server running on `localhost:5432`

### 2. Environment Setup
Copy the example environment files:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Install Dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 4. Database Setup & Seeding
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 5. Running the Application
- **Backend Server:**
  ```bash
  cd server && npm run dev
  ```
- **Frontend Client:**
  ```bash
  cd client && npm run dev
  ```

### 6. Running Tests
- Backend (Supertest): `cd server && npm test`
- Frontend (Vitest): `cd client && npm test`