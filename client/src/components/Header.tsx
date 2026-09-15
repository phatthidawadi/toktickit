import React from "react";
import { useAuth } from "../context/AuthContext.js";
import { useRequester } from "../context/RequesterContext.js";

export type NavItem = "my-tickets" | "create-ticket" | "ticket-queue" | "user-management";

interface HeaderProps {
  currentNav: string;
  onNavigate: (nav: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentNav, onNavigate }) => {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_err) {
    // Fallback if not wrapped in AuthProvider
  }

  let selectedRequester: any = null;
  let setIsSelectorOpen: any = null;
  try {
    const reqCtx = useRequester();
    if (reqCtx) {
      selectedRequester = reqCtx.selectedRequester;
      setIsSelectorOpen = reqCtx.setIsSelectorOpen;
    }
  } catch (_err) {
    // Outside RequesterProvider
  }

  const user = authContext?.user || null;
  const logout = authContext?.logout;

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
  };

  const role = user?.role;

  const getRoleBadge = () => {
    if (!role) return null;

    if (role === "REQUESTER") {
      return (
        <span
          className="role-badge role-badge-requester"
          style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
        >
          Requester
        </span>
      );
    }
    if (role === "IT_STAFF") {
      return (
        <span
          className="role-badge role-badge-staff"
          style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
        >
          IT Staff
        </span>
      );
    }
    if (role === "ADMINISTRATOR") {
      return (
        <span
          className="role-badge role-badge-admin"
          style={{ backgroundColor: "#E0E7FF", color: "#3730A3" }}
        >
          Administrator
        </span>
      );
    }

    return <span className="role-badge">{role}</span>;
  };

  return (
    <header className="site-header">
      <div className="site-header-inner container-fluid">
        <div className="site-header-brand-nav">
          <div
            className="site-brand"
            onClick={() => {
              if (role === "IT_STAFF" || role === "ADMINISTRATOR") {
                onNavigate("ticket-queue");
              } else {
                onNavigate("my-tickets");
              }
            }}
          >
            <span>TokTickIT</span>
          </div>

          <nav className="site-nav">
            {(!role || role === "REQUESTER") && (
              <>
                <button
                  onClick={() => onNavigate("my-tickets")}
                  className={`nav-btn ${currentNav === "my-tickets" ? "active" : ""}`}
                >
                  My Tickets
                </button>
                <button
                  onClick={() => onNavigate("create-ticket")}
                  className={`nav-btn ${currentNav === "create-ticket" ? "active" : ""}`}
                >
                  Create Ticket
                </button>
              </>
            )}

            {role === "IT_STAFF" && (
              <button
                onClick={() => onNavigate("ticket-queue")}
                className={`nav-btn ${currentNav === "ticket-queue" ? "active" : ""}`}
              >
                Ticket Queue
              </button>
            )}

            {role === "ADMINISTRATOR" && (
              <>
                <button
                  onClick={() => onNavigate("ticket-queue")}
                  className={`nav-btn ${currentNav === "ticket-queue" ? "active" : ""}`}
                >
                  Ticket Queue
                </button>
                <button
                  onClick={() => onNavigate("user-management")}
                  className={`nav-btn ${currentNav === "user-management" ? "active" : ""}`}
                >
                  User Management
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="site-header-requester">
          {user ? (
            <div className="user-profile-badge" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="user-name" style={{ fontWeight: 600 }}>{user.name}</span>
              {getRoleBadge()}
              <button
                onClick={handleLogout}
                className="logout-btn nav-btn"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  marginLeft: "6px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          ) : selectedRequester ? (
            <div className="requester-badge">
              <span className="requester-name">{selectedRequester.name}</span>
              <span className="requester-dept">({selectedRequester.department})</span>
              {setIsSelectorOpen && (
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="requester-change-btn"
                >
                  Change
                </button>
              )}
            </div>
          ) : (
            setIsSelectorOpen && (
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="requester-select-btn"
              >
                Select Requester
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
