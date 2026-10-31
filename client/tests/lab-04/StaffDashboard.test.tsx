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

import { fetchStaffDashboard } from "../../src/api.js";
import { useAuth } from "../../src/context/AuthContext.js";
import { StaffDashboard } from "../../src/components/StaffDashboard.js";

const mockStaffData = {
  unassignedTickets: 5,
  myAssignedTickets: 3,
  urgentTicketsCount: 1,
  ticketsByStatus: { NEW: 2, OPEN: 3, IN_PROGRESS: 3, WAITING_FOR_REQUESTER: 1, RESOLVED: 4, CLOSED: 2, REOPENED: 0, CANCELLED: 1 },
  ticketsByPriority: { LOW: 2, MEDIUM: 4, HIGH: 3, URGENT: 1 },
  recentQueueTickets: [
    { id: 2, ticketNumber: "TKT-2026-000002", summary: "Staff queue ticket", currentStatus: "OPEN", itPriority: "HIGH", updatedAt: new Date().toISOString(), requester: { id: 1, name: "Alice", email: "alice@example.com" } },
  ],
};

const mockAdminData = {
  ...mockStaffData,
  adminUserSummary: { totalUsers: 10, activeUsers: 8, usersByRole: { REQUESTER: 6, IT_STAFF: 3, ADMINISTRATOR: 1 } },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UI-DASH-04: StaffDashboard renders overview metric cards", () => {
  it("shows Unassigned, Assigned to Me, Urgent Priority, Waiting cards", async () => {
    (useAuth as any).mockReturnValue({ user: { id: 2, name: "Bob", role: "IT_STAFF" } });
    (fetchStaffDashboard as any).mockResolvedValue(mockStaffData);

    render(
      <StaffDashboard
        onNavigateToQueue={() => {}}
        onNavigateToTicketDetail={() => {}}
        onNavigateToUserManagement={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Unassigned")).toBeInTheDocument();
      expect(screen.getByText("Assigned to Me")).toBeInTheDocument();
      expect(screen.getByText("Urgent Priority")).toBeInTheDocument();
    });
  });
});

describe("UI-DASH-05: StaffDashboard Admin shows adminUserSummary card", () => {
  it("renders User Account Summary section with role breakdown for ADMINISTRATOR", async () => {
    (useAuth as any).mockReturnValue({ user: { id: 3, name: "Carol", role: "ADMINISTRATOR" } });
    (fetchStaffDashboard as any).mockResolvedValue(mockAdminData);

    render(
      <StaffDashboard
        onNavigateToQueue={() => {}}
        onNavigateToTicketDetail={() => {}}
        onNavigateToUserManagement={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("User Account Summary")).toBeInTheDocument();
      expect(screen.getByText("Total Accounts")).toBeInTheDocument();
      expect(screen.getByText("IT Staff")).toBeInTheDocument();
      expect(screen.getByText("Administrators")).toBeInTheDocument();
    });
  });
});
