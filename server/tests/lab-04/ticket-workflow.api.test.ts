import { describe, it, expect, beforeAll } from "vitest";
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

describe("Lab 4 — Ticket Status Workflow & Resolution Gate REST API Tests (FLOW-API-01 to FLOW-API-09, MIG-API-01)", () => {
  const prisma = getPrisma();
  let staffCookie: string;
  let adminCookie: string;
  let requesterCookie: string;
  let otherRequesterCookie: string;
  let requesterUserId: number;
  let otherRequesterUserId: number;

  beforeAll(async () => {
    // 1. Ensure required test accounts have password changes cleared & correct roles
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            "staff.somchai@example.com",
            "admin.toktickit@example.com",
            "jennifer.a@example.com",
            "michael.b@example.com",
          ],
        },
      },
      data: { mustChangePassword: false },
    });

    // 2. Log in IT Staff (Somchai)
    const staffLoginRes = await request.post("/api/auth/login").send({
      email: "staff.somchai@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffLoginRes);

    // 3. Log in Admin
    const adminLoginRes = await request.post("/api/auth/login").send({
      email: "admin.toktickit@example.com",
      password: "Password123!",
    });
    adminCookie = getCookieHeader(adminLoginRes);

    // 4. Log in Requester 1 (Jennifer)
    const reqLoginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(reqLoginRes);
    requesterUserId = reqLoginRes.body.user.id;

    // 5. Log in Requester 2 (Michael)
    const otherReqLoginRes = await request.post("/api/auth/login").send({
      email: "michael.b@example.com",
      password: "Password123!",
    });
    otherRequesterCookie = getCookieHeader(otherReqLoginRes);
    otherRequesterUserId = otherReqLoginRes.body.user.id;
  });

  // FLOW-API-01: Requester Problem Appears Resolved toggle (resolve-ack)
  it("FLOW-API-01: Requester can toggle Problem Appears Resolved (sets isRequesterResolved=true, increments version, preserves active status)", async () => {
    // Create test ticket owned by requester
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-01-${Date.now()}`,
        summary: "Monitor flickering issue",
        description: "Screen blinks every 10 seconds",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "IN_PROGRESS",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const res = await request
      .patch(`/api/tickets/${ticket.id}/resolve-ack`)
      .set("Cookie", requesterCookie)
      .send({
        isRequesterResolved: true,
        version: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.isRequesterResolved).toBe(true);
    expect(res.body.currentStatus).toBe("IN_PROGRESS");
    expect(res.body.version).toBe(2);

    // Verify in database
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.isRequesterResolved).toBe(true);
    expect(dbTicket?.currentStatus).toBe("IN_PROGRESS");
    expect(dbTicket?.version).toBe(2);
  });

  // FLOW-API-02: IT Staff formal resolution (IN_PROGRESS -> RESOLVED)
  it("FLOW-API-02: IT Staff can formally transition ticket from IN_PROGRESS to RESOLVED with version increment", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-02-${Date.now()}`,
        summary: "Keyboard replacement required",
        description: "Spacebar sticking",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "IN_PROGRESS",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const res = await request
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffCookie)
      .send({
        status: "RESOLVED",
        version: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe("RESOLVED");
    expect(res.body.version).toBe(2);

    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.currentStatus).toBe("RESOLVED");
    expect(dbTicket?.version).toBe(2);
  });

  // FLOW-API-03: Invalid status transition rejection (NEW -> RESOLVED)
  it("FLOW-API-03: Rejects invalid status transition from NEW to RESOLVED with 400 INVALID_STATUS_TRANSITION", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-03-${Date.now()}`,
        summary: "Brand new ticket skipping triage",
        description: "Should not jump to RESOLVED directly from NEW",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "NEW",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const res = await request
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffCookie)
      .send({
        status: "RESOLVED",
        version: 1,
      });

    expect(res.status).toBe(400);
    expect(["INVALID_STATUS_TRANSITION", "INVALID_TRANSITION"]).toContain(res.body.code);
    expect(res.body.error).toContain("Invalid status transition from NEW to RESOLVED");

    // Status in database should be unchanged
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.currentStatus).toBe("NEW");
    expect(dbTicket?.version).toBe(1);
  });

  // FLOW-API-04: Requester cancellation in NEW status vs OPEN status
  it("FLOW-API-04: Requester can cancel own ticket in NEW status, but is rejected with 403 in OPEN status", async () => {
    // 1. Ticket in NEW status: should succeed
    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-04A-${Date.now()}`,
        summary: "Submitted by mistake",
        description: "Please disregard",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const cancelRes = await request
      .patch(`/api/tickets/${newTicket.id}/cancel`)
      .set("Cookie", requesterCookie)
      .send({ version: 1 });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.currentStatus).toBe("CANCELLED");
    expect(cancelRes.body.version).toBe(2);

    // 2. Ticket in OPEN status: requester should receive 403 Forbidden
    const openTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-04B-${Date.now()}`,
        summary: "Ticket already triaged",
        description: "Currently in OPEN state",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "OPEN",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const forbiddenRes = await request
      .patch(`/api/tickets/${openTicket.id}/cancel`)
      .set("Cookie", requesterCookie)
      .send({ version: 1 });

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.code).toBe("FORBIDDEN");
    expect(forbiddenRes.body.error).toContain("NEW status");
  });

  // FLOW-API-05: Auto-transition on Requester comment
  it("FLOW-API-05: Submitting public comment on WAITING_FOR_REQUESTER ticket auto-transitions to IN_PROGRESS", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-05-${Date.now()}`,
        summary: "Awaiting user feedback",
        description: "Waiting for requester response",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "WAITING_FOR_REQUESTER",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const commentRes = await request
      .post(`/api/tickets/${ticket.id}/comments`)
      .set("Cookie", requesterCookie)
      .send({
        content: "Here is the error code you requested: ERR_CONNECTION_REFUSED",
      });

    expect(commentRes.status).toBe(201);

    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.currentStatus).toBe("IN_PROGRESS");
    expect(dbTicket?.version).toBe(2);
  });

  // FLOW-API-06: Optimistic locking on ticket status update (409 Conflict)
  it("FLOW-API-06: Rejects status update with 409 CONCURRENCY_CONFLICT on stale ticket.version", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-06-${Date.now()}`,
        summary: "Concurrency test ticket",
        description: "Testing version conflict",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        currentStatus: "OPEN",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 3, // current version is 3
      },
    });

    // Submit with stale version 2
    const res = await request
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffCookie)
      .send({
        status: "IN_PROGRESS",
        version: 2,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("CONCURRENCY_CONFLICT");
    expect(res.body.error).toContain("updated by another session");

    // Version and status unchanged
    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.currentStatus).toBe("OPEN");
    expect(dbTicket?.version).toBe(3);
  });

  // FLOW-API-07: Optimistic locking on resolve-ack toggle (409 Conflict)
  it("FLOW-API-07: Rejects resolve-ack toggle with 409 CONCURRENCY_CONFLICT on stale ticket.version", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-07-${Date.now()}`,
        summary: "Resolve ack concurrency",
        description: "Testing version mismatch",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "IN_PROGRESS",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 5,
      },
    });

    const res = await request
      .patch(`/api/tickets/${ticket.id}/resolve-ack`)
      .set("Cookie", requesterCookie)
      .send({
        isRequesterResolved: true,
        version: 4,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("CONCURRENCY_CONFLICT");

    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.version).toBe(5);
  });

  // FLOW-API-08: Optimistic locking on requester ticket cancellation (409 Conflict)
  it("FLOW-API-08: Rejects requester ticket cancellation with 409 CONCURRENCY_CONFLICT on stale ticket.version", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-08-${Date.now()}`,
        summary: "Cancel concurrency",
        description: "Testing version mismatch on cancel",
        requestedPriority: "LOW",
        itPriority: "LOW",
        currentStatus: "NEW",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 2,
      },
    });

    const res = await request
      .patch(`/api/tickets/${ticket.id}/cancel`)
      .set("Cookie", requesterCookie)
      .send({
        version: 1,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("CONCURRENCY_CONFLICT");

    const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(dbTicket?.currentStatus).toBe("NEW");
    expect(dbTicket?.version).toBe(2);
  });

  // FLOW-API-09: Requester formal status transition block (403 Forbidden)
  it("FLOW-API-09: Rejects Requester attempting formal status transition with 403 Forbidden", async () => {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-FLOW-09-${Date.now()}`,
        summary: "Unauthorized status transition attempt",
        description: "Requester should not have access to staff status route",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        currentStatus: "OPEN",
        requesterId: requesterUserId,
        categoryId: 1,
        relatedSystemId: 1,
        version: 1,
      },
    });

    const res = await request
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", requesterCookie)
      .send({
        status: "IN_PROGRESS",
        version: 1,
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  // MIG-API-01: Legacy ticket compatibility check
  it("MIG-API-01: Database migration is non-destructive and pre-existing tickets remain fully readable", async () => {
    const seededTickets = await prisma.ticket.findMany({
      take: 3,
      include: {
        category: true,
        relatedSystem: true,
        requester: true,
        comments: true,
        attachments: true,
      },
    });

    expect(seededTickets.length).toBeGreaterThan(0);
    for (const t of seededTickets) {
      expect(t.ticketNumber).toBeTruthy();
      expect(typeof t.version).toBe("number");
      expect(t.requester).toBeDefined();
    }
  });
});
