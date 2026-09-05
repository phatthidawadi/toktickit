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

    const sysRes = await request(app).get("/api/related-systems");
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

    const ticketId = ticketRes.body.id;

    // Create temp test file (PDF is allowed)
    const tempFilePath = path.join(process.cwd(), "temp_test_doc.pdf");
    fs.writeFileSync(tempFilePath, "%PDF-1.4 sample pdf content for attachment test");

    // Upload attachment
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", tempFilePath);

    fs.unlinkSync(tempFilePath);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.originalName).toBe("temp_test_doc.pdf");
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

    fs.unlinkSync(tempExePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("File type not allowed");
  });

  it("soft-removes attachment and returns 410 Gone on download attempt (AC-06)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const catRes = await request(app).get("/api/categories");
    const categoryId = catRes.body[0].id;

    const sysRes = await request(app).get("/api/related-systems");
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

    const ticketId = ticketRes.body.id;

    const tempFilePath = path.join(process.cwd(), "temp_remove_test.pdf");
    fs.writeFileSync(tempFilePath, "%PDF-1.4 File to be soft removed");

    const uploadRes = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", tempFilePath);

    fs.unlinkSync(tempFilePath);

    const attachmentId = uploadRes.body.id;

    // Soft-remove attachment with reason
    const deleteRes = await request(app)
      .delete(`/api/attachments/${attachmentId}`)
      .set("x-requester-id", String(requesterId))
      .send({ reason: "Uploaded sensitive log file by mistake" });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.isRemoved).toBe(true);
    expect(deleteRes.body.removedReason).toBe("Uploaded sensitive log file by mistake");

    // Attempt download -> expect 410 Gone
    const downloadRes = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .set("x-requester-id", String(requesterId));

    expect(downloadRes.status).toBe(410);
    expect(downloadRes.body.error).toContain("Attachment has been removed");
  });

  it("rejects 6th active attachment upload with HTTP 400 Bad Request", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;
    const catRes = await request(app).get("/api/categories");
    const sysRes = await request(app).get("/api/related-systems");

    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Attachment Limit Ticket",
        description: "Testing max 5 active attachments per ticket limit",
        categoryId: catRes.body[0].id,
        relatedSystemId: sysRes.body[0].id,
        requestedPriority: "MEDIUM",
      });

    const ticketId = ticketRes.body.id;

    // Upload 5 active attachments
    for (let i = 1; i <= 5; i++) {
      const tempPath = path.join(process.cwd(), `file_${i}.pdf`);
      fs.writeFileSync(tempPath, `%PDF-1.4 file ${i} content`);
      const upRes = await request(app)
        .post(`/api/tickets/${ticketId}/attachments`)
        .set("x-requester-id", String(requesterId))
        .attach("file", tempPath);
      fs.unlinkSync(tempPath);
      expect(upRes.status).toBe(201);
    }

    // 6th upload must be rejected with 400
    const temp6Path = path.join(process.cwd(), "file_6.pdf");
    fs.writeFileSync(temp6Path, "%PDF-1.4 file 6 content");
    const res6 = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", temp6Path);
    fs.unlinkSync(temp6Path);

    expect(res6.status).toBe(400);
    expect(res6.body.error).toContain("Maximum active attachments limit");
  });

  it("does NOT count soft-removed attachments toward active limit of 5", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;
    const catRes = await request(app).get("/api/categories");
    const sysRes = await request(app).get("/api/related-systems");

    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterId))
      .send({
        summary: "Soft Remove Count Ticket",
        description: "Testing soft removal exclusion from active limit",
        categoryId: catRes.body[0].id,
        relatedSystemId: sysRes.body[0].id,
        requestedPriority: "LOW",
      });

    const ticketId = ticketRes.body.id;
    const uploadedIds: number[] = [];

    for (let i = 1; i <= 5; i++) {
      const tempPath = path.join(process.cwd(), `soft_file_${i}.png`);
      fs.writeFileSync(tempPath, "PNG dummy image content");
      const upRes = await request(app)
        .post(`/api/tickets/${ticketId}/attachments`)
        .set("x-requester-id", String(requesterId))
        .attach("file", tempPath);
      fs.unlinkSync(tempPath);
      uploadedIds.push(upRes.body.id);
    }

    // Soft-remove one attachment
    const delRes = await request(app)
      .delete(`/api/attachments/${uploadedIds[0]}`)
      .set("x-requester-id", String(requesterId))
      .send({ reason: "Removing duplicate file attachment" });
    expect(delRes.status).toBe(200);

    // Now active count is 4, uploading another file must succeed
    const tempNewPath = path.join(process.cwd(), "new_file_after_remove.pdf");
    fs.writeFileSync(tempNewPath, "%PDF-1.4 new file after remove");
    const newUpRes = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set("x-requester-id", String(requesterId))
      .attach("file", tempNewPath);
    fs.unlinkSync(tempNewPath);

    expect(newUpRes.status).toBe(201);
  });

  it("rejects prohibited file types (.txt, .zip, .js, .py, .mp4) with 400 Bad Request", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const invalidTypes = [
      { name: "test.txt", content: "hello world" },
      { name: "archive.zip", content: "zip content" },
      { name: "script.js", content: "console.log('hi')" },
    ];

    for (const item of invalidTypes) {
      const tempPath = path.join(process.cwd(), item.name);
      fs.writeFileSync(tempPath, item.content);
      const res = await request(app)
        .post("/api/tickets/1/attachments")
        .set("x-requester-id", String(requesterId))
        .attach("file", tempPath);
      fs.unlinkSync(tempPath);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("File type not allowed");
    }
  });

  it("rejects oversized file (>5MB) with 400 Bad Request (AC-05)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    // Create a 5.5 MB dummy file buffer
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    const tempLargePath = path.join(process.cwd(), "oversized_file.pdf");
    fs.writeFileSync(tempLargePath, largeBuffer);

    const res = await request(app)
      .post("/api/tickets/1/attachments")
      .set("x-requester-id", String(requesterId))
      .attach("file", tempLargePath);

    if (fs.existsSync(tempLargePath)) {
      fs.unlinkSync(tempLargePath);
    }

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/5 MB|exceeds|limit/i);
  });

  it("rejects soft removal without a valid reason payload with 400 Bad Request", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterId = reqRes.body[0].id;

    const res = await request(app)
      .delete("/api/attachments/1")
      .set("x-requester-id", String(requesterId))
      .send({ reason: "bad" }); // less than 5 characters

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/reason/i);
  });

  it("rejects cross-requester attachment download with 403 Forbidden (AC-03)", async () => {
    const reqRes = await request(app).get("/api/requesters");
    const requesterA = reqRes.body[0].id;
    const requesterB = reqRes.body[1].id;

    // Create ticket & attachment for Requester A
    const ticketRes = await request(app)
      .post("/api/tickets")
      .set("x-requester-id", String(requesterA))
      .send({
        summary: "Requester A Attachment Ticket",
        description: "Testing cross requester attachment protection",
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "LOW",
      });

    const tempFilePath = path.join(process.cwd(), "requester_a_doc.pdf");
    fs.writeFileSync(tempFilePath, "%PDF-1.4 Private document of Requester A");

    const uploadRes = await request(app)
      .post(`/api/tickets/${ticketRes.body.id}/attachments`)
      .set("x-requester-id", String(requesterA))
      .attach("file", tempFilePath);

    fs.unlinkSync(tempFilePath);
    const attachmentId = uploadRes.body.id;

    // Requester B attempts download
    const res = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .set("x-requester-id", String(requesterB));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access denied/i);
  });
});
