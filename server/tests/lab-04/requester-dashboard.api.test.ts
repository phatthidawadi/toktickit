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

describe("DASH-API-01: GET /api/dashboard/requester - Requester access returns metrics", () => {
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

describe("DASH-API-02: GET /api/dashboard/requester - IT Staff is forbidden", () => {
  it("returns 403 for IT_STAFF", async () => {
    const res = await request.get("/api/dashboard/requester").set("Cookie", staffCookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("DASH-API-03: GET /api/dashboard/requester - Admin is forbidden", () => {
  it("returns 403 for ADMINISTRATOR", async () => {
    const res = await request.get("/api/dashboard/requester").set("Cookie", adminCookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});

describe("DASH-API-04: GET /api/dashboard/requester - Unauthenticated access denied", () => {
  it("returns 401 when no session cookie", async () => {
    const res = await request.get("/api/dashboard/requester");
    expect([401, 403]).toContain(res.status);
  });
});
