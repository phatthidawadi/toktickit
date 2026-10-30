import { describe, it, expect, beforeAll, beforeEach } from "vitest";
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

describe("Lab 4 — Actions Taken Foundation & REST API Tests (ACT-API-01 to ACT-API-09, MIG-API-01)", () => {
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
  let legacyTicketId: number;

  beforeAll(async () => {
    // 1. Ensure required test accounts have password changes cleared & correct roles
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            "staff.somchai@example.com",
            "staff.somsri@example.com",
            "staff.inactive@example.com",
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
    staffUserId = staffLoginRes.body.user.id;

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

    // 6. Look up other user IDs
    const somsri = await prisma.user.findUnique({ where: { email: "staff.somsri@example.com" } });
    somsriUserId = somsri!.id;

    const inactiveStaff = await prisma.user.findUnique({ where: { email: "staff.inactive@example.com" } });
    inactiveStaffUserId = inactiveStaff!.id;

    // 7. Get seeded tickets
    const ticket1 = await prisma.ticket.findUnique({ where: { ticketNumber: "TKT-2026-000001" } });
    testTicketId = ticket1!.id;

    const ticket2 = await prisma.ticket.findUnique({ where: { ticketNumber: "TKT-2026-000002" } });
    legacyTicketId = ticket2!.id;
    // Guarantee legacy ticket has 0 actions for MIG-API-01 verification
    await prisma.actionTaken.deleteMany({ where: { ticketId: legacyTicketId } });
  });

  // ACT-API-01: Create valid Action Taken line (auto-performedById)
  it("ACT-API-01: IT Staff can create a valid Action Taken record with auto-populated performedById", async () => {
    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Replaced RAM module in slot 2 and ran memtest diagnostics.",
        result: "Passed 4 passes of memtest86 with 0 errors.",
        status: "COMPLETED",
        followUpRequired: false,
        followUpNote: null,
        attachmentNotes: "memtest_screenshot.png",
        assigneeId: staffUserId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.ticketId).toBe(testTicketId);
    expect(res.body.description).toBe("Replaced RAM module in slot 2 and ran memtest diagnostics.");
    expect(res.body.result).toBe("Passed 4 passes of memtest86 with 0 errors.");
    expect(res.body.status).toBe("COMPLETED");
    expect(res.body.performedById).toBe(staffUserId);
    expect(res.body.performedBy.email).toBe("staff.somchai@example.com");
    expect(res.body.assigneeId).toBe(staffUserId);
    expect(res.body.version).toBe(1);
  });

  // ACT-API-02: Follow-up note validation enforcement
  it("ACT-API-02: Rejects Action Taken when followUpRequired=true but followUpNote is missing or empty", async () => {
    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Checked motherboard capacitors for swelling.",
        result: "No visible defects found.",
        status: "PENDING",
        followUpRequired: true,
        followUpNote: "   ", // Empty whitespace note
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_INPUT");
    expect(res.body.error).toContain("Follow-up Note is required");
  });

  // ACT-API-03: Inactive or non-staff assignee rejection
  it("ACT-API-03: Rejects Action Taken when assignee is inactive or has role REQUESTER", async () => {
    // Attempt 1: Assign to inactive IT Staff
    const resInactive = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Assigned hardware maintenance inspection.",
        result: "Pending physical review.",
        status: "PENDING",
        assigneeId: inactiveStaffUserId,
      });

    expect(resInactive.status).toBe(400);
    expect(resInactive.body.code).toBe("INVALID_ASSIGNEE");

    // Attempt 2: Assign to a user with role REQUESTER
    const resRequester = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Assigned hardware maintenance inspection.",
        result: "Pending physical review.",
        status: "PENDING",
        assigneeId: requesterUserId,
      });

    expect(resRequester.status).toBe(400);
    expect(resRequester.body.code).toBe("INVALID_ASSIGNEE");
  });

  // ACT-API-04: Requester creation block on Actions Taken
  it("ACT-API-04: Requesters cannot create Action Taken records (HTTP 403 Forbidden)", async () => {
    const res = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", requesterCookie)
      .send({
        description: "Attempting to log client intervention.",
        result: "Should be blocked.",
      });

    expect(res.status).toBe(403);
  });

  // ACT-API-05: Requester view actions on owned ticket
  it("ACT-API-05: Requester can view all Actions Taken lines on their owned ticket", async () => {
    const res = await request
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("description");
    expect(res.body[0]).toHaveProperty("result");
    expect(res.body[0]).toHaveProperty("performedBy");
  });

  // ACT-API-06: Cross-requester action access block
  it("ACT-API-06: Requesters cannot view Actions Taken for tickets owned by other users (HTTP 403 Forbidden)", async () => {
    // Ticket 1 belongs to Jennifer (requesterUserId). Michael attempts to view it:
    const res = await request
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", otherRequesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  // ACT-API-07: List actions ordering (actionDateTime ASC, id ASC)
  it("ACT-API-07: Actions Taken are strictly returned sorted by actionDateTime ASC, id ASC", async () => {
    const res = await request
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie);

    expect(res.status).toBe(200);
    const actions = res.body;
    expect(actions.length).toBeGreaterThan(1);

    for (let i = 0; i < actions.length - 1; i++) {
      const current = new Date(actions[i].actionDateTime).getTime();
      const next = new Date(actions[i + 1].actionDateTime).getTime();
      expect(current).toBeLessThanOrEqual(next);
      if (current === next) {
        expect(actions[i].id).toBeLessThan(actions[i + 1].id);
      }
    }
  });

  // ACT-API-08: Update Action Taken and status transition
  it("ACT-API-08: IT Staff can update an existing Action Taken record and transition its status", async () => {
    // First, create an action
    const createRes = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Initial diagnostic probe.",
        result: "Waiting on hardware diagnostic tool.",
        status: "IN_PROGRESS",
        followUpRequired: true,
        followUpNote: "Pick up tool tomorrow.",
        assigneeId: staffUserId,
      });

    const actionId = createRes.body.id;
    const currentVersion = createRes.body.version;

    // Update action to COMPLETED with new assignee
    const updateRes = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        version: currentVersion,
        description: "Completed diagnostic probe with specialized hardware.",
        result: "All diagnostics cleared green.",
        status: "COMPLETED",
        followUpRequired: false,
        followUpNote: null,
        assigneeId: somsriUserId,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.description).toBe("Completed diagnostic probe with specialized hardware.");
    expect(updateRes.body.status).toBe("COMPLETED");
    expect(updateRes.body.followUpRequired).toBe(false);
    expect(updateRes.body.followUpNote).toBeNull();
    expect(updateRes.body.assigneeId).toBe(somsriUserId);
    expect(updateRes.body.version).toBe(currentVersion + 1);
  });

  // ACT-API-09: Optimistic concurrency conflict on Action Taken
  it("ACT-API-09: Returns HTTP 409 Conflict when updating Action Taken with stale version", async () => {
    const createRes = await request
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", staffCookie)
      .send({
        description: "Concurrency verification line.",
        result: "Baseline test.",
        status: "PENDING",
      });

    const actionId = createRes.body.id;
    const initialVersion = createRes.body.version;

    // First update succeeds and increments version to 2
    const firstUpdateRes = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        version: initialVersion,
        result: "Updated once by Technician A.",
      });

    expect(firstUpdateRes.status).toBe(200);
    expect(firstUpdateRes.body.version).toBe(initialVersion + 1);

    // Second update with stale initialVersion (1) should fail with 409 Conflict
    const staleUpdateRes = await request
      .patch(`/api/actions/${actionId}`)
      .set("Cookie", staffCookie)
      .send({
        version: initialVersion,
        result: "Conflicting update from Technician B.",
      });

    expect(staleUpdateRes.status).toBe(409);
    expect(staleUpdateRes.body.code).toBe("CONCURRENCY_CONFLICT");
    expect(staleUpdateRes.body.error).toContain("updated by another user");
  });

  // MIG-API-01: Non-destructive database migration check
  it("MIG-API-01: Legacy tickets without Actions Taken behave correctly and return empty array", async () => {
    const res = await request
      .get(`/api/tickets/${legacyTicketId}/actions`)
      .set("Cookie", staffCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([]);
  });
});
