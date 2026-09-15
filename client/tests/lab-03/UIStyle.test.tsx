import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Header } from "../../src/components/Header";
import { InternalNotes } from "../../src/components/InternalNotes";
import * as AuthContextModule from "../../src/context/AuthContext";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    fetchInternalNotesApi: vi.fn(),
  };
});

describe("Zen Green Design System Style Verification Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchInternalNotesApi as any).mockResolvedValue([]);
  });

  it("STYLE-01: Verifies role badge color tokens for Requester, IT Staff, Administrator", () => {
    // 1. Requester (#DBEAFE)
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { id: 1, name: "Req User", email: "req@example.com", role: "REQUESTER", isActive: true, mustChangePassword: false },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    const { rerender } = render(<Header currentNav="my-tickets" onNavigate={vi.fn()} />);
    const reqBadge = screen.getByText("Requester");
    expect(reqBadge).toBeInTheDocument();

    // 2. IT Staff (#D1FAE5)
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { id: 2, name: "Staff User", email: "staff@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: false },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    rerender(<Header currentNav="ticket-queue" onNavigate={vi.fn()} />);
    const staffBadge = screen.getByText("IT Staff");
    expect(staffBadge).toBeInTheDocument();

    // 3. Administrator (#E0E7FF)
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { id: 3, name: "Admin User", email: "admin@example.com", role: "ADMINISTRATOR", isActive: true, mustChangePassword: false },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
    rerender(<Header currentNav="user-management" onNavigate={vi.fn()} />);
    const adminBadge = screen.getByText("Administrator");
    expect(adminBadge).toBeInTheDocument();
  });

  it("STYLE-02: Verifies confidential Internal Notes container amber styling (#FEF3C7)", async () => {
    const { container } = render(<InternalNotes ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Confidential Internal Notes/i)).toBeInTheDocument();
    });

    const containerElem = container.querySelector("#internal-notes-container") as HTMLElement;
    expect(containerElem).toBeInTheDocument();
    expect(containerElem.style.backgroundColor).toBe("rgb(254, 243, 199)"); // #FEF3C7
    expect(containerElem.style.border).toContain("rgb(253, 230, 138)"); // #FDE68A

    const headingElem = screen.getByText(/Confidential Internal Notes/i);
    expect(headingElem.style.color).toBe("rgb(146, 64, 14)"); // #92400E
  });
});
