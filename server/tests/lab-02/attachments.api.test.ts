import { describe, it, expect } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../../src/app.js";

describe("Attachment Lifecycle API", () => {
  it("uploads valid attachment to ticket and returns 201 Created", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    // Create ticket
    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Attachment Test Ticket",
        description: "Testing attachment upload functionality",
        categoryId,
        relatedSystemId,
        requestedPriority: "MEDIUM",
      });

    expect(ticketRes.status).toBe(201);
    const ticketId = ticketRes.body.id;

    // Create temp test file
    const tempFilePath = path.join(process.cwd(), "temp_test_doc.txt");
    fs.writeFileSync(tempFilePath, "Sample log file content for testing attachment upload");

    // Upload attachment
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", tempFilePath);

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.originalName).toBe("temp_test_doc.txt");
    expect(res.body.isRemoved).toBe(false);
  });

  it("rejects invalid file type (.exe) with 400 Bad Request (AC-04)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const tempExePath = path.join(process.cwd(), "malicious_script.exe");
    fs.writeFileSync(tempExePath, "echo 'malicious payload'");

    const res = await request(app)
      .post("/api/tickets/1/attachments")
      .set("x-requester-id", String(requesterId))
      .attach("file", tempExePath);

    if (fs.existsSync(tempExePath)) {
      fs.unlinkSync(tempExePath);
    }

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("File type not allowed");
  });

  it("soft-removes attachment and returns 410 Gone on download attempt (AC-06)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get(`/api/related-systems?categoryId=${categoryId}`);
    const relatedSystemId = sysRes.body[0].id;

    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Soft Remove Test Ticket",
        description: "Testing soft removal of attachment",
        categoryId,
        relatedSystemId,
        requestedPriority: "LOW",
      });

    expect(ticketRes.status).toBe(201);
    const ticketId = ticketRes.body.id;

    const tempFilePath = path.join(process.cwd(), "temp_remove_test.txt");
    fs.writeFileSync(tempFilePath, "File to be soft removed");

    const uploadRes = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", tempFilePath);

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    expect(uploadRes.status).toBe(201);
    const attachmentId = uploadRes.body.id;

    // Soft-remove attachment with reason
    const deleteRes = await request(app)
      .delete(`/api/attachments/${attachmentId}`)
      .set("x-requester-id", String(requesterId))
      .send({ reason: "Uploaded sensitive log file by mistake" });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.attachment.isRemoved).toBe(true);

    // Attempt download -> expect 410 Gone
    const downloadRes = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .set("x-requester-id", String(requesterId));

    expect(downloadRes.status).toBe(410);
    expect(downloadRes.body.error).toContain("Attachment has been removed");
  });
});
