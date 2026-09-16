import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../../src/components/Login.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    loginApi: vi.fn(),
  };
});

describe("UI-LOGIN Component Tests (UI-LOGIN-01, UI-LOGIN-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-LOGIN-01: renders login form inputs, required indicators, and handles successful login", async () => {
    const user = userEvent.setup();
    const mockOnSuccess = vi.fn();
    (api.loginApi as any).mockResolvedValue({
      message: "Login successful",
      user: { id: 1, name: "Jennifer Anderson", email: "jennifer.a@example.com", role: "REQUESTER", isActive: true, mustChangePassword: false },
    });

    render(<Login onLoginSuccess={mockOnSuccess} />);

    expect(screen.getByRole("heading", { name: /sign in to toktickit/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email address/i), "jennifer.a@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(api.loginApi).toHaveBeenCalledWith("jennifer.a@example.com", "Password123!");
    expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ email: "jennifer.a@example.com" }));
  });

  it("UI-LOGIN-02: displays error callout banner on invalid credentials or inactive user attempt", async () => {
    const user = userEvent.setup();
    (api.loginApi as any).mockRejectedValue(new Error("Invalid email or password"));

    render(<Login />);

    await user.type(screen.getByLabelText(/email address/i), "inactive@example.com");
    await user.type(screen.getByLabelText(/password/i), "WrongPassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });
});
