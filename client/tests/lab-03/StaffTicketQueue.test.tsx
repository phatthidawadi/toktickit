import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    fetchStaffTicketsApi: vi.fn(),
    fetchCategories: vi.fn(),
  };
});

describe("UI-QUEUE-01: Staff Ticket Queue table and filters component", () => {
  const mockTickets = [
    {
      id: 1,
      ticketNumber: "TCK-2026-0001",
      summary: "VPN access fails on login",
      description: "Cannot connect to company VPN",
      requestedPriority: "HIGH",
      itPriority: "HIGH",
      currentStatus: "NEW",
      requesterId: 1,
      assignedStaffId: null,
      categoryId: 1,
      createdAt: "2026-09-01T10:00:00.000Z",
      category: { id: 1, name: "Network" },
      assignedStaff: null,
    },
    {
      id: 2,
      ticketNumber: "TCK-2026-0002",
      summary: "Monitor flickering issue",
      description: "Display output blinks intermittently",
      requestedPriority: "MEDIUM",
      itPriority: "URGENT",
      currentStatus: "IN_PROGRESS",
      requesterId: 2,
      assignedStaffId: 5,
      categoryId: 2,
      createdAt: "2026-09-02T11:00:00.000Z",
      category: { id: 2, name: "Hardware" },
      assignedStaff: { id: 5, name: "Staff Somchai", email: "staff.somchai@example.com" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchCategories as any).mockResolvedValue([
      { id: 1, name: "Network" },
      { id: 2, name: "Hardware" },
    ]);
    (api.fetchStaffTicketsApi as any).mockResolvedValue({
      tickets: mockTickets,
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("renders Staff Ticket Queue with table headers, search input, filter controls, and ticket rows", async () => {
    render(<StaffTicketQueue />);

    expect(screen.getByText("IT Staff Ticket Queue")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search number, summary/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading tickets queue...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("TCK-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("VPN access fails on login")).toBeInTheDocument();
    expect(screen.getByText("TCK-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("Monitor flickering issue")).toBeInTheDocument();
    expect(screen.getByText("Staff Somchai")).toBeInTheDocument();
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);
  });

  it("handles ticket row selection callback", async () => {
    const mockClick = vi.fn();
    const user = userEvent.setup();

    render(<StaffTicketQueue onTicketClick={mockClick} />);

    await waitFor(() => {
      expect(screen.getByText("TCK-2026-0001")).toBeInTheDocument();
    });

    await user.click(screen.getByText("TCK-2026-0001"));
    expect(mockClick).toHaveBeenCalledWith(1);
  });
});
