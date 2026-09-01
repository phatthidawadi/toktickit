import { useState, useEffect } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorScreen } from "./components/RequesterSelectorScreen.js";

type UiState = "idle" | "loading" | "success" | "error";

function MainContent() {
  const [currentNav, setCurrentNav] = useState<"my-tickets" | "create-ticket">("my-tickets");
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const { selectedRequester } = useRequester();

  async function handleCheck() {
    setState("loading");
    try {
      const status = await checkSystem();
      setCategories(status.categories);
      setState("success");
    } catch (error) {
      setState("error");
    }
  }

  return (
    <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh" }}>
      <Header currentNav={currentNav} onNavigate={(nav) => setCurrentNav(nav)} />
      <RequesterSelectorScreen />

      <main className="container py-4" style={{ maxWidth: 800 }}>
        {selectedRequester && (
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body">
              <h5 className="card-title text-success">
                Welcome, {selectedRequester.name}
              </h5>
              <p className="card-text text-secondary mb-0">
                Current Testing Context: <strong>{selectedRequester.department}</strong> ({selectedRequester.email})
              </p>
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h2 className="h4 mb-3" style={{ color: "#1F2925" }}>
              {currentNav === "my-tickets" ? "My Tickets" : "Create Ticket"}
            </h2>
            <p className="text-secondary">
              {currentNav === "my-tickets"
                ? "View and track your submitted support requests."
                : "Submit a new IT support ticket."}
            </p>

            <button className="btn btn-success mt-2" onClick={handleCheck} disabled={state === "loading"}>
              {state === "loading" ? "Checking System Status..." : "Check System Status"}
            </button>

            <div className="mt-3">
              {state === "loading" && <p className="text-secondary">Checking system status...</p>}
              {state === "error" && (
                <div className="alert alert-danger">
                  <strong>Offline:</strong> API is currently unavailable.
                </div>
              )}
              {state === "success" && (
                <div>
                  <div className="badge bg-success mb-3 fs-6">Online</div>
                  <ul className="list-group">
                    {categories.map((cat) => (
                      <li key={cat.id} className="list-group-item">
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RequesterProvider>
      <MainContent />
    </RequesterProvider>
  );
}
