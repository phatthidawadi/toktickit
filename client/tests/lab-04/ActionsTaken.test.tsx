import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    fetchActionsTakenApi: vi.fn(),
    createActionTakenApi: vi.fn(),
    updateActionTakenApi: vi.fn(),
    fetchStaffAssigneesApi: vi.fn(),
  };
});

describe("Lab 4 Actions Taken UI Component Tests (UI-ACT-01 to UI-ACT-05)", () => {
  const mockActions: api.ActionTaken[] = [
    {
      id: 1,
      ticketId: 10,
      actionDateTime: "2026-10-15T10:00:00.000Z",
      description: "Replaced RAM module in slot 2 and ran memory tests.",
      result: "Memtest86 passed 4 cycles with 0 errors.",
      status: "COMPLETED",
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: "memtest_report.pdf",
      performedById: 2,
      assigneeId: 2,
      version: 1,
      createdAt: "2026-10-15T10:00:00.000Z",
      updatedAt: "2026-10-15T10:00:00.000Z",
      performedBy: {
        id: 2,
        name: "Staff Somchai",
        email: "staff.somchai@example.com",
        role: "IT_STAFF",
      },
      assignee: {
        id: 2,
        name: "Staff Somchai",
        email: "staff.somchai@example.com",
        role: "IT_STAFF",
      },
    },
    {
      id: 2,
      ticketId: 10,
      actionDateTime: "2026-10-15T14:30:00.000Z",
      description: "Configured temporary workaround for network interface routing.",
      result: "Gateway traffic stabilized at 1Gbps.",
      status: "IN_PROGRESS",
      followUpRequired: true,
      followUpNote: "Verify with user after 24 hours of operation.",
      attachmentNotes: null,
      performedById: 3,
      assigneeId: 3,
      version: 1,
      createdAt: "2026-10-15T14:30:00.000Z",
      updatedAt: "2026-10-15T14:30:00.000Z",
      performedBy: {
        id: 3,
        name: "Staff Somsri",
        email: "staff.somsri@example.com",
        role: "IT_STAFF",
      },
      assignee: {
        id: 3,
        name: "Staff Somsri",
        email: "staff.somsri@example.com",
        role: "IT_STAFF",
      },
    },
  ];

  const mockStaffAssignees = [
    { id: 2, name: "Staff Somchai", email: "staff.somchai@example.com", role: "IT_STAFF" },
    { id: 3, name: "Staff Somsri", email: "staff.somsri@example.com", role: "IT_STAFF" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchActionsTakenApi as any).mockResolvedValue(mockActions);
    (api.fetchStaffAssigneesApi as any).mockResolvedValue(mockStaffAssignees);
  });

  it("UI-ACT-01: Requester read-only Actions Taken rendering (omits + Record Action and Edit buttons)", async () => {
    render(<ActionsTakenSection ticketId={10} isReadOnly={true} />);

    await waitFor(() => {
      expect(screen.getByText("Actions Taken")).toBeInTheDocument();
      expect(screen.getByText("(2)")).toBeInTheDocument();
      expect(screen.getByText("Replaced RAM module in slot 2 and ran memory tests.")).toBeInTheDocument();
      expect(screen.getByText("Configured temporary workaround for network interface routing.")).toBeInTheDocument();
      expect(screen.getAllByText("Staff Somchai").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Staff Somsri").length).toBeGreaterThan(0);
      expect(screen.getByText("Verify with user after 24 hours of operation.")).toBeInTheDocument();
    });

    // In read-only mode, + Record Action button and Edit buttons MUST NOT exist
    expect(screen.queryByRole("button", { name: /\+ Record Action/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Edit$/i })).not.toBeInTheDocument();
  });

  it("UI-ACT-02: IT Staff record action modal opens, submits valid action, and refreshes list", async () => {
    const user = userEvent.setup();
    const newAction: api.ActionTaken = {
      id: 3,
      ticketId: 10,
      actionDateTime: "2026-10-15T16:00:00.000Z",
      description: "Installed firmware update v2.14 on router.",
      result: "Rebooted successfully and established active WAN connection.",
      status: "COMPLETED",
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
      performedById: 2,
      assigneeId: 2,
      version: 1,
      createdAt: "2026-10-15T16:00:00.000Z",
      updatedAt: "2026-10-15T16:00:00.000Z",
      performedBy: { id: 2, name: "Staff Somchai", email: "staff.somchai@example.com", role: "IT_STAFF" },
      assignee: { id: 2, name: "Staff Somchai", email: "staff.somchai@example.com", role: "IT_STAFF" },
    };

    (api.createActionTakenApi as any).mockResolvedValue(newAction);

    render(<ActionsTakenSection ticketId={10} isReadOnly={false} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Record Action/i })).toBeInTheDocument();
    });

    // Click "+ Record Action"
    await user.click(screen.getByRole("button", { name: /\+ Record Action/i }));

    expect(screen.getByText("Record Action Taken")).toBeInTheDocument();

    // Fill form
    const descInput = screen.getByLabelText(/Description/i);
    const resultInput = screen.getByLabelText(/Result/i);
    await user.type(descInput, "Installed firmware update v2.14 on router.");
    await user.type(resultInput, "Rebooted successfully and established active WAN connection.");

    // Submit form
    await user.click(screen.getByRole("button", { name: /Save Action Taken/i }));

    expect(api.createActionTakenApi).toHaveBeenCalledWith(10, expect.objectContaining({
      description: "Installed firmware update v2.14 on router.",
      result: "Rebooted successfully and established active WAN connection.",
      status: "COMPLETED",
      followUpRequired: false,
    }));
  });

  it("UI-ACT-03: Follow-up toggle reveals note input and enforces mandatory validation", async () => {
    const user = userEvent.setup();
    render(<ActionsTakenSection ticketId={10} isReadOnly={false} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Record Action/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+ Record Action/i }));

    // Type description and result
    await user.type(screen.getByLabelText(/Description/i), "Test action with follow up");
    await user.type(screen.getByLabelText(/Result/i), "Test action completed successfully");

    // Toggle follow-up checkbox
    const followUpCheckbox = screen.getByLabelText(/Requires further follow-up action/i);
    await user.click(followUpCheckbox);

    // Follow-up note input should appear
    expect(screen.getByLabelText(/Follow-Up Instructions \/ Note/i)).toBeInTheDocument();

    // Try to submit with empty follow-up note
    await user.click(screen.getByRole("button", { name: /Save Action Taken/i }));

    // Should display validation error
    await waitFor(() => {
      expect(screen.getByText(/Follow-up note is required when follow-up is requested/i)).toBeInTheDocument();
    });
    expect(api.createActionTakenApi).not.toHaveBeenCalled();

    // Now fill the follow-up note and submit
    await user.type(screen.getByLabelText(/Follow-Up Instructions \/ Note/i), "Call user next Monday.");
    (api.createActionTakenApi as any).mockResolvedValue({ id: 4 });
    await user.click(screen.getByRole("button", { name: /Save Action Taken/i }));

    expect(api.createActionTakenApi).toHaveBeenCalledWith(10, expect.objectContaining({
      followUpRequired: true,
      followUpNote: "Call user next Monday.",
    }));
  });

  it("UI-ACT-04: Inactive assignee alert feedback displays error message from server", async () => {
    const user = userEvent.setup();
    (api.createActionTakenApi as any).mockRejectedValue(new Error("Assigned user is inactive or not IT staff"));

    render(<ActionsTakenSection ticketId={10} isReadOnly={false} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /\+ Record Action/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /\+ Record Action/i }));
    await user.type(screen.getByLabelText(/Description/i), "Diagnostic test on hardware");
    await user.type(screen.getByLabelText(/Result/i), "No issues detected");

    await user.click(screen.getByRole("button", { name: /Save Action Taken/i }));

    await waitFor(() => {
      expect(screen.getByText("Assigned user is inactive or not IT staff")).toBeInTheDocument();
    });
  });

  it("UI-ACT-05: Concurrency conflict handling in edit modal displays warning banner on HTTP 409", async () => {
    const user = userEvent.setup();
    const conflictError: any = new Error("The action item was updated by another user. Please refresh and review.");
    conflictError.status = 409;
    conflictError.code = "CONCURRENCY_CONFLICT";

    (api.updateActionTakenApi as any).mockRejectedValue(conflictError);

    render(<ActionsTakenSection ticketId={10} isReadOnly={false} />);

    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /^Edit$/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    // Click edit on first action
    const editBtn = screen.getAllByRole("button", { name: /^Edit$/i })[0];
    await user.click(editBtn);

    expect(screen.getByText(/Edit Action Taken #1/i)).toBeInTheDocument();

    // Change description
    const descInput = screen.getByLabelText(/Description/i);
    await user.clear(descInput);
    await user.type(descInput, "Updated concurrent description");

    // Click update
    await user.click(screen.getByRole("button", { name: /Update Action/i }));

    // Should display concurrency warning banner
    await waitFor(() => {
      expect(screen.getByText("Concurrency Conflict")).toBeInTheDocument();
      expect(screen.getByText(/This action line was modified by another technician/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reload Latest Data/i })).toBeInTheDocument();
    });

    // The modal should remain open and preserve the user's typed text
    expect(screen.getByDisplayValue("Updated concurrent description")).toBeInTheDocument();
  });
});
