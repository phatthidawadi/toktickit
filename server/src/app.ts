import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

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
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
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

// ---------------------------------------------------------------------------
// Lab 2 — Create Ticket
// POST /api/tickets
// ---------------------------------------------------------------------------
import { generateTicketNumber } from "./utils/ticketNumber.js";

app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
    if (isNaN(requesterId) || requesterId <= 0) {
      return res.status(400).json({ error: "Invalid x-requester-id header" });
    }

    // Verify requester exists and is active
    const requester = await getPrisma().requesterUser.findFirst({
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
    const count = await getPrisma().ticket.count();
    const ticketNumber = generateTicketNumber(count + 1, currentYear);

    const newTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber,
        summary: summary.trim(),
        description: description.trim(),
        requestedPriority,
        currentStatus: "NEW",
        requesterId,
        categoryId,
        relatedSystemId,
      },
    });

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;


