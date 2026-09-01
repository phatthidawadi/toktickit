import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MyTicketsView } from "../../src/components/MyTicketsView.js";
import { RequesterProvider, useRequester } from "../../src/context/RequesterContext.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  department: "Human Resources",
  isActive: true,
};

const mockPaginatedTickets = {
  tickets: [
    {
      id: 1,
      ticketNumber: "TKT-2026-000001",
      summary: "Cannot connect to Campus Wi-Fi",
      description: "Getting authorization error when connecting to Wi-Fi",
      requestedPriority: "HIGH",
      currentStatus: "NEW",
      requesterId: 1,
      categoryId: 4,
      relatedSystemId: 6,
      createdAt: "2026-09-01T12:00:00.000Z",
      updatedAt: "2026-09-01T12:00:00.000Z",
      category: { id: 4, name: "Network" },
      relatedSystem: { id: 6, name: "Campus Wi-Fi" },
      attachments: [],
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

function TestWrapper() {
  const { setSelectedRequester } = useRequester();

  React.useEffect(() => {
    setSelectedRequester(mockRequester);
  }, []);

  return <MyTicketsView onCreateClick={() => {}} />;
}

describe("MyTicketsView UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders ticket table with search input and status badges", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 4, name: "Network" }]),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/tickets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPaginatedTickets),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("My IT Support Tickets")).toBeDefined();
    });

    expect(screen.getByPlaceholderText(/Search Ticket # or Summary/i)).toBeDefined();
    expect(screen.getByText("TKT-2026-000001")).toBeDefined();
    expect(screen.getByText("Cannot connect to Campus Wi-Fi")).toBeDefined();
    expect(screen.getAllByText("NEW").length).toBeGreaterThan(0);
  });
});
