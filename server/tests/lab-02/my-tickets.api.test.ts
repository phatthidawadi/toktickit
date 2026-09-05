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

  it("filters tickets by search keyword", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .get("/api/tickets?search=battery")
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();
  });

  it("returns 400 when x-requester-id header is missing", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing x-requester-id");
  });

  it("supports sort by priority_desc", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .get("/api/tickets?sort=priority_desc")
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.tickets).toBeDefined();
  });
});
