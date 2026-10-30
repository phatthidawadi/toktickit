import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

const request = supertest(app);

function getCookieHeader(res: supertest.Response): string {
  const cookieHeader = res.headers["set-cookie"];
  const cookies: string[] = Array.isArray(cookieHeader) ? cookieHeader : typeof cookieHeader === "string" ? [cookieHeader] : [];
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

let requesterCookie: string;
let staffCookie: string;
let adminCookie: string;

beforeAll(async () => {
  const prisma = getPrisma();
  // Ensure mustChangePassword is cleared for test accounts
  await prisma.user.updateMany({
    where: { email: { in: ["jennifer.a@example.com", "staff.somchai@example.com", "admin.toktickit@example.com"] } },
    data: { mustChangePassword: false },
  });

  const r1 = await request.post("/api/auth/login").send({ email: "jennifer.a@example.com", password: "Password123!" });
  requesterCookie = getCookieHeader(r1);

  const r2 = await request.post("/api/auth/login").send({ email: "staff.somchai@example.com", password: "Password123!" });
  staffCookie = getCookieHeader(r2);

  const r3 = await request.post("/api/auth/login").send({ email: "admin.toktickit@example.com", password: "Password123!" });
  adminCookie = getCookieHeader(r3);
});

describe("DASH-API-01: GET /api/dashboard/requester — Requester access returns metrics", () => {
  it("returns 200 with required fields for authenticated REQUESTER", async () => {
    const res = await request.get("/api/dashboard/requester").set("Cookie", requesterCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalOpenTickets");
    expect(res.body).toHaveProperty("ticketsWaitingForRequester");
    expect(res.body).toHaveProperty("recentlyResolvedTickets");
    expect(res.body).toHaveProperty("myRecentTickets");
    expect(Array.isArray(res.body.myRecentTickets)).toBe(true);
    expect(res.body.myRecentTickets.length).toBeLessThanOrEqual(5);
  });
});

describe("DASH-API-02: GET /api/dashboard/requester — IT Staff is forbidden", () => {
  it("returns 403 for IT_STAFF", async () => {
    const res = await request.get("/api/dashboard/requester").set("Cookie", staffCookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("DASH-API-03: GET /api/dashboard/requester — Admin is forbidden", () => {
  it("returns 403 for ADMINISTRATOR", async () => {
    const res = await request.get("/api/dashboard/requester").set("Cookie", adminCookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("DASH-API-04: GET /api/dashboard/requester — Unauthenticated access denied", () => {
  it("returns 401 when no session cookie", async () => {
    const res = await request.get("/api/dashboard/requester");
    expect([401, 403]).toContain(res.status);
  });
});

describe("DASH-API-05: GET /api/dashboard/staff — IT Staff returns queue metrics", () => {
  it("returns 200 with required fields for IT_STAFF", async () => {
    const res = await request.get("/api/dashboard/staff").set("Cookie", staffCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("unassignedTickets");
    expect(res.body).toHaveProperty("myAssignedTickets");
    expect(res.body).toHaveProperty("urgentTicketsCount");
    expect(res.body).toHaveProperty("ticketsByStatus");
    expect(res.body).toHaveProperty("ticketsByPriority");
    expect(res.body).toHaveProperty("recentQueueTickets");
    expect(Array.isArray(res.body.recentQueueTickets)).toBe(true);
    expect(res.body.recentQueueTickets.length).toBeLessThanOrEqual(5);
    expect(res.body).not.toHaveProperty("adminUserSummary");
  });
});

describe("DASH-API-06: GET /api/dashboard/staff — Admin receives adminUserSummary extension", () => {
  it("returns 200 with adminUserSummary for ADMINISTRATOR", async () => {
    const res = await request.get("/api/dashboard/staff").set("Cookie", adminCookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("adminUserSummary");
    expect(res.body.adminUserSummary).toHaveProperty("totalUsers");
    expect(res.body.adminUserSummary).toHaveProperty("activeUsers");
    expect(res.body.adminUserSummary).toHaveProperty("usersByRole");
    expect(res.body.adminUserSummary.usersByRole).toHaveProperty("REQUESTER");
    expect(res.body.adminUserSummary.usersByRole).toHaveProperty("IT_STAFF");
    expect(res.body.adminUserSummary.usersByRole).toHaveProperty("ADMINISTRATOR");
  });
});

describe("DASH-API-07: GET /api/dashboard/staff — Requester is forbidden", () => {
  it("returns 403 for REQUESTER", async () => {
    const res = await request.get("/api/dashboard/staff").set("Cookie", requesterCookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("DASH-API-08: GET /api/dashboard/staff — ticketsByStatus includes all 8 statuses", () => {
  it("ticketsByStatus map contains all 8 status keys", async () => {
    const res = await request.get("/api/dashboard/staff").set("Cookie", adminCookie);
    expect(res.status).toBe(200);
    const STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
    for (const s of STATUSES) {
      expect(res.body.ticketsByStatus).toHaveProperty(s);
      expect(typeof res.body.ticketsByStatus[s]).toBe("number");
    }
  });
});
