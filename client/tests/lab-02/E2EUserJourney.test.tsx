import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import App from "../../src/App.js";

const mockRequesters = [
  { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com", department: "Human Resources", isActive: true },
];

const mockCategories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const mockSystems = [
  { id: 1, name: "Corporate Laptop", categoryId: 1, isActive: true },
];

const mockCreatedTicket = {
  id: 101,
  ticketNumber: "TKT-2026-000101",
  summary: "VPN connection drops every 10 minutes",
  description: "When working remotely, the corporate VPN disconnects frequently requiring re-authentication.",
  requestedPriority: "HIGH",
  currentStatus: "NEW",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 1,
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 1, name: "Corporate Laptop" },
  attachments: [],
};

describe("End-to-End User Journey (E2E Verification)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("completes full E2E user flow from Requester Selection to Ticket Detail view", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url, init) => {
      const urlString = typeof url === "string" ? url : (url as Request).url;
      const method = init?.method || "GET";

      if (urlString.includes("/api/requesters")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockRequesters),
        } as Response);
      }

      if (urlString.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockCategories),
        } as Response);
      }

      if (urlString.includes("/api/related-systems")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockSystems),
        } as Response);
      }

      if (urlString.includes("/api/tickets") && method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockCreatedTicket),
        } as Response);
      }

      if (urlString.includes("/api/tickets/101")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockCreatedTicket),
        } as Response);
      }

      if (urlString.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              tickets: [mockCreatedTicket],
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(<App />);

    // Step 1: Select Requester
    await waitFor(() => {
      expect(screen.getByText("Select Development Requester")).toBeDefined();
    });

    const continueButton = await screen.findByText("Continue");
    fireEvent.click(continueButton);

    // Step 2: Verify Selected Requester appears in Header
    await waitFor(() => {
      expect(screen.getAllByText("Jennifer Anderson").length).toBeGreaterThan(0);
    });

    // Step 3: Navigate to Create Ticket
    const createNavButton = screen.getByText("Create Ticket");
    fireEvent.click(createNavButton);

    await waitFor(() => {
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    // Step 4: Submit Ticket
    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descriptionInput = screen.getByLabelText(/Detailed Description/i);

    fireEvent.change(summaryInput, { target: { value: "VPN connection drops every 10 minutes" } });
    fireEvent.change(descriptionInput, {
      target: { value: "When working remotely, the corporate VPN disconnects frequently requiring re-authentication." },
    });

    const submitButton = screen.getByText("Submit Ticket");
    fireEvent.click(submitButton);

    // Step 5: Verify Ticket Created Banner
    await waitFor(() => {
      expect(screen.getByText("Ticket Submitted Successfully!")).toBeDefined();
    });
    expect(screen.getByText("TKT-2026-000101")).toBeDefined();
  });
});
