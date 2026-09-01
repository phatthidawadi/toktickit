import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/requesters", () => {
  it("returns 200 with active Development Requesters", async () => {
    const res = await request(app).get("/api/requesters");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Verify inactive requesters are excluded
    const names = res.body.map((r: { name: string }) => r.name);
    expect(names).not.toContain("Alex Taylor");

    // Verify active requesters exist
    expect(names).toContain("Jennifer Anderson");
  });
});
