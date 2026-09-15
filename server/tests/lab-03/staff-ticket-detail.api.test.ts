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
  let adminCookie: string;
  let requesterCookie: string;
  let staffUserId: number;
  let somsriUserId: number;
  let requesterUserId: number;
  let testTicketId: number;
  let autoClaimTicketId: number;

  beforeAll(async () => {
    // Ensure Staff, Admin & Requester have mustChangePassword = false
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com", "staff.somsri@example.com", "admin.toktickit@example.com", "jennifer.a@example.com"] } },
      data: { mustChangePassword: false },
    });

    const staffLoginRes = await request.post("/api/auth/login").send({
      email: "staff.somchai@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffLoginRes);
    staffUserId = staffLoginRes.body.user.id;

    const somsriUser = await prisma.user.findUnique({ where: { email: "staff.somsri@example.com" } });
    somsriUserId = somsriUser!.id;

    const adminLoginRes = await request.post("/api/auth/login").send({
      email: "admin.toktickit@example.com",
      password: "Password123!",
    });
    adminCookie = getCookieHeader(adminLoginRes);

    const reqLoginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(reqLoginRes);
    requesterUserId = reqLoginRes.body.user.id;

    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const relatedSystem = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-TEST-STAFF-${Date.now()}`,
        summary: "Staff Detail Operations Test Ticket",
        description: "Testing staff ticket claim, priority, status transition, and internal notes",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        requesterId: requesterUserId,
        categoryId: category!.id,
        relatedSystemId: relatedSystem!.id,
      },
    });
    testTicketId = ticket.id;

    const autoClaimTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-AUTOCLAIM-${Date.now()}`,
        summary: "Auto-Claim Test Ticket",
        description: "Testing auto-claim on NEW -> OPEN status transition",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "NEW",
        requesterId: requesterUserId,
        assignedStaffId: null,
        categoryId: category!.id,
        relatedSystemId: relatedSystem!.id,
      },
    });
    autoClaimTicketId = autoClaimTicket.id;
  });

  afterAll(async () => {
    const ids = [testTicketId, autoClaimTicketId].filter(Boolean);
    if (ids.length > 0) {
      await prisma.ticketInternalNote.deleteMany({ where: { ticketId: { in: ids } } });
      await prisma.ticketComment.deleteMany({ where: { ticketId: { in: ids } } });
      await prisma.ticket.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
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

  it("STAFF-API-01: Reassign ticket ownership to another active IT Staff member", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/assign`)
      .set("Cookie", staffCookie)
      .send({ assignedStaffId: somsriUserId });

    expect(res.status).toBe(200);
    expect(res.body.assignedStaffId).toBe(somsriUserId);
  });

  it("STAFF-API-01: Unassign ticket ownership by setting assignedStaffId to null", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/assign`)
      .set("Cookie", staffCookie)
      .send({ assignedStaffId: null });

    expect(res.status).toBe(200);
    expect(res.body.assignedStaffId).toBeNull();
  });

  it("STAFF-API-01: Reject assignment to invalid target (Requester user)", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/assign`)
      .set("Cookie", staffCookie)
      .send({ assignedStaffId: requesterUserId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_INPUT");
  });

  it("BR-10 Auto-claim: Transitioning unassigned ticket from NEW to OPEN automatically assigns current staff member", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${autoClaimTicketId}/status`)
      .set("Cookie", staffCookie)
      .send({ status: "OPEN" });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe("OPEN");
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

  it("BR-10 Status Transition: IT Staff attempting CLOSED -> REOPENED is rejected (400)", async () => {
    // Manually set status to RESOLVED then CLOSED for test ticket
    await prisma.ticket.update({
      where: { id: testTicketId },
      data: { currentStatus: "CLOSED" },
    });

    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/status`)
      .set("Cookie", staffCookie)
      .send({ status: "REOPENED" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_TRANSITION");
  });

  it("BR-10 Status Transition: Administrator attempting CLOSED -> REOPENED is allowed (200)", async () => {
    const res = await request
      .patch(`/api/staff/tickets/${testTicketId}/status`)
      .set("Cookie", adminCookie)
      .send({ status: "REOPENED" });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe("REOPENED");
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
    const res = await request
      .get(`/api/tickets/${testTicketId}/notes`)
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
