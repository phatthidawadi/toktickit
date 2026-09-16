import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InternalNotes } from "../../src/components/InternalNotes";
import * as api from "../../src/api";

vi.mock("../../src/api", async () => {
  const actual = await vi.importActual("../../src/api");
  return {
    ...actual,
    fetchInternalNotesApi: vi.fn(),
    createInternalNoteApi: vi.fn(),
  };
});

describe("UI-NOTE-01: Internal Note form & amber highlight container rendering component", () => {
  const mockNotes = [
    {
      id: 101,
      ticketId: 1,
      authorId: 5,
      content: "Initial investigation shows network gateway timeout.",
      createdAt: "2026-09-01T11:00:00.000Z",
      author: {
        id: 5,
        name: "Staff Somchai",
        email: "staff.somchai@example.com",
        role: "IT_STAFF",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchInternalNotesApi as any).mockResolvedValue(mockNotes);
  });

  it("renders Internal Notes component inside amber container and lists existing notes", async () => {
    const { container } = render(<InternalNotes ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Confidential Internal Notes/i)).toBeInTheDocument();
      expect(screen.getByText("Staff/Admin Only")).toBeInTheDocument();
      expect(screen.getByText("Initial investigation shows network gateway timeout.")).toBeInTheDocument();
      expect(screen.getByText("Staff Somchai")).toBeInTheDocument();
    });

    const notesContainer = container.querySelector("#internal-notes-container");
    expect(notesContainer).toBeInTheDocument();
  });

  it("allows submitting a new confidential internal note", async () => {
    const user = userEvent.setup();
    (api.createInternalNoteApi as any).mockResolvedValue({
      id: 102,
      ticketId: 1,
      authorId: 5,
      content: "Checked routing tables and restarted service.",
      createdAt: "2026-09-01T12:00:00.000Z",
      author: { id: 5, name: "Staff Somchai", email: "staff.somchai@example.com", role: "IT_STAFF" },
    });

    render(<InternalNotes ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Record a confidential internal note/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Record a confidential internal note/i);
    await user.type(textarea, "Checked routing tables and restarted service.");

    const submitBtn = screen.getByRole("button", { name: /Save Internal Note/i });
    await user.click(submitBtn);

    expect(api.createInternalNoteApi).toHaveBeenCalledWith(1, "Checked routing tables and restarted service.");
  });
});
