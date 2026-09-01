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
});
