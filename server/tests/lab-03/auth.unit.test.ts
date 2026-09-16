import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePasswordStrength,
} from "../../src/utils/auth.js";

describe("UNIT-01: Password Security & Hashing Helper Functions", () => {
  it("should generate valid bcrypt hash and successfully verify correct password", async () => {
    const password = "Password123!";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(20);
    expect(hash).not.toEqual(password);

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword("WrongPassword123!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should validate password strength rules correctly", () => {
    expect(validatePasswordStrength("Pass123!").valid).toBe(true);

    expect(validatePasswordStrength("short1!").valid).toBe(false); // < 8 chars
    expect(validatePasswordStrength("lowercase123!").valid).toBe(false); // no uppercase
    expect(validatePasswordStrength("UPPERCASE123!").valid).toBe(false); // no lowercase
    expect(validatePasswordStrength("NoNumberPassword!").valid).toBe(false); // no number
  });
});

describe("UNIT-02: JWT Session Token Manager", () => {
  it("should generate valid 8-hour JWT token and verify payload correctly", () => {
    const payload = {
      userId: 1,
      email: "jennifer.a@example.com",
      role: "REQUESTER",
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it("should return null for tampered or invalid JWT tokens", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature";
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
