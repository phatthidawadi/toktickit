import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/tickets/:id", () => {
  it("returns 200 OK with ticket details when requesting owned ticket", async () => {
    // 1. Fetch requesters
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get("/api/related-systems");
    const relatedSystemId = sysRes.body[0].id;

    // 2. Create a ticket for this requester
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

    const ticketId = createRes.body.id;

    // 3. Fetch ticket detail
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ticketId);
    expect(res.body.summary).toBe("Detail Test Ticket Summary");
    expect(res.body.category).toBeDefined();
    expect(res.body.requester).toBeDefined();
    expect(res.body.requester.id).toBe(requesterId);
    expect(res.body.requester.name).toBeDefined();
    expect(res.body.requester.email).toBeDefined();
  });

  it("returns BOTH active and soft-removed attachments with metadata after refresh", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;
    const catRes = await request(app).get("/api/categories");
    const sysRes = await request(app).get("/api/related-systems");

    const pathMod = await import("path");
    const fsMod = await import("fs");

    const createRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Attachment Persistence Ticket",
        description: "Testing active and soft-removed attachments in detail view",
        categoryId: catRes.body[0].id,
        relatedSystemId: sysRes.body[0].id,
        requestedPriority: "MEDIUM",
      });

    const ticketId = createRes.body.id;

    // Upload attachment 1
    const path1 = pathMod.default.join(process.cwd(), "persist1.pdf");
    fsMod.default.writeFileSync(path1, "%PDF-1.4 active file");
    const up1 = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", path1);
    fsMod.default.unlinkSync(path1);

    // Upload attachment 2
    const path2 = pathMod.default.join(process.cwd(), "persist2.pdf");
    fsMod.default.writeFileSync(path2, "%PDF-1.4 file to be removed");
    const up2 = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", path2);
    fsMod.default.unlinkSync(path2);

    // Soft remove attachment 2
    await request(app)
      .delete(`/api/attachments/${up2.body.id}`)
      .set("x-requester-id", String(requesterId))
      .send({ reason: "Removing duplicate upload" });

    // Fetch ticket detail again (simulating refresh / re-fetch)
    const res = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("x-requester-id", String(requesterId));

    expect(res.status).toBe(200);
    expect(res.body.attachments).toHaveLength(2);

    const activeAtt = res.body.attachments.find((a: { id: number }) => a.id === up1.body.id);
    const removedAtt = res.body.attachments.find((a: { id: number }) => a.id === up2.body.id);

    expect(activeAtt.isRemoved).toBe(false);
    expect(removedAtt.isRemoved).toBe(true);
    expect(removedAtt.removedReason).toBe("Removing duplicate upload");
    expect(removedAtt.removedAt).toBeDefined();
    expect(removedAtt.createdAt).toBeDefined();
  });

  it("returns 403 Forbidden when requesting a ticket owned by another requester (AC-03)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterA = reqRes.body[0].id;
    const requesterB = reqRes.body[1].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get("/api/related-systems");
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
