import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock api module
vi.mock("../../src/api.js", () => ({
  fetchRequesterDashboard: vi.fn(),
  fetchStaffDashboard: vi.fn(),
}));

// Mock AuthContext
vi.mock("../../src/context/AuthContext.js", () => ({
  useAuth: vi.fn(),
}));

import { fetchRequesterDashboard } from "../../src/api.js";
import { useAuth } from "../../src/context/AuthContext.js";
import { RequesterDashboard } from "../../src/components/RequesterDashboard.js";

const mockRequesterData = {
  totalOpenTickets: 3,
  ticketsWaitingForRequester: 1,
  recentlyResolvedTickets: 2,
  myRecentTickets: [
    { id: 1, ticketNumber: "TKT-2026-000001", summary: "Test ticket", currentStatus: "IN_PROGRESS", updatedAt: new Date().toISOString() },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UI-DASH-01: RequesterDashboard renders metric cards", () => {
  it("shows Open Tickets, Waiting on You, and Recently Resolved cards", async () => {
    (useAuth as any).mockReturnValue({ user: { id: 1, name: "Alice", role: "REQUESTER" } });
    (fetchRequesterDashboard as any).mockResolvedValue(mockRequesterData);

    render(
      <RequesterDashboard
        onNavigateToTickets={() => {}}
        onNavigateToTicketDetail={() => {}}
        onNavigateToCreate={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Open Tickets")).toBeInTheDocument();
      expect(screen.getByText("Waiting on You")).toBeInTheDocument();
      expect(screen.getByText("Recently Resolved")).toBeInTheDocument();
    });
  });
});

describe("UI-DASH-02: RequesterDashboard renders correct metric values", () => {
  it("shows the numeric counts from API data", async () => {
    (useAuth as any).mockReturnValue({ user: { id: 1, name: "Alice", role: "REQUESTER" } });
    (fetchRequesterDashboard as any).mockResolvedValue(mockRequesterData);

    render(
      <RequesterDashboard
        onNavigateToTickets={() => {}}
        onNavigateToTicketDetail={() => {}}
        onNavigateToCreate={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

describe("UI-DASH-03: RequesterDashboard shows recent tickets table", () => {
  it("renders ticket number and summary from myRecentTickets", async () => {
    (useAuth as any).mockReturnValue({ user: { id: 1, name: "Alice", role: "REQUESTER" } });
    (fetchRequesterDashboard as any).mockResolvedValue(mockRequesterData);

    render(
      <RequesterDashboard
        onNavigateToTickets={() => {}}
        onNavigateToTicketDetail={() => {}}
        onNavigateToCreate={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("TKT-2026-000001")).toBeInTheDocument();
      expect(screen.getByText("Test ticket")).toBeInTheDocument();
    });
  });
});
