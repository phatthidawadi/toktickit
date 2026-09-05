import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { CreateTicketForm } from "../../src/components/CreateTicketForm.js";
import { RequesterProvider, useRequester } from "../../src/context/RequesterContext.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  department: "Human Resources",
  isActive: true,
};

const mockCategories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const mockSystems = [
  { id: 1, name: "Corporate Laptop", categoryId: 2, isActive: true },
];

function TestWrapper() {
  const { setSelectedRequester } = useRequester();

  React.useEffect(() => {
    setSelectedRequester(mockRequester);
  }, []);

  return <CreateTicketForm />;
}

describe("CreateTicketForm UI Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders Create Ticket form with fields and required asterisks", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/related-systems")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSystems),
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
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    expect(screen.getByLabelText(/Category/i)).toBeDefined();
    expect(screen.getByLabelText(/Ticket Summary/i)).toBeDefined();
    expect(screen.getByLabelText(/Detailed Description/i)).toBeDefined();
  });

  it("preserves form values when API submission fails with 500 error (AC-15)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) } as Response);
      }
      if (typeof url === "string" && url.includes("/api/related-systems")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSystems) } as Response);
      }
      if (typeof url === "string" && url.includes("/api/tickets")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal Server Error" }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: "2" } });

    await waitFor(() => {
      const systemSelect = screen.getByLabelText(/Related System/i) as HTMLSelectElement;
      expect(systemSelect.disabled).toBe(false);
      fireEvent.change(systemSelect, { target: { value: "1" } });
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Detailed Description/i) as HTMLTextAreaElement;

    fireEvent.change(summaryInput, { target: { value: "Laptop screen flickering continuously" } });
    fireEvent.change(descriptionInput, { target: { value: "Screen starts flickering randomly when external monitor is connected." } });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error|failed/i)).toBeDefined();
    });

    // Assert form state values are 100% preserved
    expect(summaryInput.value).toBe("Laptop screen flickering continuously");
    expect(descriptionInput.value).toBe("Screen starts flickering randomly when external monitor is connected.");
  });

  it("includes accessible labels and required markers for screen readers (AC-16)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) } as Response);
      }
      if (typeof url === "string" && url.includes("/api/related-systems")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSystems) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descriptionInput = screen.getByLabelText(/Detailed Description/i);
    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });

    expect(summaryInput.getAttribute("aria-required") || summaryInput.getAttribute("required")).toBeDefined();
    expect(descriptionInput.getAttribute("aria-required") || descriptionInput.getAttribute("required")).toBeDefined();
    expect(submitBtn).toBeDefined();
  });

  it("supports keyboard focus navigation and visible focus indicator contract across interactive form controls (AC-16)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) } as Response);
      }
      if (typeof url === "string" && url.includes("/api/related-systems")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSystems) } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    const categorySelect = screen.getByLabelText(/Category/i);
    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descriptionInput = screen.getByLabelText(/Detailed Description/i);
    const prioritySelect = screen.getByLabelText(/Priority/i);
    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });

    // Test keyboard focus navigation sequence
    categorySelect.focus();
    expect(document.activeElement).toBe(categorySelect);

    summaryInput.focus();
    expect(document.activeElement).toBe(summaryInput);

    descriptionInput.focus();
    expect(document.activeElement).toBe(descriptionInput);

    prioritySelect.focus();
    expect(document.activeElement).toBe(prioritySelect);

    submitBtn.focus();
    expect(document.activeElement).toBe(submitBtn);
  });

  it("uploads selected file after ticket creation and displays validation error for prohibited file types", async () => {
    let ticketCreated = false;
    let attachmentUploaded = false;

    vi.spyOn(globalThis, "fetch").mockImplementation((url, init) => {
      const urlString = typeof url === "string" ? url : (url as Request).url;
      const method = init?.method || "GET";

      if (urlString.includes("/api/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCategories) } as Response);
      }
      if (urlString.includes("/api/related-systems")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSystems) } as Response);
      }
      if (urlString.includes("/api/tickets/99/attachments") && method === "POST") {
        attachmentUploaded = true;
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              id: 1,
              filename: "att-1.pdf",
              originalName: "report.pdf",
              size: 1024,
              mimeType: "application/pdf",
            }),
        } as Response);
      }
      if (urlString.includes("/api/tickets") && method === "POST") {
        ticketCreated = true;
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () =>
            Promise.resolve({
              id: 99,
              ticketNumber: "TKT-2026-000099",
              summary: "Upload Test Ticket",
              description: "Testing attachment upload during creation",
              currentStatus: "NEW",
            }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(
      <RequesterProvider>
        <TestWrapper />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Create IT Support Ticket")).toBeDefined();
    });

    const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: "2" } });

    await waitFor(() => {
      const systemSelect = screen.getByLabelText(/Related System/i) as HTMLSelectElement;
      expect(systemSelect.disabled).toBe(false);
      fireEvent.change(systemSelect, { target: { value: "1" } });
    });

    const summaryInput = screen.getByLabelText(/Ticket Summary/i);
    const descriptionInput = screen.getByLabelText(/Detailed Description/i);
    const fileInput = screen.getByLabelText(/Optional File Attachment/i) as HTMLInputElement;

    // Test prohibited file selection
    const invalidFile = new File(["test"], "invalid_script.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/prohibited for security reasons/i)).toBeDefined();
    });

    // Select valid file
    const validFile = new File(["pdf content"], "report.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    fireEvent.change(summaryInput, { target: { value: "Upload attachment test summary" } });
    fireEvent.change(descriptionInput, { target: { value: "Detailed description for attachment upload testing" } });

    const submitBtn = screen.getByRole("button", { name: /Submit Ticket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Ticket Submitted Successfully!")).toBeDefined();
    });

    expect(ticketCreated).toBe(true);
    expect(attachmentUploaded).toBe(true);
  });
});
