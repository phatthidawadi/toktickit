import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import { RequesterProvider, useRequester } from "../../src/context/RequesterContext.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  department: "Human Resources",
  isActive: true,
};

const mockTicketDetail = {
  id: 1,
  ticketNumber: "TKT-2026-000001",
  summary: "Cannot connect to Campus Wi-Fi",
  description: "Getting authorization error when connecting to Wi-Fi network",
  requestedPriority: "HIGH",
  currentStatus: "NEW",
  requesterId: 1,
  categoryId: 4,
  relatedSystemId: 6,
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
  category: { id: 4, name: "Network", description: "Network infrastructure" },
  relatedSystem: { id: 6, name: "Campus Wi-Fi", description: "Wireless network" },
  attachments: [],
};

function TestWrapper() {
  const { setSelectedRequester } = useRequester();

  React.useEffect(() => {
    setSelectedRequester(mockRequester);
  }, []);

  return <TicketDetailView ticketId={1} onBack={() => {}} />;
}

describe("TicketDetailView UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders read-only ticket details cleanly", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/tickets/1")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTicketDetail),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("TKT-2026-000001")).toBeDefined();
    });

    expect(screen.getByText("Cannot connect to Campus Wi-Fi")).toBeDefined();
    expect(screen.getByText("Getting authorization error when connecting to Wi-Fi network")).toBeDefined();
    expect(screen.getByText("Read-Only Mode (Sprint 2 Spec 5.4)")).toBeDefined();
  });
});
