import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

import cookieParser from "cookie-parser";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePasswordStrength,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./utils/auth.js";
import { authenticateSession, requireRole } from "./middleware/authMiddleware.js";
import { loginRateLimiter, clearRateLimitStore } from "./middleware/rateLimiter.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";
import { isValidStatusTransition } from "./utils/workflow.js";

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors({ credentials: true, origin: true }));          // already wired: lets the Vite dev server call this API
app.use(express.json());
app.use(cookieParser());

import { seedDatabase } from "../prisma/seed.js";

// Test route to clear rate limiting store and re-seed database during Playwright test runs
app.post("/api/test/reset-rate-limit", (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Forbidden in production", code: "FORBIDDEN" });
  }
  clearRateLimitStore();
  return res.json({ success: true, message: "Rate limit store cleared." });
});

app.post("/api/test/reset-db", async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Forbidden in production", code: "FORBIDDEN" });
  }
  try {
    clearRateLimitStore();
    await seedDatabase();
    return res.json({ success: true, message: "Database re-seeded successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to reset database" });
  }
});

// ---------------------------------------------------------------------------
// Lab 3 — Authentication REST Endpoints
// ---------------------------------------------------------------------------

// POST /api/auth/login — User Authentication (Rate Limited: SEC-AUTH-03)
app.post("/api/auth/login", loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required", code: "INVALID_INPUT" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getPrisma().user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password", code: "INVALID_CREDENTIALS" });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000, // 8 hours in ms
      path: "/",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/auth/logout — Invalidate Session
app.post("/api/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.cookie(SESSION_COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    maxAge: 0,
  });
  return res.status(200).json({ message: "Successfully logged out" });
});

// GET /api/auth/me — Retrieve Current Authenticated User Profile
app.get("/api/auth/me", authenticateSession, async (req: Request, res: Response) => {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User inactive or not found", code: "UNAUTHORIZED" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/auth/change-password — Update User Password
app.post("/api/auth/change-password", authenticateSession, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Current password, new password, and confirm password are required", code: "INVALID_INPUT" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match", code: "PASSWORD_MISMATCH" });
    }

    const user = await getPrisma().user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User inactive or not found", code: "UNAUTHORIZED" });
    }

    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: "Current password is incorrect", code: "INCORRECT_CURRENT_PASSWORD" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from current password", code: "PASSWORD_NOT_DIFFERENT" });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return res.status(400).json({ error: strengthCheck.reason, code: "WEAK_PASSWORD" });
    }

    const newHash = await hashPassword(newPassword);
    await getPrisma().user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// GET /api/auth/protected-sample — Sample protected endpoint for password change check
app.get("/api/auth/protected-sample", authenticateSession, (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Access granted to protected sample endpoint" });
});

// GET /api/staff/tickets — IT Staff Ticket Queue (Search, Filter, Sort, Paginate)
app.get("/api/staff/tickets", authenticateSession, requireRole(["IT_STAFF", "ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const { search, categoryId, status, requestedPriority, itPriority, assignedStaffId, sort = "createdAt_desc", page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (status) {
      where.currentStatus = String(status);
    }

    if (requestedPriority) {
      where.requestedPriority = String(requestedPriority);
    }

    if (itPriority) {
      where.itPriority = String(itPriority);
    }

    if (assignedStaffId !== undefined) {
      if (assignedStaffId === "unassigned") {
        where.assignedStaffId = null;
      } else if (assignedStaffId === "me") {
        where.assignedStaffId = req.user!.userId;
      } else {
        const staffIdNum = Number(assignedStaffId);
        if (!isNaN(staffIdNum)) {
          where.assignedStaffId = staffIdNum;
        }
      }
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const searchTerm = search.trim();
      where.OR = [
        { ticketNumber: { contains: searchTerm, mode: "insensitive" } },
        { summary: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const PRIORITY_RANK: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    if (sort === "priority_desc") {
      const [total, allTickets] = await Promise.all([
        getPrisma().ticket.count({ where }),
        getPrisma().ticket.findMany({
          where,
          include: {
            requester: { select: { id: true, name: true, email: true } },
            assignedStaff: { select: { id: true, name: true, email: true, role: true } },
            category: { select: { id: true, name: true } },
            relatedSystem: { select: { id: true, name: true } },
            attachments: {
              where: { isRemoved: false },
              select: { id: true, filename: true, originalName: true, size: true, mimeType: true },
            },
          },
        }),
      ]);

      allTickets.sort((a, b) => {
        const rankA = PRIORITY_RANK[a.itPriority] || PRIORITY_RANK[a.requestedPriority] || 0;
        const rankB = PRIORITY_RANK[b.itPriority] || PRIORITY_RANK[b.requestedPriority] || 0;
        if (rankA !== rankB) {
          return rankB - rankA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const tickets = allTickets.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.status(200).json({
        tickets,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "createdAt_asc") {
      orderBy = { createdAt: "asc" };
    }

    const [total, tickets] = await Promise.all([
      getPrisma().ticket.count({ where }),
      getPrisma().ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          assignedStaff: { select: { id: true, name: true, email: true, role: true } },
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          attachments: {
            where: { isRemoved: false },
            select: { id: true, filename: true, originalName: true, size: true, mimeType: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      tickets,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// GET /api/staff/tickets/:id — Retrieve Ticket Detail for Staff/Admin
app.get("/api/staff/tickets/:id", authenticateSession, requireRole(["IT_STAFF", "ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignedStaff: { select: { id: true, name: true, email: true, role: true } },
        category: { select: { id: true, name: true, description: true } },
        relatedSystem: { select: { id: true, name: true, description: true } },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            mimeType: true,
            isRemoved: true,
            removedReason: true,
            removedAt: true,
            createdAt: true,
          },
          orderBy: { id: "asc" },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        internalNotes: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/staff/tickets/:id/assign — Claim or Reassign Ticket
app.patch("/api/staff/tickets/:id/assign", authenticateSession, requireRole(["IT_STAFF", "ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const { assignedStaffId, claim } = req.body || {};
    let targetStaffId: number | null = null;

    if (claim === true) {
      targetStaffId = req.user!.userId;
    } else if (assignedStaffId !== undefined) {
      if (assignedStaffId === null) {
        targetStaffId = null;
      } else {
        const staffIdNum = Number(assignedStaffId);
        if (isNaN(staffIdNum)) {
          return res.status(400).json({ error: "Invalid assignedStaffId", code: "INVALID_INPUT" });
        }
        targetStaffId = staffIdNum;
      }
    } else {
      return res.status(400).json({ error: "assignedStaffId or claim field is required", code: "INVALID_INPUT" });
    }

    if (targetStaffId !== null) {
      const targetUser = await getPrisma().user.findUnique({
        where: { id: targetStaffId },
      });

      if (!targetUser || !targetUser.isActive || (targetUser.role !== "IT_STAFF" && targetUser.role !== "ADMINISTRATOR")) {
        return res.status(400).json({
          error: "Target assigned user is inactive or not an IT Staff/Admin",
          code: "INVALID_INPUT",
        });
      }
    }

    const updatedTicket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { assignedStaffId: targetStaffId },
      include: {
        assignedStaff: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/staff/tickets/:id/priority — Update Operational IT Priority
app.patch("/api/staff/tickets/:id/priority", authenticateSession, requireRole(["IT_STAFF", "ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const { itPriority } = req.body || {};
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!itPriority || !validPriorities.includes(itPriority)) {
      return res.status(400).json({
        error: "Valid itPriority (LOW, MEDIUM, HIGH, URGENT) is required",
        code: "INVALID_INPUT",
      });
    }

    const updatedTicket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { itPriority: itPriority as any },
    });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/staff/tickets/:id/status — Transition Ticket Status (BR-10 Matrix)
app.patch("/api/staff/tickets/:id/status", authenticateSession, requireRole(["IT_STAFF", "ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const { status } = req.body || {};
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status field is required", code: "INVALID_INPUT" });
    }

    const isPermitted = isValidStatusTransition(ticket.currentStatus, status, req.user!.role);
    if (!isPermitted) {
      return res.status(400).json({
        error: `Invalid ticket status transition from ${ticket.currentStatus} to ${status}`,
        code: "INVALID_TRANSITION",
      });
    }

    const updateData: any = { currentStatus: status };

    // BR-10 Auto-claim rule: If transitioning from NEW to OPEN or IN_PROGRESS while unassigned
    if (ticket.currentStatus === "NEW" && (status === "OPEN" || status === "IN_PROGRESS") && ticket.assignedStaffId === null) {
      updateData.assignedStaffId = req.user!.userId;
    }

    const updatedTicket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});



// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-cache");
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// Add:  GET /api/categories
//   -> read categories from PostgreSQL via getPrisma().category.findMany(...)
//   -> return each { id, name } in a predictable (id) order
//   -> on failure, respond 500 with a safe message (no internal details)
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      select: { id: true, name: true },
      orderBy: { id: "asc" }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Development Requester List
// GET /api/requesters
//   -> read active requesters from PostgreSQL via getPrisma().requesterUser.findMany(...)
//   -> return active requesters in predictable (id) order
//   -> on failure, respond 500 with a safe message
// ---------------------------------------------------------------------------
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().user.findMany({
      where: { role: "REQUESTER", isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
      orderBy: { id: "asc" },
    });
    res.status(200).json(requesters);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Related Systems List
// GET /api/related-systems
// ---------------------------------------------------------------------------
app.get("/api/related-systems", async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

    const relatedSystems = await getPrisma().relatedSystem.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        isActive: true,
      },
      orderBy: { id: "asc" },
    });
    res.status(200).json(relatedSystems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function getRequesterIdFromReq(req: Request): number | null {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token) {
    const payload = verifyToken(token);
    if (payload?.userId) {
      return payload.userId;
    }
  }

  const requesterHeader = req.headers["x-requester-id"];
  if (requesterHeader) {
    const id = Number(requesterHeader);
    if (!isNaN(id) && id > 0) return id;
  }

  return null;
}

async function getUserFromReq(req: Request): Promise<{ id: number; name: string; email: string; role: string; isActive: boolean; mustChangePassword: boolean } | null> {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const user = await getPrisma().user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true },
  });

  if (!user || !user.isActive) return null;
  return user;
}

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    // Verify requester exists and is active
    const requester = await getPrisma().user.findFirst({
      where: { id: requesterId, isActive: true },
    });
    if (!requester) {
      return res.status(400).json({ error: "Inactive or invalid requester" });
    }

    const { summary, description, categoryId, relatedSystemId, requestedPriority } = req.body;

    // Field Validations (BR-06)
    if (!summary || typeof summary !== "string" || summary.trim().length < 5 || summary.trim().length > 100) {
      return res.status(400).json({ error: "Summary is required (5 to 100 characters)" });
    }

    if (!description || typeof description !== "string" || description.trim().length < 10 || description.trim().length > 1000) {
      return res.status(400).json({ error: "Description is required (10 to 1000 characters)" });
    }

    if (!categoryId || typeof categoryId !== "number") {
      return res.status(400).json({ error: "Valid categoryId is required" });
    }

    if (!relatedSystemId || typeof relatedSystemId !== "number") {
      return res.status(400).json({ error: "Valid relatedSystemId is required" });
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!requestedPriority || !validPriorities.includes(requestedPriority)) {
      return res.status(400).json({ error: "Valid requestedPriority (LOW, MEDIUM, HIGH, URGENT) is required" });
    }

    // Verify Category and Related System existence
    const categoryExists = await getPrisma().category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!categoryExists) {
      return res.status(400).json({ error: "Selected Category does not exist or is inactive" });
    }

    const systemExists = await getPrisma().relatedSystem.findFirst({
      where: { id: relatedSystemId, categoryId, isActive: true },
    });
    if (!systemExists) {
      return res.status(400).json({ error: "Selected Related System does not match category or is inactive" });
    }

    // Generate Ticket Number (TKT-YYYY-XXXXXX)
    const currentYear = new Date().getFullYear();
    let ticketNumber = "";
    let attempts = 0;
    while (attempts < 30) {
      const count = await getPrisma().ticket.count();
      const seq = count + 1 + attempts * 10 + Math.floor(Math.random() * 10000);
      const candidate = generateTicketNumber(seq, currentYear);
      const existing = await getPrisma().ticket.findUnique({ where: { ticketNumber: candidate } });
      if (!existing) {
        ticketNumber = candidate;
        break;
      }
      attempts++;
    }
    if (!ticketNumber) {
      ticketNumber = `TKT-${currentYear}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const newTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber,
        summary: summary.trim(),
        description: description.trim(),
        requestedPriority: requestedPriority as any,
        itPriority: requestedPriority as any,
        currentStatus: "NEW",
        requesterId,
        categoryId,
        relatedSystemId,
      },
    });

    res.status(201).json(newTicket);
  } catch (error: any) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — My Tickets List (Search, Filter, Sort, Paginate)
// GET /api/tickets
// ---------------------------------------------------------------------------
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const { search, categoryId, status, priority, sort = "desc", page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      requesterId,
    };

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (status) {
      where.currentStatus = String(status);
    }

    if (priority) {
      where.requestedPriority = String(priority);
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const searchTerm = search.trim();
      where.OR = [
        { ticketNumber: { contains: searchTerm, mode: "insensitive" } },
        { summary: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "createdAt_asc" || sort === "asc") {
      orderBy = { createdAt: "asc" };
    }

    const PRIORITY_RANK: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    if (sort === "priority_desc" || sort === "priority_asc") {
      const [total, allTickets] = await Promise.all([
        getPrisma().ticket.count({ where }),
        getPrisma().ticket.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            relatedSystem: { select: { id: true, name: true } },
            attachments: {
              where: { isRemoved: false },
              select: { id: true, filename: true, originalName: true, size: true, mimeType: true },
            },
          },
        }),
      ]);

      allTickets.sort((a, b) => {
        const rankA = PRIORITY_RANK[a.requestedPriority] || 0;
        const rankB = PRIORITY_RANK[b.requestedPriority] || 0;
        if (rankA !== rankB) {
          return sort === "priority_desc" ? rankB - rankA : rankA - rankB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const tickets = allTickets.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.status(200).json({
        tickets,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });
    }

    const [total, tickets] = await Promise.all([
      getPrisma().ticket.count({ where }),
      getPrisma().ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          attachments: {
            where: { isRemoved: false },
            select: { id: true, filename: true, originalName: true, size: true, mimeType: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      tickets,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Ticket Detail Read-Only
// GET /api/tickets/:id
// ---------------------------------------------------------------------------
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, description: true } },
        relatedSystem: { select: { id: true, name: true, description: true } },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            mimeType: true,
            isRemoved: true,
            removedReason: true,
            removedAt: true,
            createdAt: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // BR-03 & AC-03: Access Control (403 Forbidden if ticket belongs to another requester)
    if (ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied. You can only view your own tickets." });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Attachment Lifecycle
// Multer Configuration & Validation (BR-07, AC-04, AC-05, AC-06)
// ---------------------------------------------------------------------------
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `attachment-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit (AC-05)
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("File type not allowed (only JPG, PNG, WEBP, and PDF files are accepted)"));
    }
    cb(null, true);
  },
});

// POST /api/tickets/:id/attachments — Upload Attachment
app.post("/api/tickets/:id/attachments", (req: Request, res: Response) => {
  upload.single("file")(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds maximum limit of 5MB" });
      }
      return res.status(400).json({ error: err.message || "File upload failed" });
    }

    try {
      const requesterId = getRequesterIdFromReq(req);
      if (!requesterId) {
        return res.status(400).json({ error: "Missing x-requester-id header" });
      }
      const ticketId = Number(req.params.id);

      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (ticket.requesterId !== requesterId) {
        return res.status(403).json({ error: "Access denied. You can only attach files to your own tickets." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // BR-07: Maximum 5 active attachments per ticket
      const activeCount = await getPrisma().attachment.count({
        where: { ticketId, isRemoved: false },
      });

      if (activeCount >= 5) {
        return res.status(400).json({ error: "Maximum active attachments limit (5 per ticket) reached" });
      }

      const attachment = await getPrisma().attachment.create({
        data: {
          ticketId,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          filePath: req.file.path,
        },
      });

      return res.status(201).json(attachment);
    } catch (error: any) {
      console.error("Attachment upload error:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  });
});

// GET /api/attachments/:id — Retrieve Attachment Metadata
app.get("/api/attachments/:id", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }
    const attachmentId = Number(req.params.id);

    const attachment = await getPrisma().attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied. You can only view metadata for attachments on your own tickets." });
    }

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/attachments/:id/download — Download Attachment (410 Gone if removed)
app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }
    const attachmentId = Number(req.params.id);

    const attachment = await getPrisma().attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // BR-07 & AC-06: Soft-removed attachment returns 410 Gone
    if (attachment.isRemoved) {
      return res.status(410).json({ error: "Attachment has been removed" });
    }

    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ error: "File content not found on server" });
    }

    res.download(attachment.filePath, attachment.originalName);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/attachments/:id — Soft-Remove Attachment
app.delete("/api/attachments/:id", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterIdFromReq(req);
    if (!requesterId) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }
    const attachmentId = Number(req.params.id);
    const { reason } = req.body || {};

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      return res.status(400).json({ error: "A removal reason of at least 5 characters is required" });
    }

    const attachment = await getPrisma().attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await getPrisma().attachment.update({
      where: { id: attachmentId },
      data: {
        isRemoved: true,
        removedReason: reason.trim(),
        removedAt: new Date(),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/tickets/:id/comments — Fetch Public Comments
app.get("/api/tickets/:id/comments", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    // Access control: Ticket owner (REQUESTER) or IT_STAFF / ADMINISTRATOR
    if (user.role === "REQUESTER" && ticket.requesterId !== user.id) {
      return res.status(403).json({ error: "Access denied. You can only view comments for your own tickets.", code: "FORBIDDEN" });
    }

    const comments = await getPrisma().ticketComment.findMany({
      where: { ticketId },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/tickets/:id/comments — Post a Public Comment
app.post("/api/tickets/:id/comments", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    if (user.role === "REQUESTER" && ticket.requesterId !== user.id) {
      return res.status(403).json({ error: "Access denied. You can only comment on your own tickets.", code: "FORBIDDEN" });
    }

    const { content } = req.body || {};
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.trim().length > 1000) {
      return res.status(400).json({ error: "Comment content is required (1 to 1000 characters)", code: "INVALID_INPUT" });
    }

    const newComment = await getPrisma().ticketComment.create({
      data: {
        ticketId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // BR-10: Requester comment auto-transition from WAITING_FOR_REQUESTER to IN_PROGRESS
    if (user.role === "REQUESTER" && ticket.currentStatus === "WAITING_FOR_REQUESTER") {
      await getPrisma().ticket.update({
        where: { id: ticketId },
        data: { currentStatus: "IN_PROGRESS" },
      });
    }

    return res.status(201).json(newComment);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/tickets/:id/resolve-ack — Requester Problem Appears Resolved toggle
app.patch("/api/tickets/:id/resolve-ack", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    if (ticket.requesterId !== user.id) {
      return res.status(403).json({ error: "Access denied. You can only acknowledge resolution for your own tickets.", code: "FORBIDDEN" });
    }

    const updatedTicket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { isRequesterResolved: true },
    });

    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// GET /api/tickets/:id/notes — Fetch Confidential Internal Notes (Staff/Admin ONLY)
app.get("/api/tickets/:id/notes", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    if (user.role === "REQUESTER") {
      return res.status(403).json({
        error: "Access denied. Confidential Internal Notes are restricted to IT Staff and Administrators.",
        code: "FORBIDDEN",
      });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const notes = await getPrisma().ticketInternalNote.findMany({
      where: { ticketId },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/tickets/:id/notes — Post a Private Internal Note (Staff/Admin ONLY)
app.post("/api/tickets/:id/notes", async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        error: "Mandatory password change required before accessing system features.",
        code: "MUST_CHANGE_PASSWORD",
      });
    }

    if (user.role === "REQUESTER") {
      return res.status(403).json({
        error: "Access denied. Confidential Internal Notes are restricted to IT Staff and Administrators.",
        code: "FORBIDDEN",
      });
    }

    const ticketId = Number(req.params.id);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", code: "NOT_FOUND" });
    }

    const { content } = req.body || {};
    if (!content || typeof content !== "string" || content.trim().length === 0 || content.trim().length > 1000) {
      return res.status(400).json({ error: "Internal note content is required (1 to 1000 characters)", code: "INVALID_INPUT" });
    }

    const newNote = await getPrisma().ticketInternalNote.create({
      data: {
        ticketId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.status(201).json(newNote);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// ---------------------------------------------------------------------------
// Lab 3 — Administrator User Management Endpoints (Issue 21)
// Restricted strictly to ADMINISTRATOR role
// ---------------------------------------------------------------------------

// GET /api/admin/users — List Users with Search & Role Filter
app.get("/api/admin/users", authenticateSession, requireRole(["ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query;

    const where: any = {};

    if (role && typeof role === "string" && ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    const users = await getPrisma().user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/admin/users — Create User Account
app.post("/api/admin/users", authenticateSession, requireRole(["ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const { name, email, role, initialPassword, password, isActive } = req.body || {};
    const rawPassword = initialPassword || password;

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: "User name is required (2 to 100 characters)", code: "INVALID_INPUT" });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required", code: "INVALID_INPUT" });
    }

    const validRoles = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
    if (!role || typeof role !== "string" || !validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: "Valid role (REQUESTER, IT_STAFF, ADMINISTRATOR) is required", code: "INVALID_INPUT" });
    }

    if (!rawPassword || typeof rawPassword !== "string" || !validatePasswordStrength(rawPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
        code: "INVALID_PASSWORD",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // BR-13: Case-insensitive Unique Email Check
    const existingUser = await getPrisma().user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      return res.status(409).json({ error: "An account with this email address already exists.", code: "DUPLICATE_EMAIL" });
    }

    const passwordHash = await hashPassword(rawPassword);

    let userIsActive = true;
    if (typeof isActive === "boolean") {
      userIsActive = isActive;
    } else if (typeof isActive === "string") {
      userIsActive = isActive.toLowerCase() !== "false";
    }

    const newUser = await getPrisma().user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        role: role.toUpperCase() as any,
        passwordHash,
        isActive: userIsActive,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// PATCH /api/admin/users/:id — Edit User Account
app.patch("/api/admin/users/:id", authenticateSession, requireRole(["ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const targetId = Number(req.params.id);
    if (isNaN(targetId) || targetId <= 0) {
      return res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
    }

    const targetUser = await getPrisma().user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
    }

    const { name, email, role, isActive } = req.body || {};

    // Validate name if provided (P2-2)
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ error: "User name must be between 2 and 100 characters", code: "INVALID_INPUT" });
      }
    }

    // Validate role if provided (P2-1)
    if (role !== undefined) {
      const validRoles = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
      if (typeof role !== "string" || !validRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ error: "Valid role (REQUESTER, IT_STAFF, ADMINISTRATOR) is required", code: "INVALID_INPUT" });
      }
    }

    // If email is being updated, check case-insensitive uniqueness (BR-13)
    let normalizedEmail: string | undefined = undefined;
    if (email && typeof email === "string" && email.trim().length > 0) {
      if (!email.includes("@")) {
        return res.status(400).json({ error: "Valid email address is required", code: "INVALID_INPUT" });
      }
      normalizedEmail = email.trim().toLowerCase();

      const existingOther = await getPrisma().user.findFirst({
        where: {
          email: { equals: normalizedEmail, mode: "insensitive" },
          NOT: { id: targetId },
        },
      });

      if (existingOther) {
        return res.status(409).json({ error: "An account with this email address already exists.", code: "DUPLICATE_EMAIL" });
      }
    }

    // BR-14: Self-Deactivation Prevention
    if (req.user?.userId === targetId && isActive === false) {
      return res.status(400).json({
        error: "Administrators are prohibited from deactivating their own active account.",
        code: "SELF_DEACTIVATION_PROHIBITED",
      });
    }

    // BR-15: Last Administrator Protection
    const isTargetCurrentlyAdmin = targetUser.role === "ADMINISTRATOR" && targetUser.isActive;
    const isChangingRoleAwayFromAdmin = role && role.toUpperCase() !== "ADMINISTRATOR";
    const isDeactivating = isActive === false;

    if (isTargetCurrentlyAdmin && (isChangingRoleAwayFromAdmin || isDeactivating)) {
      const activeAdminCount = await getPrisma().user.count({
        where: { role: "ADMINISTRATOR", isActive: true },
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          error: "Prohibited from deactivating or changing role of the last active Administrator in the system.",
          code: "LAST_ADMIN_PROTECTION",
        });
      }
    }

    const updateData: any = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (normalizedEmail) updateData.email = normalizedEmail;
    if (role && typeof role === "string") updateData.role = role.toUpperCase();
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updatedUser = await getPrisma().user.update({
      where: { id: targetId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

// POST /api/admin/users/:id/reset-password — Reset Initial Password
app.post("/api/admin/users/:id/reset-password", authenticateSession, requireRole(["ADMINISTRATOR"]), async (req: Request, res: Response) => {
  try {
    const targetId = Number(req.params.id);
    if (isNaN(targetId) || targetId <= 0) {
      return res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
    }

    const targetUser = await getPrisma().user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found", code: "NOT_FOUND" });
    }

    const { initialPassword, newPassword, password } = req.body || {};
    const rawPassword = initialPassword || newPassword || password;

    if (!rawPassword || typeof rawPassword !== "string" || !validatePasswordStrength(rawPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
        code: "INVALID_PASSWORD",
      });
    }

    const passwordHash = await hashPassword(rawPassword);

    const updatedUser = await getPrisma().user.update({
      where: { id: targetId },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Initial password reset successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", code: "INTERNAL_ERROR" });
  }
});

export default app;





