import { describe, it, expect, afterAll, beforeAll } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const request = supertest(app);

function getCookies(res: supertest.Response): string[] {
  const cookieHeader = res.headers["set-cookie"];
  if (Array.isArray(cookieHeader)) return cookieHeader;
  if (typeof cookieHeader === "string") return [cookieHeader];
  return [];
}

function getCookieHeader(res: supertest.Response): string {
  return getCookies(res)
    .map((c) => c.split(";")[0])
    .join("; ");
}

describe("Public Comments API Endpoints (COMMENT-API-01 & API-COMM-03)", () => {
  const prisma = getPrisma();
  let requesterCookie: string;
  let testTicketId: number;
  let waitingTicketId: number;

  beforeAll(async () => {
    // Login as requester (Jennifer)
    const loginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(loginRes);

    // Get Jennifer user
    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer.a@example.com" } });
    const requesterId = jennifer!.id;

    // Get an existing category and related system
    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const relatedSystem = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    // Create a normal test ticket owned by Jennifer
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-COMM-${Date.now()}`,
        summary: "Test Ticket for Comments",
        description: "Testing public comments creation and retrieval",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        requesterId,
        categoryId: category!.id,
        relatedSystemId: relatedSystem!.id,
      },
    });
    testTicketId = ticket.id;

    // Create a ticket in WAITING_FOR_REQUESTER status
    const waitingTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-WAIT-${Date.now()}`,
        summary: "Waiting Ticket for Auto Transition",
        description: "Testing status auto-transition on requester comment",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "WAITING_FOR_REQUESTER",
        requesterId,
        categoryId: category!.id,
        relatedSystemId: relatedSystem!.id,
      },
    });
    waitingTicketId = waitingTicket.id;
  });

  afterAll(async () => {
    if (testTicketId) {
      await prisma.ticketComment.deleteMany({ where: { ticketId: testTicketId } });
      await prisma.ticket.delete({ where: { id: testTicketId } }).catch(() => {});
    }
    if (waitingTicketId) {
      await prisma.ticketComment.deleteMany({ where: { ticketId: waitingTicketId } });
      await prisma.ticket.delete({ where: { id: waitingTicketId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("COMMENT-API-01: POST /api/tickets/:id/comments creates public comment & GET /api/tickets/:id/comments retrieves comments", async () => {
    // 1. Post comment
    const postRes = await request
      .post(`/api/tickets/${testTicketId}/comments`)
      .set("Cookie", requesterCookie)
      .send({ content: "This is a public test comment." });

    expect(postRes.status).toBe(201);
    expect(postRes.body.id).toBeDefined();
    expect(postRes.body.content).toBe("This is a public test comment.");
    expect(postRes.body.author).toBeDefined();
    expect(postRes.body.author.email).toBe("jennifer.a@example.com");

    // 2. Retrieve comments
    const getRes = await request
      .get(`/api/tickets/${testTicketId}/comments`)
      .set("Cookie", requesterCookie);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThanOrEqual(1);
    expect(getRes.body[0].content).toBe("This is a public test comment.");
  });

  it("COMMENT-API-01: Validation error when posting empty or oversized comment content", async () => {
    const emptyRes = await request
      .post(`/api/tickets/${testTicketId}/comments`)
      .set("Cookie", requesterCookie)
      .send({ content: "   " });
    expect(emptyRes.status).toBe(400);

    const longRes = await request
      .post(`/api/tickets/${testTicketId}/comments`)
      .set("Cookie", requesterCookie)
      .send({ content: "a".repeat(1001) });
    expect(longRes.status).toBe(400);
  });

  it("API-COMM-03: Requester comment on WAITING_FOR_REQUESTER ticket auto-transitions status to IN_PROGRESS", async () => {
    // Verify initial status is WAITING_FOR_REQUESTER
    const initialTicket = await prisma.ticket.findUnique({ where: { id: waitingTicketId } });
    expect(initialTicket?.currentStatus).toBe("WAITING_FOR_REQUESTER");

    // Post comment as Requester
    const postRes = await request
      .post(`/api/tickets/${waitingTicketId}/comments`)
      .set("Cookie", requesterCookie)
      .send({ content: "I am responding with requested information." });

    expect(postRes.status).toBe(201);

    // Verify status transitioned to IN_PROGRESS
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: waitingTicketId } });
    expect(updatedTicket?.currentStatus).toBe("IN_PROGRESS");
  });
});
