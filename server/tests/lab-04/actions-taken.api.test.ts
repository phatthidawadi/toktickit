import { describe, it, expect, afterAll, beforeAll, beforeEach } from "vitest";
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

describe("Actions Taken API Endpoints (ACT-API-01 to ACT-API-09)", () => {
  const prisma = getPrisma();
  let staffCookie: string;
  let adminCookie: string;
  let requesterCookie: string;
  let otherRequesterCookie: string;
  let staffUserId: number;
  let somsriUserId: number;
  let inactiveStaffUserId: number;
  let requesterUserId: number;
  let otherRequesterUserId: number;
  let testTicketId: number;
  let otherTicketId: number;

  beforeAll(async () => {
    // Ensure all test users are active with mustChangePassword = false
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            "staff.somchai@example.com",
            "staff.somsri@example.com",
            "admin.toktickit@example.com",
            "jennifer.a@example.com",
            "michael.b@example.com",
          ],
        },
      },
      data: { mustChangePassword: false, isActive: true },
    });

    // Login Staff Somchai
    const staffRes = await request.post("/api/auth/login").send({
      email: "staff.somchai@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffRes);
    staffUserId = staffRes.body.user.id;

    // Login Admin
    const adminRes = await request.post("/api/auth/login").send({
      email: "admin.toktickit@example.com",
      password: "Password123!",
    });
    adminCookie = getCookieHeader(adminRes);

    // Login Requester Jennifer
    const reqRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(reqRes);
    requesterUserId = reqRes.body.user.id;

    // Login Requester Michael (Other Requester)
    const otherReqRes = await request.post("/api/auth/login").send({
      email: "michael.b@example.com",
      password: "Password123!",
    });
    otherRequesterCookie = getCookieHeader(otherReqRes);
    otherRequesterUserId = otherReqRes.body.user.id;

    // Get User IDs
    const somsri = await prisma.user.findUnique({ where: { email: "staff.somsri@example.com" } });
    somsriUserId = somsri!.id;

    const inactiveStaff = await prisma.user.findUnique({ where: { email: "staff.inactive@example.com" } });
    inactiveStaffUserId = inactiveStaff!.id;

    // Get Jennifer's ticket
    const ticket1 = await prisma.ticket.findFirst({ where: { requesterId: requesterUserId } });
    testTicketId = ticket1!.id;

    // Get Michael's ticket
    const ticket3 = await prisma.ticket.findFirst({ where: { requesterId: otherRequesterUserId } });
    otherTicketId = ticket3!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ACT-API-01: Create valid Action Taken line
  it("ACT-API-01: Create valid Action Taken line auto-populates performedById from session (AC-01, FR-01)", async () => {
    const payload = {
      description: "Tested RAM memory banks with diagnostic tool",
      result: "Bank 1 reported 0 errors; bank 2 had minor parity check failure.",
      status: "COMPLETED",
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: "Diagnostics log saved to NAS share /logs/ram_check.txt",
      assigneeId: somsriUserId,
    };

    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ticketId).toBe(testTicketId);
    expect(res.body.description).toBe(payload.description);
    expect(res.body.result).toBe(payload.result);
    expect(res.body.status).toBe("COMPLETED");
    expect(res.body.performedById).toBe(staffUserId); // Auto-populated from session!
    expect(res.body.assigneeId).toBe(somsriUserId);
    expect(res.body.version).toBe(1);
    expect(res.body.performedBy).toBeDefined();
    expect(res.body.performedBy.name).toBe("Staff Somchai");
  });

  // ACT-API-02: Follow-up note validation enforcement
  it("ACT-API-02: Rejects Action Taken when followUpRequired=true but followUpNote is missing/empty (AC-02, BR-04)", async () => {
    const payload = {
      description: "Replaced cooling fan",
      result: "Fan spinning, but thermal paste needs inspection",
      status: "IN_PROGRESS",
      followUpRequired: true,
      followUpNote: "   ", // Empty after trim
    };

    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/follow-up note is required/i);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  // ACT-API-03: Inactive or non-staff assignee rejection
  it("ACT-API-03: Rejects Action Taken with inactive assignee or requester assignee (AC-03, BR-05)", async () => {
    // 1. Inactive IT staff
    const resInactive = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Replaced power supply unit",
        result: "Voltage normal",
        assigneeId: inactiveStaffUserId,
      });

    expect(resInactive.status).toBe(400);
    expect(resInactive.body.code).toBe("INVALID_ASSIGNEE");

    // 2. Requester as assignee
    const resRequesterAssignee = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Replaced power supply unit",
        result: "Voltage normal",
        assigneeId: requesterUserId,
      });

    expect(resRequesterAssignee.status).toBe(400);
    expect(resRequesterAssignee.body.code).toBe("INVALID_ASSIGNEE");
  });

  // ACT-API-04: Requester creation block on Actions Taken
  it("ACT-API-04: Rejects Action Taken creation when attempted by a Requester with 403 Forbidden (AC-04, BR-03)", async () => {
    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", requesterCookie)
      .send({
        description: "User tried to log an intervention",
        result: "Attempted write",
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  // ACT-API-05: Requester view actions on owned ticket
  it("ACT-API-05: Allows Requester to view Actions Taken on their owned ticket (AC-04, FR-02)", async () => {
    const res = await request
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].performedBy).toBeDefined();
  });

  // ACT-API-06: Cross-requester action access block
  it("ACT-API-06: Rejects Requester attempting to view Actions Taken on another user's ticket with 403 (AC-05, BR-12)", async () => {
    // Jennifer attempts to view Michael's ticket actions
    const res = await request
      .get(`/api/tickets/${otherTicketId}/actions`)
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  // ACT-API-07: List actions ordering (actionDateTime ASC, id ASC)
  it("ACT-API-07: Returns Actions Taken strictly sorted by actionDateTime ASC, id ASC (FR-03, BR-14)", async () => {
    const res = await request
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    for (let i = 1; i < res.body.length; i++) {
      const prevDate = new Date(res.body[i - 1].actionDateTime).getTime();
      const currDate = new Date(res.body[i].actionDateTime).getTime();
      expect(currDate).toBeGreaterThanOrEqual(prevDate);
    }
  });

  // ACT-API-08: Update Action Taken
  it("ACT-API-08: Updates Action Taken fields and status with valid version (FR-03, BR-02)", async () => {
    // 1. Create action
    const createRes = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Initial diagnostics on network card",
        result: "Packet loss observed",
        status: "IN_PROGRESS",
        followUpRequired: true,
        followUpNote: "Run extended ping test",
        version: 1,
      });

    expect(createRes.status).toBe(201);
    const actionId = createRes.body.id;

    // 2. Update action
    const updateRes = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        description: "Initial diagnostics and cable swap completed",
        result: "Packet loss resolved after swapping Cat6 patch cable",
        status: "COMPLETED",
        followUpRequired: false,
        followUpNote: null,
        attachmentNotes: "Speedtest 940Mbps confirmed",
        assigneeId: somsriUserId,
        version: 1, // Matches current version
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.description).toBe("Initial diagnostics and cable swap completed");
    expect(updateRes.body.status).toBe("COMPLETED");
    expect(updateRes.body.followUpRequired).toBe(false);
    expect(updateRes.body.assigneeId).toBe(somsriUserId);
    expect(updateRes.body.version).toBe(2); // Incremented!
  });

  // ACT-API-09: Optimistic concurrency conflict on Action Taken
  it("ACT-API-09: Rejects Action Taken update with HTTP 409 Conflict when submitting a stale version (AC-09, BR-10)", async () => {
    // Create an action
    const createRes = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Configured static IP reservation",
        result: "IP assigned",
        status: "COMPLETED",
      });

    const actionId = createRes.body.id;

    // First update succeeds and moves version from 1 -> 2
    const firstUpdate = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        description: "Configured static IP reservation and verified DNS",
        result: "DNS resolving",
        version: 1,
      });
    expect(firstUpdate.status).toBe(200);
    expect(firstUpdate.body.version).toBe(2);

    // Concurrent/stale update using old version: 1
    const staleUpdate = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        description: "Stale concurrent update attempting to overwrite",
        result: "Stale result",
        version: 1, // Stale! Database is already at version 2
      });

    expect(staleUpdate.status).toBe(409);
    expect(staleUpdate.body.code).toBe("CONCURRENCY_CONFLICT");
    expect(staleUpdate.body.error).toMatch(/updated by another user/i);
  });
});
