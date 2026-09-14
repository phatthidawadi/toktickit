import { describe, it, expect } from "vitest";
import { getPrisma } from "../../src/prisma.js";
import bcrypt from "bcryptjs";

describe("Database Migration and Seed Verification (MIG-API-01)", () => {
  const prisma = getPrisma();

  it("seeds exactly 10 users with correct role and status splits per Section 5.3", async () => {
    const allUsers = await prisma.user.findMany();
    expect(allUsers.length).toBe(10);

    const requesters = allUsers.filter((u) => u.role === "REQUESTER");
    expect(requesters.length).toBe(5);
    expect(requesters.filter((u) => u.isActive).length).toBe(4);
    expect(requesters.filter((u) => !u.isActive).length).toBe(1);
    expect(requesters.find((u) => u.email === "alex.t@example.com")?.isActive).toBe(false);

    const itStaff = allUsers.filter((u) => u.role === "IT_STAFF");
    expect(itStaff.length).toBe(4);
    expect(itStaff.filter((u) => u.isActive).length).toBe(3);
    expect(itStaff.filter((u) => !u.isActive).length).toBe(1);
    expect(itStaff.find((u) => u.email === "staff.inactive@example.com")?.isActive).toBe(false);

    const admins = allUsers.filter((u) => u.role === "ADMINISTRATOR");
    expect(admins.length).toBe(1);
    expect(admins[0].isActive).toBe(true);
    expect(admins[0].email).toBe("admin.toktickit@example.com");
  });

  it("sets default hashed password Password123! and mustChangePassword=true for seed users", async () => {
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin.toktickit@example.com" },
    });
    expect(adminUser).not.toBeNull();
    expect(adminUser?.mustChangePassword).toBe(true);

    const matches = await bcrypt.compare("Password123!", adminUser!.passwordHash);
    expect(matches).toBe(true);
  });

  it("verifies Lab 3 schema models and relations exist in database", async () => {
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThan(0);

    const relatedSystems = await prisma.relatedSystem.findMany();
    expect(relatedSystems.length).toBeGreaterThan(0);
  });
});
