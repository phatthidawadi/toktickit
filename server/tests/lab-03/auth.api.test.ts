import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

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

describe("Authentication & Session API Endpoints (AUTH-API-01 to AUTH-API-07)", () => {
  const prisma = getPrisma();

  beforeAll(async () => {
    // Ensure DB connection
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("AUTH-API-01: POST /api/auth/login with valid credentials sets HTTP-only cookie and returns user", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({
        email: "Jennifer.A@Example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("jennifer.a@example.com");
    expect(res.body.user.role).toBe("REQUESTER");
    expect(typeof res.body.user.mustChangePassword).toBe("boolean");

    const cookies = getCookies(res);
    expect(cookies.some((c: string) => c.includes("toktickit_session="))).toBe(true);
    expect(cookies.some((c: string) => c.toLowerCase().includes("httponly"))).toBe(true);
  });

  it("AUTH-API-02: POST /api/auth/login with invalid password or inactive user returns 401 Unauthorized", async () => {
    // Invalid password
    const resWrongPass = await request
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "WrongPassword999!",
      });

    expect(resWrongPass.status).toBe(401);
    expect(resWrongPass.body.code).toBe("INVALID_CREDENTIALS");

    // Inactive user
    const resInactive = await request
      .post("/api/auth/login")
      .send({
        email: "alex.t@example.com", // Inactive user in seed
        password: "Password123!",
      });

    expect(resInactive.status).toBe(401);
    expect(resInactive.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("AUTH-API-03: GET /api/auth/me returns authenticated user details or 401 if unauthenticated", async () => {
    // 1. Without cookie -> 401
    const resUnauth = await request.get("/api/auth/me");
    expect(resUnauth.status).toBe(401);

    // 2. With valid login session cookie -> 200 OK
    const loginRes = await request
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "Password123!",
      });

    const cookieHeader = getCookieHeader(loginRes);

    const resMe = await request
      .get("/api/auth/me")
      .set("Cookie", cookieHeader);

    expect(resMe.status).toBe(200);
    expect(resMe.body.user.email).toBe("jennifer.a@example.com");
  });

  it("AUTH-API-04: POST /api/auth/logout clears session cookie with Max-Age=0", async () => {
    const res = await request.post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("logged out");

    const cookies = getCookies(res);
    expect(cookies.some((c: string) => c.includes("Max-Age=0") || c.includes("Expires=Thu, 01 Jan 1970"))).toBe(true);
  });

  it("AUTH-API-07: POST /api/auth/change-password with incorrect current password returns 400 Bad Request", async () => {
    const loginRes = await request
      .post("/api/auth/login")
      .send({
        email: "michael.b@example.com",
        password: "Password123!",
      });

    const cookieHeader = getCookieHeader(loginRes);

    const res = await request
      .post("/api/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({
        currentPassword: "WrongCurrentPassword123!",
        newPassword: "NewValidPassword123!",
        confirmPassword: "NewValidPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INCORRECT_CURRENT_PASSWORD");
  });

  it("AUTH-API-06: POST /api/auth/change-password with weak or identical password returns 400 Bad Request", async () => {
    const loginRes = await request
      .post("/api/auth/login")
      .send({
        email: "michael.b@example.com",
        password: "Password123!",
      });

    const cookieHeader = getCookieHeader(loginRes);

    // Weak password (short)
    const resWeak = await request
      .post("/api/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({
        currentPassword: "Password123!",
        newPassword: "weak",
        confirmPassword: "weak",
      });

    expect(resWeak.status).toBe(400);

    // Identical password
    const resIdentical = await request
      .post("/api/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({
        currentPassword: "Password123!",
        newPassword: "Password123!",
        confirmPassword: "Password123!",
      });

    expect(resIdentical.status).toBe(400);
    expect(resIdentical.body.code).toBe("PASSWORD_NOT_DIFFERENT");
  });

  it("AUTH-API-05: POST /api/auth/change-password valid update changes password and clears mustChangePassword flag", async () => {
    const defaultHash = await hashPassword("Password123!");
    await prisma.user.update({
      where: { email: "sarah.j@example.com" },
      data: { passwordHash: defaultHash, mustChangePassword: true },
    });

    try {
      const loginRes = await request
        .post("/api/auth/login")
        .send({
          email: "sarah.j@example.com",
          password: "Password123!",
        });

      expect(loginRes.status).toBe(200);
      const cookieHeader = getCookieHeader(loginRes);

      const resChange = await request
        .post("/api/auth/change-password")
        .set("Cookie", cookieHeader)
        .send({
          currentPassword: "Password123!",
          newPassword: "BrandNewPassword2026!",
          confirmPassword: "BrandNewPassword2026!",
        });

      expect(resChange.status).toBe(200);
      expect(resChange.body.message).toContain("successfully");

      // Verify login with new password works
      const reloginRes = await request
        .post("/api/auth/login")
        .send({
          email: "sarah.j@example.com",
          password: "BrandNewPassword2026!",
        });

      expect(reloginRes.status).toBe(200);
      expect(reloginRes.body.user.mustChangePassword).toBe(false);
    } finally {
      // Guaranteed Cleanup: restore default password hash
      await prisma.user.update({
        where: { email: "sarah.j@example.com" },
        data: { passwordHash: defaultHash, mustChangePassword: true },
      });
    }
  });

  it("SEC-AUTH-01: Tampered or invalid JWT cookie returns 401 Unauthorized", async () => {
    const invalidCookie = "toktickit_session=invalid.tampered.jwt.payload";
    const res = await request
      .get("/api/auth/me")
      .set("Cookie", invalidCookie);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("SEC-AUTH-02: Mandatory mustChangePassword = true blocks non-exempt protected paths with 403 Forbidden", async () => {
    await prisma.user.update({
      where: { email: "jennifer.a@example.com" },
      data: { mustChangePassword: true },
    });

    const loginRes = await request
      .post("/api/auth/login")
      .send({
        email: "jennifer.a@example.com",
        password: "Password123!",
      });

    const cookieHeader = getCookieHeader(loginRes);

    // Call a non-exempt protected route (e.g. GET /api/auth/protected-sample)
    const res = await request
      .get("/api/auth/protected-sample")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("MUST_CHANGE_PASSWORD");
  });

  it("SEC-AUTH-03: Excessive failed login attempts return 429 Too Many Requests (Rate Limiting)", async () => {
    const targetEmail = "rate.limit.test@example.com";

    for (let i = 0; i < 5; i++) {
      await request
        .post("/api/auth/login")
        .send({
          email: targetEmail,
          password: "WrongPassword123!",
        });
    }

    const rateLimitedRes = await request
      .post("/api/auth/login")
      .send({
        email: targetEmail,
        password: "WrongPassword123!",
      });

    expect(rateLimitedRes.status).toBe(429);
    expect(rateLimitedRes.body.code).toBe("TOO_MANY_REQUESTS");
  });

  it("SEC-AUTH-04: Header x-requester-id without session cookie cannot bypass authentication and returns 401", async () => {
    const res = await request
      .get("/api/auth/me")
      .set("x-requester-id", "1");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });
});
