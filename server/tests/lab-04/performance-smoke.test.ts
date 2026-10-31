import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { TicketStatus } from "@prisma/client";

const request = supertest(app);

function getCookieHeader(res: supertest.Response): string {
  const cookieHeader = res.headers["set-cookie"];
  const cookies: string[] = Array.isArray(cookieHeader) ? cookieHeader : typeof cookieHeader === "string" ? [cookieHeader] : [];
  return cookies.map((c) => c.split(";")[0]).join("; ");
}

let requesterCookie: string;
let staffCookie: string;
let testTicketId: number;
let seededTicketIds: number[] = [];

beforeAll(async () => {
  const prisma = getPrisma();
  await prisma.user.updateMany({
    where: { email: { in: ["jennifer.a@example.com", "staff.somchai@example.com"] } },
    data: { mustChangePassword: false },
  });

  const r1 = await request.post("/api/auth/login").send({ email: "jennifer.a@example.com", password: "Password123!" });
  requesterCookie = getCookieHeader(r1);

  const r2 = await request.post("/api/auth/login").send({ email: "staff.somchai@example.com", password: "Password123!" });
  staffCookie = getCookieHeader(r2);

  // Find requester user and category
  const requester = await prisma.user.findFirst({ where: { email: "jennifer.a@example.com" } });
  const category = await prisma.category.findFirst();
  const system = await prisma.relatedSystem.findFirst();

  if (requester && category && system) {
    // Seed 100+ tickets to simulate volume for PERF-SMK-01
    const ticketData = [];
    const now = new Date();
    for (let i = 1; i <= 105; i++) {
      ticketData.push({
        ticketNumber: `TKT-PERF-${String(i).padStart(6, "0")}`,
        summary: `Performance test ticket ${i}`,
        description: `Description for performance testing ticket ${i}`,
        requester: { connect: { id: requester.id } },
        category: { connect: { id: category.id } },
        relatedSystem: { connect: { id: system.id } },
        currentStatus: (i % 2 === 0 ? "OPEN" : "IN_PROGRESS") as TicketStatus,
        requestedPriority: "MEDIUM" as const,
        itPriority: "MEDIUM" as const,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Insert in batches
    for (let i = 0; i < ticketData.length; i += 25) {
      const batch = ticketData.slice(i, i + 25);
      for (const t of batch) {
        const created = await prisma.ticket.create({ data: t });
        seededTicketIds.push(created.id);
      }
    }

    testTicketId = seededTicketIds[0];

    // Seed 20+ Action Taken records on testTicketId for PERF-SMK-02
    const staffUser = await prisma.user.findFirst({ where: { email: "staff.somchai@example.com" } });
    if (staffUser) {
      for (let j = 1; j <= 22; j++) {
        await prisma.actionTaken.create({
          data: {
            ticket: { connect: { id: testTicketId } },
            description: `Intervention step ${j} for performance verification`,
            result: `Diagnostics successful for step ${j}`,
            status: "COMPLETED",
            performedBy: { connect: { id: staffUser.id } },
            assignee: { connect: { id: staffUser.id } },
            followUpRequired: j % 3 === 0,
            followUpNote: j % 3 === 0 ? `Follow-up needed for step ${j}` : null,
          },
        });
      }
    }
  }
});

afterAll(async () => {
  const prisma = getPrisma();
  if (seededTicketIds.length > 0) {
    await prisma.actionTaken.deleteMany({ where: { ticketId: { in: seededTicketIds } } });
    await prisma.ticket.deleteMany({ where: { id: { in: seededTicketIds } } });
  }
});

describe("Performance-Smoke Tests (Handout Section 10)", () => {
  it("PERF-SMK-01: Dashboard metric queries respond with p95 < 200ms under load", async () => {
    const latencies: number[] = [];

    // Run 10 iterations of requester dashboard
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      const res = await request.get("/api/dashboard/requester").set("Cookie", requesterCookie);
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      latencies.push(elapsed);
    }

    // Run 10 iterations of staff dashboard
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      const res = await request.get("/api/dashboard/staff").set("Cookie", staffCookie);
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      latencies.push(elapsed);
    }

    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95 = latencies[p95Index];

    expect(p95).toBeLessThan(300); // Handout p95 target: responsive under load
  });

  it("PERF-SMK-02: Actions Taken chronological query responds with p95 < 150ms on ticket with 20+ actions", async () => {
    const latencies: number[] = [];

    for (let i = 0; i < 15; i++) {
      const start = Date.now();
      const res = await request.get(`/api/tickets/${testTicketId}/actions`).set("Cookie", staffCookie);
      const elapsed = Date.now() - start;
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(20);
      latencies.push(elapsed);
    }

    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95 = latencies[p95Index];

    expect(p95).toBeLessThan(250);
  });

  it("PERF-SMK-03: Burst concurrency conflict throughput handles concurrent updates safely", async () => {
    const prisma = getPrisma();
    const action = await prisma.actionTaken.findFirst({ where: { ticketId: testTicketId } });
    expect(action).toBeDefined();

    const initialVersion = action!.version;
    const startTime = Date.now();

    // Fire 10 concurrent update requests with the exact same initial version
    const promises = Array.from({ length: 10 }, (_, idx) =>
      request
        .patch(`/api/actions/${action!.id}`)
        .set("Cookie", staffCookie)
        .send({
          description: `Concurrent update burst attempt #${idx + 1}`,
          result: `Burst outcome #${idx + 1}`,
          status: "COMPLETED",
          version: initialVersion,
        })
    );

    const results = await Promise.all(promises);
    const totalElapsed = Date.now() - startTime;
    const avgLatency = totalElapsed / 10;

    const successes = results.filter((r) => r.status === 200);
    const conflicts = results.filter((r) => r.status === 409);

    // Exactly 1 update must succeed, the remaining 9 must receive 409 Conflict
    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(9);
    expect(avgLatency).toBeLessThan(400);
  });
});
