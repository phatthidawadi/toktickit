import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePassword } from "../../src/components/ChangePassword.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", async () => {
  const actual = await vi.importActual("../../src/api.js");
  return {
    ...actual,
    changePasswordApi: vi.fn(),
  };
});

describe("UI-PASS Component Tests (UI-PASS-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-PASS-01: Password Change screen rendering, complexity checklist, and form submit", async () => {
    const user = userEvent.setup();
    const mockOnPasswordChanged = vi.fn();
    (api.changePasswordApi as any).mockResolvedValue({
      message: "Password changed successfully!",
    });

    render(<ChangePassword onPasswordChanged={mockOnPasswordChanged} />);

    expect(screen.getByRole("heading", { name: /mandatory password update/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/current password/i), "Password123!");
    await user.type(screen.getByLabelText(/^new password/i), "NewStrongPass1!");
    await user.type(screen.getByLabelText(/confirm new password/i), "NewStrongPass1!");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(api.changePasswordApi).toHaveBeenCalledWith("Password123!", "NewStrongPass1!", "NewStrongPass1!");
    expect(mockOnPasswordChanged).toHaveBeenCalled();
  });
});
