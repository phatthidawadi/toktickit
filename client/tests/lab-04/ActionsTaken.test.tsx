import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsTakenSection } from "../../src/components/ActionsTakenSection";
import * as ApiModule from "../../src/api";

describe("Actions Taken Subsystem Component Tests (UI-ACT-01 to UI-ACT-05)", () => {
  const mockActions: ApiModule.ActionTaken[] = [
    {
      id: 1,
      ticketId: 101,
      actionDateTime: "2026-10-15T10:00:00.000Z",
      description: "Replaced RAM module in slot 2.",
      result: "Memtest86 passed with 0 errors.",
      status: "COMPLETED",
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: "memtest_log.txt",
      performedById: 2,
      assigneeId: 2,
      version: 1,
      createdAt: "2026-10-15T10:00:00.000Z",
      updatedAt: "2026-10-15T10:00:00.000Z",
      performedBy: {
        id: 2,
        name: "Michael Brown",
        email: "michael.b@example.com",
        role: "IT_STAFF",
      },
      assignee: {
        id: 2,
        name: "Michael Brown",
        email: "michael.b@example.com",
        role: "IT_STAFF",
      },
    },
    {
      id: 2,
      ticketId: 101,
      actionDateTime: "2026-10-15T14:30:00.000Z",
      description: "Secondary motherboard inspection.",
      result: "Capacitors checked, need 24h stability monitoring.",
      status: "IN_PROGRESS",
      followUpRequired: true,
      followUpNote: "Call requester tomorrow morning to check for blue screens.",
      attachmentNotes: null,
      performedById: 2,
      assigneeId: null,
      version: 1,
      createdAt: "2026-10-15T14:30:00.000Z",
      updatedAt: "2026-10-15T14:30:00.000Z",
      performedBy: {
        id: 2,
        name: "Michael Brown",
        email: "michael.b@example.com",
        role: "IT_STAFF",
      },
      assignee: null,
    },
  ];

  const mockAssignees: ApiModule.ActionTakenUser[] = [
    { id: 2, name: "Michael Brown", email: "michael.b@example.com", role: "IT_STAFF" },
    { id: 3, name: "Sarah Admin", email: "sarah.a@example.com", role: "ADMINISTRATOR" },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // UI-ACT-01: Requesters view all Actions Taken in read-only format
  it("UI-ACT-01: renders Actions Taken in read-only format for requesters; hiding record/edit buttons", async () => {
    vi.spyOn(ApiModule, "fetchActionsTakenApi").mockResolvedValue(mockActions);

    render(<ActionsTakenSection ticketId={101} isStaffOrAdmin={false} />);

    expect(screen.getByText("Loading recorded actions...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Actions Taken")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // count pill
    });

    // Content check
    expect(screen.getAllByText("Replaced RAM module in slot 2.")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Memtest86 passed with 0 errors.")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Follow-Up Required")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Call requester tomorrow morning to check for blue screens.")[0]).toBeInTheDocument();

    // Requesters must NOT see "+ Record Action" or "Edit" buttons
    expect(screen.queryByText("+ Record Action")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit Action")).not.toBeInTheDocument();
  });

  // UI-ACT-02: Staff/Admin view actions list and can see operational buttons
  it("UI-ACT-02: renders operational actions list with + Record Action and Edit buttons for staff/admin", async () => {
    vi.spyOn(ApiModule, "fetchActionsTakenApi").mockResolvedValue(mockActions);
    vi.spyOn(ApiModule, "fetchStaffAssigneesApi").mockResolvedValue(mockAssignees);

    render(<ActionsTakenSection ticketId={101} isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "+ Record Action" })).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });

  // UI-ACT-03: Record Action modal validation and conditional follow-up note
  it("UI-ACT-03: validates required fields and dynamically toggles Follow-Up Note", async () => {
    const user = userEvent.setup();
    vi.spyOn(ApiModule, "fetchActionsTakenApi").mockResolvedValue([]);
    vi.spyOn(ApiModule, "fetchStaffAssigneesApi").mockResolvedValue(mockAssignees);

    render(<ActionsTakenSection ticketId={101} isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByText("No technical actions have been recorded for this ticket yet.")).toBeInTheDocument();
    });

    // Open record modal
    const recordBtn = screen.getByRole("button", { name: "+ Record Action" });
    await user.click(recordBtn);

    expect(screen.getByText("Record Action Taken")).toBeInTheDocument();

    // Follow-up note field should initially NOT be visible
    expect(screen.queryByLabelText(/Follow-Up Instructions \/ Note/i)).not.toBeInTheDocument();

    // Toggle follow-up checkbox
    const followUpToggle = screen.getByRole("checkbox", { name: /Requires further follow-up action/i });
    await user.click(followUpToggle);

    // Follow-up note field should now appear
    expect(screen.getByLabelText(/Follow-Up Instructions \/ Note/i)).toBeInTheDocument();

    // Try submitting without description or result
    const saveBtn = screen.getByRole("button", { name: "Save Action Taken" });
    await user.click(saveBtn);

    expect(screen.getByText("Description is required (1-2000 characters).")).toBeInTheDocument();

    // Fill description, test result requirement
    await user.type(screen.getByLabelText(/Action Description/i), "Test action description");
    await user.click(saveBtn);

    expect(screen.getByText("Result is required (1-2000 characters).")).toBeInTheDocument();

    // Fill result, test follow-up note requirement
    await user.type(screen.getByLabelText(/Action Result/i), "Test action result");
    await user.click(saveBtn);

    expect(screen.getByText("Follow-Up Note is required when follow-up is checked (1-1000 characters).")).toBeInTheDocument();
  });

  // UI-ACT-04: Submitting record action calls API and refreshes the list
  it("UI-ACT-04: submits valid action and immediately updates list", async () => {
    const user = userEvent.setup();
    vi.spyOn(ApiModule, "fetchActionsTakenApi")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 10,
          ticketId: 101,
          actionDateTime: new Date().toISOString(),
          description: "Configured static IP on workstation.",
          result: "Network connectivity restored.",
          status: "COMPLETED",
          followUpRequired: false,
          followUpNote: null,
          attachmentNotes: null,
          performedById: 2,
          assigneeId: null,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          performedBy: { id: 2, name: "Michael Brown", email: "michael.b@example.com", role: "IT_STAFF" },
          assignee: null,
        },
      ]);
    vi.spyOn(ApiModule, "fetchStaffAssigneesApi").mockResolvedValue(mockAssignees);
    const createSpy = vi.spyOn(ApiModule, "createActionTakenApi").mockResolvedValue({
      id: 10,
      ticketId: 101,
      actionDateTime: new Date().toISOString(),
      description: "Configured static IP on workstation.",
      result: "Network connectivity restored.",
      status: "COMPLETED",
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
      performedById: 2,
      assigneeId: null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      performedBy: { id: 2, name: "Michael Brown", email: "michael.b@example.com", role: "IT_STAFF" },
      assignee: null,
    });

    render(<ActionsTakenSection ticketId={101} isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "+ Record Action" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "+ Record Action" }));

    await user.type(screen.getByLabelText(/Action Description/i), "Configured static IP on workstation.");
    await user.type(screen.getByLabelText(/Action Result/i), "Network connectivity restored.");

    await user.click(screen.getByRole("button", { name: "Save Action Taken" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(101, expect.objectContaining({
        description: "Configured static IP on workstation.",
        result: "Network connectivity restored.",
        status: "COMPLETED",
        followUpRequired: false,
      }));
    });

    await waitFor(() => {
      expect(screen.getAllByText("Configured static IP on workstation.")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Network connectivity restored.")[0]).toBeInTheDocument();
    });
  });

  // UI-ACT-05: Optimistic concurrency 409 conflict handling displays prompt to reload
  it("UI-ACT-05: displays concurrency conflict banner on HTTP 409 and prompts to reload latest data", async () => {
    const user = userEvent.setup();
    vi.spyOn(ApiModule, "fetchActionsTakenApi").mockResolvedValue(mockActions);
    vi.spyOn(ApiModule, "fetchStaffAssigneesApi").mockResolvedValue(mockAssignees);

    const conflictError: any = new Error("The action item was updated by another user. Please refresh and review.");
    conflictError.status = 409;
    conflictError.code = "CONCURRENCY_CONFLICT";

    const updateSpy = vi.spyOn(ApiModule, "updateActionTakenApi").mockRejectedValue(conflictError);

    render(<ActionsTakenSection ticketId={101} isStaffOrAdmin={true} />);

    await waitFor(() => {
      expect(screen.getByTestId("action-row-1")).toBeInTheDocument();
    });

    // Open edit modal for action 1
    const editBtn = screen.getByTestId("action-row-1").querySelector("button");
    expect(editBtn).toBeInTheDocument();
    await user.click(editBtn!);

    expect(screen.getByText("Edit Action Taken")).toBeInTheDocument();

    // Modify description
    const descInput = screen.getByLabelText(/Action Description/i);
    await user.clear(descInput);
    await user.type(descInput, "Attempting concurrent edit description.");

    // Submit edit
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(1, expect.objectContaining({
        version: 1,
        description: "Attempting concurrent edit description.",
      }));
    });

    // Verify Concurrency Conflict banner is displayed
    await waitFor(() => {
      expect(screen.getByText("Concurrency Conflict")).toBeInTheDocument();
      expect(
        screen.getByText(/This action line was modified by another technician in another session/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reload Latest Data" })).toBeInTheDocument();
    });

    // Form inputs must preserve user-entered values
    expect(descInput).toHaveValue("Attempting concurrent edit description.");
  });
});
