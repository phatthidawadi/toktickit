import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets/:id", () => {
  it("returns 200 OK with ticket details when requesting owned ticket", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    // Create a ticket for this requester
    const createRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Detail Test Ticket Summary",
        description: "Detailed description for detail test ticket",
        categoryId,
        relatedSystemId,
        requestedPriority: "HIGH",
      });

    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.id;

    // Fetch ticket detail
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticketId);
    expect(res.body.summary).toBe("Detail Test Ticket Summary");
    expect(res.body.category).toBeDefined();
  });

  it("returns 403 Forbidden when requesting a ticket owned by another requester (AC-03)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterA = reqRes.body[0].id;
    const requesterB = reqRes.body[1].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    // Create ticket for Requester A
    const createRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterA))
      .send({
        summary: "Requester A Private Ticket",
        description: "Description of ticket belonging to Requester A",
        categoryId,
        relatedSystemId,
        requestedPriority: "LOW",
      });

    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.id;

    // Requester B attempts to view Requester A's ticket
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("x-requester-id", String(requesterB));

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Access denied");
  });

  it("returns 404 Not Found for non-existent ticket ID", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .get("/api/tickets/999999")
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Ticket not found");
  });
});
