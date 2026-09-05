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
        requestedPriority,
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
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
    if (isNaN(requesterId) || requesterId <= 0) {
      return res.status(400).json({ error: "Invalid x-requester-id header" });
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
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
    if (isNaN(requesterId) || requesterId <= 0) {
      return res.status(400).json({ error: "Invalid x-requester-id header" });
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
      const requesterHeader = req.headers["x-requester-id"];
      if (!requesterHeader) {
        return res.status(400).json({ error: "Missing x-requester-id header" });
      }

      const requesterId = Number(requesterHeader);
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
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
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
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
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
    const requesterHeader = req.headers["x-requester-id"];
    if (!requesterHeader) {
      return res.status(400).json({ error: "Missing x-requester-id header" });
    }

    const requesterId = Number(requesterHeader);
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

export default app;





