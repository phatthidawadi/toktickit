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

describe("Requester Workflow API Endpoints (REQ-API-01 & API-REQ-REG-01)", () => {
  const prisma = getPrisma();
  let requesterCookie: string;
  let createdTicketId: number;
  let categoryId: number;
  let relatedSystemId: number;

  beforeAll(async () => {
    // Login as requester (Jennifer)
    const loginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(loginRes);

    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const relatedSystem = await prisma.relatedSystem.findFirst({ where: { isActive: true } });
    categoryId = category!.id;
    relatedSystemId = relatedSystem!.id;
  });

  afterAll(async () => {
    if (createdTicketId) {
      await prisma.ticketComment.deleteMany({ where: { ticketId: createdTicketId } });
      await prisma.ticket.delete({ where: { id: createdTicketId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("API-REQ-REG-01: Requester ticket creation and list retrieval under session auth", async () => {
    // 1. Create ticket under session auth
    const createRes = await request
      .post("/api/tickets")
      .set("Cookie", requesterCookie)
      .send({
        summary: "Regression Ticket Summary Test",
        description: "Testing ticket creation regression with session cookie authentication",
        categoryId,
        relatedSystemId,
        requestedPriority: "MEDIUM",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.ticketNumber).toBeDefined();
    expect(createRes.body.summary).toBe("Regression Ticket Summary Test");
    createdTicketId = createRes.body.id;

    // 2. Fetch owned tickets under session auth
    const listRes = await request
      .get("/api/tickets")
      .set("Cookie", requesterCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.tickets).toBeDefined();
    const found = listRes.body.tickets.some((t: any) => t.id === createdTicketId);
    expect(found).toBe(true);
  });

  it("REQ-API-01: PATCH /api/tickets/:id/resolve-ack sets isRequesterResolved = true without changing currentStatus", async () => {
    const initialTicket = await prisma.ticket.findUnique({ where: { id: createdTicketId } });
    const initialStatus = initialTicket?.currentStatus;

    const patchRes = await request
      .patch(`/api/tickets/${createdTicketId}/resolve-ack`)
      .set("Cookie", requesterCookie);

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.isRequesterResolved).toBe(true);
    expect(patchRes.body.currentStatus).toBe(initialStatus);

    const updatedTicket = await prisma.ticket.findUnique({ where: { id: createdTicketId } });
    expect(updatedTicket?.isRequesterResolved).toBe(true);
  });
});
