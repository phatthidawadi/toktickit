import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicComments } from "../../src/components/PublicComments";
import * as ApiModule from "../../src/api";

describe("UI-COMMENT-01: Public Comments stream component", () => {
  const mockComments: ApiModule.PublicComment[] = [
    {
      id: 101,
      ticketId: 1,
      authorId: 1,
      content: "Initial public comment from requester.",
      createdAt: "2026-09-15T10:00:00.000Z",
      author: {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer.a@example.com",
        role: "REQUESTER",
      },
    },
    {
      id: 102,
      ticketId: 1,
      authorId: 5,
      content: "IT Staff update on the ticket.",
      createdAt: "2026-09-15T11:00:00.000Z",
      author: {
        id: 5,
        name: "Somchai Staff",
        email: "somchai@example.com",
        role: "IT_STAFF",
      },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Public Comment list with author profile, role badges, and timestamps", async () => {
    vi.spyOn(ApiModule, "fetchPublicCommentsApi").mockResolvedValue(mockComments);

    render(<PublicComments ticketId={1} />);

    expect(screen.getByText("Loading comments...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Public Comments (2)")).toBeInTheDocument();
    });

    expect(screen.getByText("Jennifer Anderson")).toBeInTheDocument();
    expect(screen.getByText("Requester")).toBeInTheDocument();
    expect(screen.getByText("Initial public comment from requester.")).toBeInTheDocument();

    expect(screen.getByText("Somchai Staff")).toBeInTheDocument();
    expect(screen.getByText("IT Staff")).toBeInTheDocument();
    expect(screen.getByText("IT Staff update on the ticket.")).toBeInTheDocument();
  });

  it("handles new public comment submission", async () => {
    const user = userEvent.setup();
    vi.spyOn(ApiModule, "fetchPublicCommentsApi").mockResolvedValue(mockComments);
    const createSpy = vi.spyOn(ApiModule, "createPublicCommentApi").mockResolvedValue({
      id: 103,
      ticketId: 1,
      authorId: 1,
      content: "New comment submitted via form.",
      createdAt: new Date().toISOString(),
      author: {
        id: 1,
        name: "Jennifer Anderson",
        email: "jennifer.a@example.com",
        role: "REQUESTER",
      },
    });

    const onCommentAdded = vi.fn();
    render(<PublicComments ticketId={1} onCommentAdded={onCommentAdded} />);

    await waitFor(() => {
      expect(screen.getByText("Public Comments (2)")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Add a public comment...");
    const submitBtn = screen.getByRole("button", { name: "Post Comment" });

    await user.type(input, "New comment submitted via form.");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(1, "New comment submitted via form.");
      expect(onCommentAdded).toHaveBeenCalled();
    });
  });

  it("displays validation error when attempting to submit empty content", async () => {
    const user = userEvent.setup();
    vi.spyOn(ApiModule, "fetchPublicCommentsApi").mockResolvedValue(mockComments);

    render(<PublicComments ticketId={1} />);

    await waitFor(() => {
      expect(screen.getByText("Public Comments (2)")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: "Post Comment" });
    await user.click(submitBtn);

    expect(screen.getByText("Comment content cannot be empty.")).toBeInTheDocument();
  });
});
