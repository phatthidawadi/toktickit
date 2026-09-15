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

describe("Staff Ticket Detail & Operational Endpoints (STAFF-API-01 to STAFF-API-04, NOTE-API-01, NOTE-API-02)", () => {
  const prisma = getPrisma();
  let staffCookie: string;
  let requesterCookie: string;
  let staffUserId: number;
  let testTicketId: number;

  beforeAll(async () => {
    // Ensure Staff & Requester have mustChangePassword = false
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com", "jennifer.a@example.com"] } },
      data: { mustChangePassword: false },
    });

    const staffLoginRes = await request.post("/api/auth/login").send({
      email: "staff.somchai@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffLoginRes);
    staffUserId = staffLoginRes.body.user.id;

    const reqLoginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(reqLoginRes);

    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const relatedSystem = await prisma.relatedSystem.findFirst({ where: { isActive: true } });
    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer.a@example.com" } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-STAFF-${Date.now()}`,
        summary: "Staff Detail Operations Test Ticket",
        description: "Testing staff ticket claim, priority, status transition, and internal notes",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        requesterId: jennifer!.id,
        categoryId: category!.id,
        relatedSystemId: relatedSystem!.id,
      },
    });
    testTicketId = ticket.id;
  });

  afterAll(async () => {
    if (testTicketId) {
      await prisma.ticketInternalNote.deleteMany({ where: { ticketId: testTicketId } });
      await prisma.ticketComment.deleteMany({ where: { ticketId: testTicketId } });
      await prisma.ticket.delete({ where: { id: testTicketId } }).catch(() => {});
    }
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com"] } },
      data: { mustChangePassword: true },
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it("STAFF-API-01: Claim ticket assigns ticket to current IT Staff", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/assign`)
      .set("Cookie", staffCookie)
      .send({ claim: true });

    expect(res.status).toBe(200);
    expect(res.body.assignedStaffId).toBe(staffUserId);
  });

  it("STAFF-API-02: Update operational IT Priority (itPriority)", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/priority`)
      .set("Cookie", staffCookie)
      .send({ itPriority: "HIGH" });

    expect(res.status).toBe(200);
    expect(res.body.itPriority).toBe("HIGH");
    expect(res.body.requestedPriority).toBe("LOW"); // requestedPriority unchanged
  });

  it("STAFF-API-03: Valid status transition (NEW -> IN_PROGRESS)", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/status`)
      .set("Cookie", staffCookie)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe("IN_PROGRESS");
  });

  it("STAFF-API-04: Invalid status transition rejection (IN_PROGRESS -> NEW)", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/status`)
      .set("Cookie", staffCookie)
      .send({ status: "NEW" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_TRANSITION");
  });

  it("NOTE-API-01: POST /api/tickets/:id/notes creates internal note & GET /api/tickets/:id/notes retrieves notes for Staff", async () => {
    const postRes = await request
      .post(`/api/tickets/${testTicketId}/notes`)
      .set("Cookie", staffCookie)
      .send({ content: "Internal diagnostic note from staff." });

    expect(postRes.status).toBe(201);
    expect(postRes.body.content).toBe("Internal diagnostic note from staff.");
    expect(postRes.body.author).toBeDefined();

    const getRes = await request
      .get(`/api/tickets/${testTicketId}/notes`)
      .set("Cookie", staffCookie);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThanOrEqual(1);
  });

  it("NOTE-API-02: Requester access to Internal Notes returns 403 Forbidden", async () => {
    await prisma.user.update({
      where: { email: "jennifer.a@example.com" },
      data: { mustChangePassword: false },
    });

    const res = await request
      .get(`/api/tickets/${testTicketId}/notes`)
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
