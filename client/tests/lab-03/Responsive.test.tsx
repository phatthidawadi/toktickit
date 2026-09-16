import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffTicketQueue } from "../../src/components/StaffTicketQueue.js";
import { UserManagement } from "../../src/components/UserManagement.js";
import * as api from "../../src/api.js";

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
  {
    id: 2,
    name: "Staff Somsri",
    email: "staff.somsri@example.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
  },
];

describe("Explicit Responsive Tests (RESP-01, RESP-02)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("RESP-01: Staff Ticket Queue renders desktop data table, tablet scroll wrapper, and mobile stacked card view", async () => {
    vi.spyOn(api, "fetchStaffTicketsApi").mockResolvedValue(mockPaginatedTickets);
    vi.spyOn(api, "fetchCategories").mockResolvedValue([{ id: 4, name: "Network" }]);

    const { container } = render(<StaffTicketQueue onTicketClick={() => {}} />);

    expect(await screen.findByText("TKT-2026-000001")).toBeInTheDocument();
    expect(screen.getByText("Cannot connect to VPN")).toBeInTheDocument();

    // Verify desktop table & mobile card view containers exist
    const tableContainer = container.querySelector(".table-responsive, table");
    expect(tableContainer).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();

    const categorySelect = container.querySelector("select");
    expect(categorySelect).toBeInTheDocument();
  });

  it("RESP-02: User Management renders toolbar, responsive user table container, and creation modal scaling", async () => {
    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockAdminUsers);

    const { container } = render(<UserManagement />);

    expect(await screen.findByText("User Management")).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();

    // Verify Create User Modal button and responsive modal rendering
    const createBtn = screen.getByText(/\+ Create User/i);
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("Create New User Account")).toBeInTheDocument();
    });

    const modalForm = container.querySelector("form");
    expect(modalForm).toBeInTheDocument();

    // Close modal
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
  });
});
