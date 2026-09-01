import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("POST /api/tickets", () => {
  it("creates a new ticket when valid data and x-requester-id are provided", async () => {
    // 1. Fetch categories and related systems first
    const catRes = await request(app).get("/api/categories");
    expect(catRes.status).toBe(200);
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    expect(sysRes.status).toBe(200);
    const relatedSystemId = sysRes.body[0].id;

    // 2. Fetch requesters
    const reqRes = await request(app).get("/api/requesters");
    expect(reqRes.status).toBe(200);
    const requesterId = reqRes.body[0].id;

    // 3. Submit valid ticket
    const ticketData = {
      summary: "Laptop battery drains quickly",
      description: "My laptop battery is draining much faster than usual even when the system is idle.",
      categoryId,
      relatedSystemId,
      requestedPriority: "MEDIUM",
    };

    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send(ticketData);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.currentStatus).toBe("NEW");
    expect(res.body.summary).toBe(ticketData.summary);
    expect(res.body.requesterId).toBe(requesterId);
  });

  it("returns 400 when x-requester-id is missing", async () => {
    const res = await request(app).post("/api/tickets").send({
      summary: "Test Ticket Summary",
      description: "Test description for ticket submission",
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: "LOW",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing x-requester-id");
  });

  it("returns 400 when summary or description is invalid", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Bad", // Less than 5 chars
        description: "Short", // Less than 10 chars
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "LOW",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Summary");
  });
});
