import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorScreen } from "./components/RequesterSelectorScreen.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";

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

      <main className="container py-4" style={{ maxWidth: 840 }}>
        {currentNav === "create-ticket" ? (
          <CreateTicketForm onCancel={() => setCurrentNav("my-tickets")} />
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 m-0" style={{ color: "#1F2925" }}>
                  My Tickets
                </h2>
                <button
                  className="btn btn-success"
                  onClick={() => setCurrentNav("create-ticket")}
                  style={{ backgroundColor: "#006B3C", border: "none" }}
                >
                  Create Ticket
                </button>
              </div>
              <p className="text-secondary">
                View and track your submitted support requests.
              </p>

              {selectedRequester && (
                <div className="alert alert-light border mb-4">
                  Current Testing Context: <strong>{selectedRequester.name}</strong> (
                  {selectedRequester.department})
                </div>
              )}

              <button className="btn btn-outline-success btn-sm mt-2" onClick={handleCheck} disabled={state === "loading"}>
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
        )}
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
