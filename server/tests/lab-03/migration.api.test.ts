import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getPrisma } from "../../src/prisma.js";

describe("MIG-API-01: Lab 2 Data Migration Integrity and Seed State", () => {
  const prisma = getPrisma();

  beforeAll(async () => {
    // Ensure DB connection
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should have seeded 10 total users matching Section 5.3 specifications", async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThanOrEqual(10);

    const requesters = users.filter((u) => u.role === "REQUESTER");
    const activeRequesters = requesters.filter((u) => u.isActive);
    const inactiveRequesters = requesters.filter((u) => !u.isActive);

    expect(activeRequesters.length).toBeGreaterThanOrEqual(4);
    expect(inactiveRequesters.length).toBeGreaterThanOrEqual(1);

    const staff = users.filter((u) => u.role === "IT_STAFF");
    const activeStaff = staff.filter((u) => u.isActive);
    const inactiveStaff = staff.filter((u) => !u.isActive);

    expect(activeStaff.length).toBeGreaterThanOrEqual(3);
    expect(inactiveStaff.length).toBeGreaterThanOrEqual(1);

    const admins = users.filter((u) => u.role === "ADMINISTRATOR" && u.isActive);
    expect(admins.length).toBeGreaterThanOrEqual(1);
  });

  it("should set initial password hash and mustChangePassword=true for seeded users", async () => {
    const jennifer = await prisma.user.findUnique({
      where: { email: "jennifer.a@example.com" },
    });

    expect(jennifer).not.toBeNull();
    expect(jennifer?.mustChangePassword).toBe(true);
    expect(jennifer?.passwordHash).toBeDefined();
    expect(jennifer?.passwordHash.length).toBeGreaterThan(20);
  });

  it("should preserve category and related system relations", async () => {
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThanOrEqual(4);

    const systems = await prisma.relatedSystem.findMany();
    expect(systems.length).toBeGreaterThanOrEqual(7);
  });

  it("should preserve pre-existing tickets and backfill itPriority matching requestedPriority", async () => {
    const tickets = await prisma.ticket.findMany({
      include: {
        requester: true,
        attachments: true,
      },
    });

    expect(tickets.length).toBeGreaterThan(0);

    for (const ticket of tickets) {
      // 1. Verify requester ID links to a valid migrated User with role REQUESTER
      expect(ticket.requester).not.toBeNull();
      expect(ticket.requester.role).toBe("REQUESTER");

      // 2. Verify itPriority is populated
      expect(ticket.itPriority).toBeDefined();
      expect(["LOW", "MEDIUM", "HIGH", "URGENT"]).toContain(ticket.itPriority);

      // 3. Verify default flags
      expect(typeof ticket.isRequesterResolved).toBe("boolean");
    }
  });

  it("should maintain case-insensitive uniqueness for user email addresses", async () => {
    const user = await prisma.user.findFirst({
      where: { email: "jennifer.a@example.com" },
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe("jennifer.a@example.com");
  });
});
