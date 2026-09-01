import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("POST /api/tickets", () => {
  it("creates a new ticket when valid data and x-requester-id are provided", async () => {
    const catRes = await request(app).get("/api/categories");
    expect(catRes.status).toBe(200);
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    expect(sysRes.status).toBe(200);
    const relatedSystemId = sysRes.body[0].id;

    const reqRes = await request(app).get("/api/requesters");
    expect(reqRes.status).toBe(200);
    const requesterId = reqRes.body[0].id;

    const ticketData = {
      summary: "VPN Connection drops frequently",
      description: "When connecting via home Wi-Fi, the VPN disconnects every 10-15 minutes.",
      categoryId,
      relatedSystemId,
      requestedPriority: "HIGH",
    };

    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send(ticketData);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(res.body.currentStatus).toBe("NEW");
  });

  it("returns 400 when x-requester-id header is missing", async () => {
    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;
    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    const res = await request(app).post("/api/tickets").send({
      summary: "Missing header test ticket",
      description: "Description long enough for validation",
      categoryId,
      relatedSystemId,
      requestedPriority: "LOW",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing x-requester-id header");
  });

  it("returns 400 when summary or description is invalid", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Bad",
        description: "Short",
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "MEDIUM",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
