import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../../src/components/Header";
import * as AuthContextModule from "../../src/context/AuthContext";

describe("UI-HEADER-01: Role-authenticated header navigation component", () => {
  const mockOnNavigate = vi.fn();
  const mockLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnNavigate.mockReset();
    mockLogout.mockReset();
  });

  it("renders Requester user profile, 'Requester' badge, navigation links, and triggers logout", async () => {
    const user = userEvent.setup();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer.a@example.com",
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      },
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
    });

    render(<Header currentNav="my-tickets" onNavigate={mockOnNavigate} />);

    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
    expect(screen.getByText("Requester")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "My Tickets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Ticket" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ticket Queue" })).not.toBeInTheDocument();

    const logoutBtn = screen.getByRole("button", { name: "Logout" });
    await user.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("renders IT Staff profile, 'IT Staff' badge, and Ticket Queue link", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 5,
        name: "Staff Somchai",
        email: "staff.somchai@example.com",
        role: "IT_STAFF",
        isActive: true,
        mustChangePassword: false,
      },
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
    });

    render(<Header currentNav="ticket-queue" onNavigate={mockOnNavigate} />);

    expect(screen.getByText("Staff Somchai")).toBeInTheDocument();
    expect(screen.getByText("IT Staff")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ticket Queue" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "My Tickets" })).not.toBeInTheDocument();
  });

  it("renders Administrator profile, 'Administrator' badge, and Admin navigation links", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 9,
        name: "Admin TokTickIT",
        email: "admin.toktickit@example.com",
        role: "ADMINISTRATOR",
        isActive: true,
        mustChangePassword: false,
      },
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      refreshUser: vi.fn(),
    });

    render(<Header currentNav="user-management" onNavigate={mockOnNavigate} />);

    expect(screen.getByText("Admin TokTickIT")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ticket Queue" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "User Management" })).toBeInTheDocument();
  });
});
