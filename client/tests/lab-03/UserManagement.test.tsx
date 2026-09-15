import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserManagement } from "../../src/components/UserManagement";
import * as api from "../../src/api";

const mockUsers: api.AdminUser[] = [
  {
    id: 1,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    role: "REQUESTER",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 5,
    name: "Staff Somsri",
    email: "staff.somsri@example.com",
    role: "IT_STAFF",
    isActive: true,
    mustChangePassword: false,
  },
  {
    id: 9,
    name: "Admin TokTickIT",
    email: "admin.toktickit@example.com",
    role: "ADMINISTRATOR",
    isActive: true,
    mustChangePassword: false,
  },
];

describe("Administrator User Management UI Component (UI-ADMIN-01, UI-ADMIN-02)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("UI-ADMIN-01: User Management user table & creation modal component", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockUsers);
    const createSpy = vi.spyOn(api, "createAdminUserApi").mockResolvedValue({
      id: 10,
      name: "New Created User",
      email: "new.user@example.com",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: true,
    });

    render(<UserManagement />);

    expect(await screen.findByText("User Management")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
    expect(screen.getByText("Staff Somsri")).toBeInTheDocument();
    expect(screen.getByText("Admin TokTickIT")).toBeInTheDocument();

    // Open Create User Modal
    const createBtn = screen.getByRole("button", { name: /\+ Create User/i });
    await user.click(createBtn);

    expect(screen.getByText("Create New User Account")).toBeInTheDocument();

    // Fill Create Form
    await user.type(screen.getByLabelText(/full name/i), "New Created User");
    await user.type(screen.getByLabelText(/email address/i), "new.user@example.com");
    await user.type(screen.getByLabelText(/initial password/i), "Password123!");

    const submitBtn = screen.getByRole("button", { name: /^Create User$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        name: "New Created User",
        email: "new.user@example.com",
        role: "REQUESTER",
        initialPassword: "Password123!",
        isActive: true,
      });
    });
  });

  it("UI-ADMIN-02: Admin User Edit & Role/Status Toggle modal with safety check error alerts", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockUsers);

    // Mock edit update throwing self-deactivation prohibited error
    const errObj: any = new Error("Administrators are prohibited from deactivating their own active account.");
    errObj.code = "SELF_DEACTIVATION_PROHIBITED";
    const updateSpy = vi.spyOn(api, "updateAdminUserApi").mockRejectedValue(errObj);

    render(<UserManagement />);

    expect(await screen.findByText("Admin TokTickIT")).toBeInTheDocument();

    // Click Edit on Admin TokTickIT (row 3)
    const editBtns = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editBtns[2]);

    expect(screen.getByText("Edit User Account")).toBeInTheDocument();

    // Attempt to uncheck Account Active
    const activeCheck = screen.getByLabelText(/account active/i);
    await user.click(activeCheck);

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
      expect(screen.getByText(/prohibited from deactivating their own active account/i)).toBeInTheDocument();
    });
  });

  it("UI-ADMIN-02: Reset initial password modal", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "fetchAdminUsersApi").mockResolvedValue(mockUsers);
    const resetSpy = vi.spyOn(api, "resetAdminUserPasswordApi").mockResolvedValue({
      message: "Initial password reset successfully",
      user: { ...mockUsers[0], mustChangePassword: true },
    });

    render(<UserManagement />);

    expect(await screen.findByText("Jennifer Anderson")).toBeInTheDocument();

    const resetBtns = screen.getAllByRole("button", { name: "Reset Password" });
    await user.click(resetBtns[0]);

    expect(screen.getByText("Reset Initial Password")).toBeInTheDocument();
    expect(screen.getByText(/This will set a new initial password for/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/new initial password/i), "ResetPass123!");

    const setPassBtn = screen.getByRole("button", { name: "Set Initial Password" });
    await user.click(setPassBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith(1, "ResetPass123!");
    });
  });
});
