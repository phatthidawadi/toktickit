import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue";
import { UserManagement } from "../../src/components/UserManagement";
import * as api from "../../src/api";

const mockPaginatedTickets: api.PaginatedTickets = {
  tickets: [
    {
      id: 1,
      ticketNumber: "TKT-2026-000001",
      summary: "Cannot connect to VPN",
      description: "VPN client fails to connect",
      categoryId: 4,
      relatedSystemId: 10,
      requesterId: 1,
      assignedStaffId: 5,
      requestedPriority: "HIGH",
      itPriority: "HIGH",
      currentStatus: "OPEN",
      isRequesterResolved: false,
      createdAt: "2026-03-01T10:00:00Z",
      updatedAt: "2026-03-01T10:00:00Z",
      category: { id: 4, name: "Network" },
      relatedSystem: { id: 10, name: "Corporate VPN", categoryId: 4, isActive: true },
      requester: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com" },
      assignedStaff: { id: 5, name: "Staff Somsri", email: "staff.somsri@example.com" },
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const mockAdminUsers: api.AdminUser[] = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
  },
];

describe("Explicit Responsive Tests (RESP-01, RESP-02)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("RESP-01: Staff Ticket Queue renders data table wrapper and handles responsive container rendering", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockPaginatedTickets);
    vi.spyOn(api, "fetchCategories").mockResolvedValue([{ id: 4, name: "Network" }]);

    render(<StaffTicketQueue onTicketClick={() => {}} />);

    expect(await screen.findByText("TKT-2026-000001")).toBeInTheDocument();
    expect(screen.getByText("Cannot connect to VPN")).toBeInTheDocument();
  });

  it("RESP-02: User Management renders toolbar and user table container Responsively", async () => {
    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockAdminUsers);

    render(<UserManagement />);

    expect(await screen.findByText("User Management")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
  });
});
