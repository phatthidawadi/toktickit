import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketDetail } from "../../src/components/StaffTicketDetail";
import * as ApiModule from "../../src/api";

describe("Ticket Status Workflow & Resolution Gate UI Tests (UI-FLOW-01 to UI-FLOW-03)", () => {
  const baseTicket: ApiModule.Ticket = {
    id: 101,
    ticketNumber: "TKT-2026-000101",
    summary: "VPN Connection drops repeatedly",
    description: "Every 15 minutes the Cisco AnyConnect disconnects.",
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "OPEN",
    isRequesterResolved: false,
    version: 2,
    requesterId: 1,
    assignedStaffId: 2,
    categoryId: 1,
    relatedSystemId: 1,
    createdAt: "2026-10-15T08:00:00.000Z",
    updatedAt: "2026-10-15T09:00:00.000Z",
    requester: { id: 1, name: "Jennifer Adams", email: "jennifer.a@example.com" },
    assignedStaff: { id: 2, name: "Michael Brown", email: "michael.b@example.com" },
    category: { id: 1, name: "Network" },
    relatedSystem: { id: 1, name: "VPN Gateway", categoryId: 1, isActive: true },
    attachments: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ApiModule, "fetchPublicCommentsApi").mockResolvedValue([]);
    vi.spyOn(ApiModule, "fetchInternalNotesApi").mockResolvedValue([]);
    vi.spyOn(ApiModule, "fetchActionsTakenApi").mockResolvedValue([]);
  });

  // UI-FLOW-01: Permitted status transition dropdown options
  it("UI-FLOW-01: Dropdown displays ONLY matrix-allowed transitions for current ticket status", async () => {
    vi.spyOn(ApiModule, "fetchStaffTicketDetailApi").mockResolvedValue({
      ...baseTicket,
      currentStatus: "OPEN",
    });

    render(<StaffTicketDetail ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByText("VPN Connection drops repeatedly")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Change Status:/i) as HTMLSelectElement;
    expect(statusSelect).toBeInTheDocument();

    const options = Array.from(statusSelect.options).map((opt) => opt.value);

    // OPEN permitted transitions: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"]
    expect(options).toContain("OPEN"); // Current
    expect(options).toContain("IN_PROGRESS");
    expect(options).toContain("WAITING_FOR_REQUESTER");
    expect(options).toContain("CANCELLED");

    // RESOLVED and CLOSED must NOT be directly available from OPEN
    expect(options).not.toContain("RESOLVED");
    expect(options).not.toContain("CLOSED");
  });

  // UI-FLOW-02: Advisory resolution callout banner
  it("UI-FLOW-02: Advisory resolution callout banner renders when isRequesterResolved=true and is omitted when false", async () => {
    // 1. With isRequesterResolved = true
    vi.spyOn(ApiModule, "fetchStaffTicketDetailApi").mockResolvedValue({
      ...baseTicket,
      isRequesterResolved: true,
    });

    const { unmount } = render(<StaffTicketDetail ticketId={101} />);

    await waitFor(() => {
      const banner = document.getElementById("advisory-resolution-banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent("Requester indicated the problem appears resolved");
    });

    unmount();

    // 2. With isRequesterResolved = false
    vi.spyOn(ApiModule, "fetchStaffTicketDetailApi").mockResolvedValue({
      ...baseTicket,
      isRequesterResolved: false,
    });

    render(<StaffTicketDetail ticketId={102} />);

    await waitFor(() => {
      expect(screen.getByText("VPN Connection drops repeatedly")).toBeInTheDocument();
    });

    const banner = document.getElementById("advisory-resolution-banner");
    expect(banner).not.toBeInTheDocument();
  });

  // UI-FLOW-03: Status update submission with version and concurrency conflict handling
  it("UI-FLOW-03: Submits target status with ticket.version and displays error alert on 409 conflict", async () => {
    const user = userEvent.setup();

    vi.spyOn(ApiModule, "fetchStaffTicketDetailApi").mockResolvedValue({
      ...baseTicket,
      currentStatus: "OPEN",
      version: 2,
    });

    const conflictError: any = new Error("The ticket was updated by another session. Please refresh and retry.");
    conflictError.status = 409;
    conflictError.code = "CONCURRENCY_CONFLICT";

    const updateSpy = vi.spyOn(ApiModule, "updateTicketStatusApi").mockRejectedValue(conflictError);

    render(<StaffTicketDetail ticketId={101} />);

    await waitFor(() => {
      expect(screen.getByText("VPN Connection drops repeatedly")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Change Status:/i);
    await user.selectOptions(statusSelect, "IN_PROGRESS");

    // Verify updateTicketStatusApi was called with ticketId, status, and version
    expect(updateSpy).toHaveBeenCalledWith(101, "IN_PROGRESS", 2);

    // Verify concurrency conflict banner is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Ticket status was updated by another user. Reloading latest state.../i)
      ).toBeInTheDocument();
    });
  });
});
