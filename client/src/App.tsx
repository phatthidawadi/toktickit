import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  void categories;

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
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      <div className="mt-4">
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
  );
}
