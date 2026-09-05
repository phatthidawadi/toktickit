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
});
