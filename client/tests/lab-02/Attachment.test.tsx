import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { TicketDetailView } from "../../src/components/TicketDetailView.js";
import { RequesterProvider, useRequester } from "../../src/context/RequesterContext.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  department: "Human Resources",
  isActive: true,
};

const mockTicketWithAttachments = {
  id: 1,
  ticketNumber: "TKT-2026-000001",
  summary: "Cannot connect to Campus Wi-Fi",
  description: "Getting authorization error when connecting to Wi-Fi network",
  requestedPriority: "HIGH",
  currentStatus: "NEW",
  requesterId: 1,
  categoryId: 4,
  relatedSystemId: 6,
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
  category: { id: 4, name: "Network" },
  relatedSystem: { id: 6, name: "Campus Wi-Fi" },
  attachments: [
    {
      id: 10,
      filename: "attachment-1.pdf",
      originalName: "system_error_screenshot.png",
      size: 245760,
      mimeType: "image/png",
      isRemoved: false,
    },
    {
      id: 11,
      filename: "attachment-2.pdf",
      originalName: "confidential_log.pdf",
      size: 1024,
      mimeType: "application/pdf",
      isRemoved: true,
      removedReason: "Uploaded wrong log file",
    },
  ],
};

function TestWrapper() {
  const { setSelectedRequester } = useRequester();

  React.useEffect(() => {
    setSelectedRequester(mockRequester);
  }, []);

  return <TicketDetailView ticketId={1} onBack={() => {}} />;
}

describe("Attachment Lifecycle UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders active attachment download link and soft-removed state correctly", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/tickets/1")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTicketWithAttachments),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("system_error_screenshot.png")).toBeDefined();
    });

    expect(screen.getByText("Download")).toBeDefined();
    expect(screen.getByText(/Soft-Removed/i)).toBeDefined();
    expect(screen.getByText(/Download Disabled \(410 Gone\)/i)).toBeDefined();
  });
});
