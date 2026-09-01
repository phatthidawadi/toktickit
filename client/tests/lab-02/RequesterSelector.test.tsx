import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

describe("RequesterSelectorScreen UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders Development Requester Selection modal when no requester selected", async () => {
    const mockRequesters = [
      { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com", department: "Human Resources", isActive: true },
      { id: 2, name: "Michael Brown", email: "michael.b@example.com", department: "Finance", isActive: true },
    ];

    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRequesters),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Select Development Requester")).toBeDefined();
    });

    expect(screen.getByText(/Choose a development requester/i)).toBeDefined();
    expect(screen.getByText(/Authentication coming in Lab 3/i)).toBeDefined();
  });
});
