# TokTickIT - IT Service Desk Application

TokTickIT is an IT service desk application for managing Account & Access, Hardware, Software, and Network requests. This repository contains a full-stack starter application.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Bootstrap
- **Backend:** Node.js + Express + TypeScript
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Testing:** Vitest (UI) & Supertest (API)

---

## 🚀 Detailed Setup Guide for Team Members

Follow these steps to clone the project and get your local development environment running.

### 1. Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Database server running locally on port `5432`)

### 2. Clone the Repository
Clone the project to your local machine and navigate into the directory:
```bash
git clone https://github.com/<your-username>/toktickit.git
cd toktickit
```

### 3. Install Dependencies
You need to install npm packages for both the `client` (frontend) and `server` (backend).
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 4. Environment Variables Setup
The project requires environment variables to run. Example files are provided.

**Backend (`server` directory):**
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `server/.env` and update the `DATABASE_URL` with your local PostgreSQL credentials (username, password, database name).
   *Example: `postgresql://postgres:password@localhost:5432/toktickit?schema=public`*

**Frontend (`client` directory):**
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. The default `VITE_API_URL` is set to `http://localhost:3000`. You usually don't need to change this for local development.

### 5. Database Initialization
Ensure your PostgreSQL service is running, then use Prisma to set up the database tables and initial seed data.

```bash
cd server
# Create tables based on the Prisma schema
npx prisma migrate dev --name init

# Populate the database with the required categories
npx prisma db seed
```

---

## 🏃‍♂️ Running the Project Locally

You will need to start both the backend server and the frontend development server simultaneously (in separate terminal windows).

### Start the Backend
```bash
cd server
npm run dev
```
*The API will be available at http://localhost:3000*

### Start the Frontend
```bash
cd client
npm run dev
```
*The web app will open in your browser, typically at http://localhost:5173*

---

## 🧪 Running Automated Tests

The project includes pre-configured tests to verify functionality.

**Backend API Tests (Supertest):**
```bash
cd server
npm test
```

**Frontend UI Tests (Vitest):**
```bash
cd client
npm test
```