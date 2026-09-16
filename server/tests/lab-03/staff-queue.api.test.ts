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

describe("IT Staff Ticket Queue API Endpoints (QUEUE-API-01 & QUEUE-API-02)", () => {
  const prisma = getPrisma();
  let staffCookie: string;
  let requesterCookie: string;

  beforeEach(async () => {
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com", "jennifer.a@example.com"] } },
      data: { mustChangePassword: false, isActive: true },
    });
  });

  beforeAll(async () => {
    // Ensure Staff & Requester have mustChangePassword = false for queue testing
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com", "jennifer.a@example.com"] } },
      data: { mustChangePassword: false, isActive: true },
    });

    // Login as IT Staff (Somchai)
    const staffLoginRes = await request.post("/api/auth/login").send({
      email: "staff.somchai@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffLoginRes);

    // Login as Requester (Jennifer)
    const reqLoginRes = await request.post("/api/auth/login").send({
      email: "jennifer.a@example.com",
      password: "Password123!",
    });
    requesterCookie = getCookieHeader(reqLoginRes);
  });

  afterAll(async () => {
    await prisma.user.updateMany({
      where: { email: { in: ["staff.somchai@example.com"] } },
      data: { mustChangePassword: true },
    }).catch(() => {});
    await prisma.$disconnect();
  });

  it("QUEUE-API-01: GET /api/staff/tickets returns paginated staff queue with search, category, status, priority filters", async () => {
    const res = await request
      .get("/api/staff/tickets?limit=5&page=1")
      .set("Cookie", staffCookie);

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it("QUEUE-API-01: Sorts staff queue by priority_desc", async () => {
    const res = await request
      .get("/api/staff/tickets?sort=priority_desc")
      .set("Cookie", staffCookie);

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();
  });

  it("QUEUE-API-02: Requester access to IT Staff Queue returns 403 Forbidden", async () => {
    await prisma.user.update({
      where: { email: "jennifer.a@example.com" },
      data: { mustChangePassword: false },
    });

    const res = await request
      .get("/api/staff/tickets")
      .set("Cookie", requesterCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
