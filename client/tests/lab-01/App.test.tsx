import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const mockRequester = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
  department: "Human Resources",
  isActive: true,
};

describe("App", () => {
  beforeEach(() => {
    localStorage.setItem("toktickit_selected_requester", JSON.stringify(mockRequester));
    vi.restoreAllMocks();
  });

  // WORKED EXAMPLE — provided for you.
  it("renders the TokTickIT heading", () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows Online and the seeded categories on success", async () => {
    const user = userEvent.setup();
    const mockCategories = [
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
    ];
    vi.spyOn(api, "checkSystem").mockResolvedValueOnce({
      online: true,
      categories: mockCategories,
    });

    render(<App />);
    const button = screen.getByRole("button", { name: /check system/i });
    await user.click(button);

    // Assert online badge and categories
    expect(await screen.findByText(/online/i)).toBeInTheDocument();
    expect(screen.getByText("Account and Access")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
  });

  it("shows an Offline error message when the API is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "checkSystem").mockRejectedValueOnce(new Error("Offline"));

    render(<App />);
    const button = screen.getByRole("button", { name: /check system/i });
    await user.click(button);

    // Assert offline message
    expect(await screen.findByText(/offline:/i)).toBeInTheDocument();
    expect(screen.getByText(/api is currently unavailable/i)).toBeInTheDocument();
  });
});

