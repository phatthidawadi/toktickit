import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets", () => {
  it("returns paginated tickets belonging to the requester specified in x-requester-id", async () => {
    // 1. Fetch requesters
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    // 2. Fetch tickets
    const res = await request(app)
      .get("/api/tickets")
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);

    // Verify all returned tickets belong to requesterId
    res.body.tickets.forEach((ticket: { requesterId: number }) => {
      expect(ticket.requesterId).toBe(requesterId);
    });
  });

  it("filters tickets by search keyword matching description specifically", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;
    const catRes = await request(app).get("/api/categories");
    const sysRes = await request(app).get("/api/related-systems");

    const uniqueTerm = `desc_unique_${Date.now()}`;
    await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Generic Support Ticket",
        description: `This description contains the special token ${uniqueTerm} for testing search`,
        categoryId: catRes.body[0].id,
        relatedSystemId: sysRes.body[0].id,
        requestedPriority: "LOW",
      });

    const res = await request(app)
      .get(`/api/tickets?search=${uniqueTerm}`)
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.tickets.length).toBeGreaterThan(0);
    expect(res.body.tickets[0].description).toContain(uniqueTerm);
  });

  it("caps limit parameter at maximum 50 (returns limit 50 when limit=100 requested)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .get("/api/tickets?limit=100")
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });

  it("returns 400 when x-requester-id header is missing", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing x-requester-id");
  });

  it("supports sort by priority_desc in logical priority order (URGENT > HIGH > MEDIUM > LOW)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    const testKey = `PrioSortTest_${Date.now()}`;
    const priorities = ["LOW", "URGENT", "MEDIUM", "HIGH"];
    for (const prio of priorities) {
      const createRes = await request(app)
        .post("/api/tickets")
        .set("x-requester-id", String(requesterId))
        .send({
          summary: `${testKey} priority ${prio}`,
          description: `Detailed description for priority test ${prio} with enough length`,
          requestedPriority: prio,
          categoryId,
          relatedSystemId,
        });
      expect(createRes.status).toBe(201);
    }

    const res = await request(app)
      .get(`/api/tickets?sort=priority_desc&search=${testKey}`)
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();

    const returnedPriorities = res.body.tickets.map((t: { requestedPriority: string }) => t.requestedPriority);
    expect(returnedPriorities).toEqual(["URGENT", "HIGH", "MEDIUM", "LOW"]);
  });
});
