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

describe("Administrator User Management API Endpoints (ADMIN-API-01 to ADMIN-API-05, API-ADM-05)", () => {
  const prisma = getPrisma();
  let adminCookie: string;
  let staffCookie: string;
  let adminUserId: number;
  let createdUserId: number | null = null;

  beforeAll(async () => {
    // Ensure admin & staff have mustChangePassword = false for testing
    await prisma.user.updateMany({
      where: { email: { in: ["admin.toktickit@example.com", "staff.somsri@example.com"] } },
      data: { mustChangePassword: false },
    });

    const adminLoginRes = await request.post("/api/auth/login").send({
      email: "admin.toktickit@example.com",
      password: "Password123!",
    });
    adminCookie = getCookieHeader(adminLoginRes);
    adminUserId = adminLoginRes.body.user.id;

    const staffLoginRes = await request.post("/api/auth/login").send({
      email: "staff.somsri@example.com",
      password: "Password123!",
    });
    staffCookie = getCookieHeader(staffLoginRes);
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("ADMIN-API-01: GET /api/admin/users retrieves user accounts with search and role filters", async () => {
    // 1. Fetch all users
    const res = await request
      .get("/api/admin/users")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    // 2. Filter by role = IT_STAFF
    const staffRes = await request
      .get("/api/admin/users?role=IT_STAFF")
      .set("Cookie", adminCookie);

    expect(staffRes.status).toBe(200);
    expect(Array.isArray(staffRes.body)).toBe(true);
    expect(staffRes.body.every((u: any) => u.role === "IT_STAFF")).toBe(true);

    // 3. Search by name/email
    const searchRes = await request
      .get("/api/admin/users?search=jennifer")
      .set("Cookie", adminCookie);

    expect(searchRes.status).toBe(200);
    expect(Array.isArray(searchRes.body)).toBe(true);
    expect(searchRes.body.some((u: any) => u.email.includes("jennifer"))).toBe(true);
  });

  it("ADMIN-API-02: POST /api/admin/users creates new user account", async () => {
    const newUser = {
      name: "Test Admin Created User",
      email: "test.admin.created@example.com",
      role: "IT_STAFF",
      initialPassword: "Password123!",
      isActive: true,
    };

    const res = await request
      .post("/api/admin/users")
      .set("Cookie", adminCookie)
      .send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Admin Created User");
    expect(res.body.email).toBe("test.admin.created@example.com");
    expect(res.body.role).toBe("IT_STAFF");
    expect(res.body.mustChangePassword).toBe(true);
    expect(res.body.passwordHash).toBeUndefined(); // Sensitive data omitted

    createdUserId = res.body.id;
  });

  it("ADMIN-API-02: Reject duplicate email creation with 409 Conflict (BR-13)", async () => {
    const duplicateUser = {
      name: "Duplicate User Attempt",
      email: "TEST.ADMIN.CREATED@EXAMPLE.COM", // Case-insensitive duplicate
      role: "REQUESTER",
      initialPassword: "Password123!",
    };

    const res = await request
      .post("/api/admin/users")
      .set("Cookie", adminCookie)
      .send(duplicateUser);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("DUPLICATE_EMAIL");
  });

  it("API-ADM-05: PATCH /api/admin/users/:id update user and reject duplicate email (BR-13)", async () => {
    // 1. Valid update
    const updateRes = await request
      .patch(`/api/admin/users/${createdUserId}`)
      .set("Cookie", adminCookie)
      .send({ name: "Updated Admin User Name" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("Updated Admin User Name");

    // 2. Attempt to update email to an existing user's email -> 409 Conflict
    const dupRes = await request
      .patch(`/api/admin/users/${createdUserId}`)
      .set("Cookie", adminCookie)
      .send({ email: "jennifer.a@example.com" });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.code).toBe("DUPLICATE_EMAIL");
  });

  it("ADMIN-API-03: PATCH /api/admin/users/:id rejects Admin self-deactivation (BR-14)", async () => {
    const res = await request
      .patch(`/api/admin/users/${adminUserId}`)
      .set("Cookie", adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("SELF_DEACTIVATION_PROHIBITED");
  });

  it("ADMIN-API-04: PATCH /api/admin/users/:id rejects deactivating the last active Administrator (BR-15)", async () => {
    // Attempting to change admin.toktickit role away from ADMINISTRATOR when it is the last active admin
    const res = await request
      .patch(`/api/admin/users/${adminUserId}`)
      .set("Cookie", adminCookie)
      .send({ role: "IT_STAFF" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("LAST_ADMIN_PROTECTION");
  });

  it("ADMIN-API-05: POST /api/admin/users/:id/reset-password resets initial password (FR-20)", async () => {
    const res = await request
      .post(`/api/admin/users/${createdUserId}/reset-password`)
      .set("Cookie", adminCookie)
      .send({ initialPassword: "NewResetPassword123!" });

    expect(res.status).toBe(200);
    expect(res.body.user.mustChangePassword).toBe(true);

    // Verify user can log in with new password
    const loginRes = await request.post("/api/auth/login").send({
      email: "test.admin.created@example.com",
      password: "NewResetPassword123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.mustChangePassword).toBe(true);
  });

  it("Security RBAC: Non-Administrator (IT Staff) calling /api/admin/users receives 403 Forbidden", async () => {
    const res = await request
      .get("/api/admin/users")
      .set("Cookie", staffCookie);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
