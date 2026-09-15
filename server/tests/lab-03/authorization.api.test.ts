import { describe, it, expect, afterAll } from "vitest";
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

describe("Server-Side Authorization & RBAC Middleware (AUTHZ-API-01 to AUTHZ-API-03)", () => {
  const prisma = getPrisma();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("AUTHZ-API-01: Requester ownership spoofing rejection (AC-05, BR-04)", async () => {
    // Log in as jennifer.a@example.com (id = 1, role = REQUESTER)
    const loginRes = await request
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "Password123!",
      });

    expect(loginRes.status).toBe(200);
    const cookieHeader = getCookieHeader(loginRes);

    // Call GET /api/auth/me while spoofing x-requester-id: 999
    const meRes = await request
      .get("/api/auth/me")
      .set("Cookie", cookieHeader)
      .set("x-requester-id", "999");

    expect(meRes.status).toBe(200);
    // Verified that session identity (userId = 1) is extracted solely from session cookie
    expect(meRes.body.user.id).toBe(loginRes.body.user.id);
    expect(meRes.body.user.id).not.toBe(999);
  });

  it("AUTHZ-API-02: Unauthenticated request to protected endpoints returns 401 (AC-06, FR-07)", async () => {
    const resMe = await request.get("/api/auth/me");
    expect(resMe.status).toBe(401);
    expect(resMe.body.code).toBe("UNAUTHORIZED");

    const resStaff = await request.get("/api/staff/tickets");
    expect(resStaff.status).toBe(401);
    expect(resStaff.body.code).toBe("UNAUTHORIZED");

    const resAdmin = await request.get("/api/admin/users");
    expect(resAdmin.status).toBe(401);
    expect(resAdmin.body.code).toBe("UNAUTHORIZED");
  });

  it("AUTHZ-API-03: Role-based forbidden access returns 403 (AC-06, BR-06)", async () => {
    const user = await prisma.user.findUnique({ where: { email: "jennifer.a@example.com" } });
    const initialMustChangePassword = user?.mustChangePassword ?? true;

    // Temporarily set mustChangePassword = false for testing RBAC
    await prisma.user.update({
      where: { email: "jennifer.a@example.com" },
      data: { mustChangePassword: false },
    });

    try {
      // Log in as jennifer.a@example.com (role = REQUESTER)
      const loginRes = await request
        .post("/api/auth/login")
        .send({
          email: "jennifer.a@example.com",
          password: "Password123!",
        });

      expect(loginRes.status).toBe(200);
      const cookieHeader = getCookieHeader(loginRes);

      // Ensure mustChangePassword is false in DB before calling protected endpoints
      await prisma.user.update({
        where: { email: "jennifer.a@example.com" },
        data: { mustChangePassword: false },
      });

      // Requester accessing staff tickets queue endpoint -> 403 Forbidden
      const staffRes = await request
        .get("/api/staff/tickets")
        .set("Cookie", cookieHeader);

      expect(staffRes.status).toBe(403);
      expect(staffRes.body.code).toBe("FORBIDDEN");

      // Requester accessing admin users endpoint -> 403 Forbidden
      const adminRes = await request
        .get("/api/admin/users")
        .set("Cookie", cookieHeader);

      expect(adminRes.status).toBe(403);
      expect(adminRes.body.code).toBe("FORBIDDEN");
    } finally {
      // Restore initial mustChangePassword value
      await prisma.user.update({
        where: { email: "jennifer.a@example.com" },
        data: { mustChangePassword: initialMustChangePassword },
      });
    }
  });

  it("AUTHZ-API-04: Authorized IT_STAFF user accessing /api/staff/tickets returns 200 OK", async () => {
    const user = await prisma.user.findUnique({ where: { email: "staff.somchai@example.com" } });
    const initialMustChangePassword = user?.mustChangePassword ?? true;

    await prisma.user.update({
      where: { email: "staff.somchai@example.com" },
      data: { mustChangePassword: false },
    });

    try {
      const loginRes = await request
        .post("/api/auth/login")
        .send({
          email: "staff.somchai@example.com",
          password: "Password123!",
        });

      expect(loginRes.status).toBe(200);
      const cookieHeader = getCookieHeader(loginRes);

      const staffRes = await request
        .get("/api/staff/tickets")
        .set("Cookie", cookieHeader);

      expect(staffRes.status).toBe(200);
      expect(Array.isArray(staffRes.body.tickets)).toBe(true);
    } finally {
      await prisma.user.update({
        where: { email: "staff.somchai@example.com" },
        data: { mustChangePassword: initialMustChangePassword },
      });
    }
  });
});
