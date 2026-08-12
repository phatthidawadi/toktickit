import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
void request; void app;

// Issue 4 — write this test yourself, using health.test.ts as the pattern.
// Requires the DB to be migrated and seeded first.
// It should assert: GET /api/categories returns 200 and the four seeded
// category names in id order.
describe("GET /api/categories", () => {
  it("returns the four seeded categories in id order", async () => {
    const response = await request(app).get("/api/categories");
    expect(response.status).toBe(200);
    
    const categories = response.body;
    expect(categories).toHaveLength(4);
    
    // Check order and names
    expect(categories[0].name).toBe("Account and Access");
    expect(categories[1].name).toBe("Hardware");
    expect(categories[2].name).toBe("Software");
    expect(categories[3].name).toBe("Network");
    
    // Check IDs are in ascending order
    for (let i = 0; i < categories.length - 1; i++) {
      expect(categories[i].id).toBeLessThan(categories[i+1].id);
    }
  });
});
