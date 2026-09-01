import { describe, it, expect } from "vitest";
import { generateTicketNumber } from "../../src/utils/ticketNumber.js";

describe("generateTicketNumber", () => {
  it("formats ticket number as TKT-YYYY-XXXXXX with 6-digit zero padding", () => {
    const result1 = generateTicketNumber(1, 2026);
    expect(result1).toBe("TKT-2026-000001");

    const result42 = generateTicketNumber(42, 2026);
    expect(result42).toBe("TKT-2026-000042");

    const result9999 = generateTicketNumber(9999, 2026);
    expect(result9999).toBe("TKT-2026-009999");
  });
});
