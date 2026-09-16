import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketDetail } from "../../src/components/StaffTicketDetail";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    fetchStaffTicketDetailApi: vi.fn(),
    assignStaffTicketApi: vi.fn(),
    updateItPriorityApi: vi.fn(),
    updateTicketStatusApi: vi.fn(),
    fetchPublicCommentsApi: vi.fn().mockResolvedValue([]),
    fetchInternalNotesApi: vi.fn().mockResolvedValue([]),
  };
});

describe("UI-DETAIL-01: Staff Ticket Detail operational controls component", () => {
  const mockTicket = {
    id: 1,
    ticketNumber: "TCK-2026-0001",
    summary: "VPN access fails on login",
    description: "Cannot connect to company VPN after system update",
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "NEW",
    requesterId: 1,
    assignedStaffId: null,
    categoryId: 1,
    relatedSystemId: 1,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
    category: { id: 1, name: "Network" },
    relatedSystem: { id: 1, name: "VPN Service" },
    attachments: [],
    assignedStaff: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchStaffTicketDetailApi as any).mockResolvedValue(mockTicket);
    (api.fetchPublicCommentsApi as any).mockResolvedValue([]);
    (api.fetchInternalNotesApi as any).mockResolvedValue([]);
  });

  it("renders Staff Ticket Detail with summary, claim button, priority dropdown, and status dropdown", async () => {
    render(<StaffTicketDetail ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText("TCK-2026-0001")).toBeInTheDocument();
      expect(screen.getByText("VPN access fails on login")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Claim Ticket" })).toBeInTheDocument();
      expect(screen.getByLabelText(/IT Priority:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Change Status:/i)).toBeInTheDocument();
    });
  });

  it("handles claiming ticket ownership", async () => {
    const user = userEvent.setup();
    (api.assignStaffTicketApi as any).mockResolvedValue({
      ...mockTicket,
      assignedStaffId: 5,
      assignedStaff: { id: 5, name: "Staff Somchai" },
    });

    render(<StaffTicketDetail ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Claim Ticket" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Claim Ticket" }));
    expect(api.assignStaffTicketApi).toHaveBeenCalledWith(1, { claim: true });

    await waitFor(() => {
      expect(screen.getByText("Ticket successfully claimed.")).toBeInTheDocument();
      expect(screen.getByText("Staff Somchai")).toBeInTheDocument();
    });
  });

  it("handles updating IT priority", async () => {
    const user = userEvent.setup();
    (api.updateItPriorityApi as any).mockResolvedValue({
      ...mockTicket,
      itPriority: "URGENT",
    });

    render(<StaffTicketDetail ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/IT Priority:/i)).toBeInTheDocument();
    });

    const prioritySelect = screen.getByLabelText(/IT Priority:/i);
    await user.selectOptions(prioritySelect, "URGENT");

    expect(api.updateItPriorityApi).toHaveBeenCalledWith(1, "URGENT");
    await waitFor(() => {
      expect(screen.getByText("IT Priority updated to URGENT.")).toBeInTheDocument();
    });
  });
});
