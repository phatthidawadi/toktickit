import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

describe("RequesterSelectorScreen UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders Login screen when no authenticated session exists in Lab 3", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: "Unauthenticated" }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Sign In to TokTickIT")).toBeDefined();
    });

    expect(screen.getByText(/Enter your credentials to access your portal/i)).toBeDefined();
  });
});
