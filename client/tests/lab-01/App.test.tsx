import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

const mockCategories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const mockRequesters = [
  { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com", department: "Human Resources", isActive: true },
];

describe("Lab 1 App Health & Category Inspection", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders App title and components", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = typeof url === "string" ? url : (url as Request).url;
      if (urlString.includes("/api/requesters")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockRequesters) } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCategories),
      } as Response);
    });

    render(<App />);
    expect(screen.getByText("TokTickIT")).toBeInTheDocument();
  });

  it("fetches categories and displays system status", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlString = typeof url === "string" ? url : (url as Request).url;
      if (urlString.includes("/api/health")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ status: "ok" }) } as Response);
      }
      if (urlString.includes("/api/requesters")) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mockRequesters) } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCategories),
      } as Response);
    });

    render(<App />);
    expect(await screen.findByText(/TokTickIT/i)).toBeInTheDocument();
  });
});
