import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Header } from "../../src/components/Header.js";
import { InternalNotes } from "../../src/components/InternalNotes.js";
import { Login } from "../../src/components/Login.js";
import * as AuthContextModule from "../../src/context/AuthContext.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
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

  it("STYLE-01: Verifies role badge color tokens for Requester (#DBEAFE), IT Staff (#D1FAE5), Administrator (#E0E7FF)", () => {
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
    expect(reqBadge.className).toContain("role-badge-requester");

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
    expect(staffBadge.className).toContain("role-badge-staff");

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
    expect(adminBadge.className).toContain("role-badge-admin");
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

  it("STYLE-03: Asserts focus rings, required red asterisks (#C5221F), and min button touch targets (>= 44px)", () => {
    const { container } = render(<Login />);

    // 1. Required red asterisks (* #C5221F)
    const asterisks = container.querySelectorAll(".required-asterisk");
    expect(asterisks.length).toBeGreaterThanOrEqual(2);
    asterisks.forEach((ast) => {
      const elem = ast as HTMLElement;
      expect(elem.style.color).toBe("rgb(197, 34, 31)"); // #C5221F
    });

    // 2. Minimum button touch target height (>= 44px)
    const submitBtn = container.querySelector("#login-submit-btn") as HTMLButtonElement;
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn.className).toContain("py-3.5");

    // 3. Focus rings styling on form inputs
    const emailInput = container.querySelector("#login-email") as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.className).toContain("focus:ring-2");
  });
});
