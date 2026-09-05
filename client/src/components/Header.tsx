import React from "react";
import { useRequester } from "../context/RequesterContext.js";

interface HeaderProps {
  currentNav: "my-tickets" | "create-ticket";
  onNavigate: (nav: "my-tickets" | "create-ticket") => void;
}

export const Header: React.FC<HeaderProps> = ({ currentNav, onNavigate }) => {
  const { selectedRequester, setIsSelectorOpen } = useRequester();

  return (
    <header className="site-header">
      <div className="site-header-inner container-fluid">
        <div className="site-header-brand-nav">
          <div className="site-brand" onClick={() => onNavigate("my-tickets")}>
            <span>TokTickIT</span>
          </div>

          <nav className="site-nav">
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
          </nav>
        </div>

        <div className="site-header-requester">
          {selectedRequester ? (
            <div className="requester-badge">
              <span className="requester-name">{selectedRequester.name}</span>
              <span className="requester-dept">({selectedRequester.department})</span>
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="requester-change-btn"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="requester-select-btn"
            >
              Select Requester
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
