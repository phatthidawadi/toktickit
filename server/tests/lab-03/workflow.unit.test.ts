import { describe, it, expect } from "vitest";
import { isValidStatusTransition } from "../../src/utils/workflow.js";

describe("UNIT-03: Ticket status transition matrix validator (BR-10)", () => {
  it("permits valid transitions for IT Staff", () => {
    expect(isValidStatusTransition("NEW", "IN_PROGRESS", "IT_STAFF")).toBe(true);
    expect(isValidStatusTransition("NEW", "OPEN", "IT_STAFF")).toBe(true);
    expect(isValidStatusTransition("OPEN", "IN_PROGRESS", "IT_STAFF")).toBe(true); // OPEN->RESOLVED not allowed per Resolution Gate
    expect(isValidStatusTransition("IN_PROGRESS", "WAITING_FOR_REQUESTER", "IT_STAFF")).toBe(true);
    expect(isValidStatusTransition("IN_PROGRESS", "RESOLVED", "IT_STAFF")).toBe(true);
    expect(isValidStatusTransition("RESOLVED", "CLOSED", "IT_STAFF")).toBe(true);
    expect(isValidStatusTransition("RESOLVED", "REOPENED", "IT_STAFF")).toBe(true);
  });

  it("rejects invalid transitions for IT Staff", () => {
    expect(isValidStatusTransition("NEW", "CLOSED", "IT_STAFF")).toBe(false);
    expect(isValidStatusTransition("OPEN", "RESOLVED", "IT_STAFF")).toBe(false); // Resolution Gate: OPEN cannot skip to RESOLVED
    expect(isValidStatusTransition("REOPENED", "CANCELLED", "IT_STAFF")).toBe(false); // REOPENED->CANCELLED not allowed
    expect(isValidStatusTransition("CANCELLED", "OPEN", "IT_STAFF")).toBe(false);
  });

  it("allows Administrator to reopen CLOSED tickets", () => {
    expect(isValidStatusTransition("CLOSED", "REOPENED", "ADMINISTRATOR")).toBe(true);
  });

  it("permits staying in current status", () => {
    expect(isValidStatusTransition("IN_PROGRESS", "IN_PROGRESS", "IT_STAFF")).toBe(true);
  });
});
