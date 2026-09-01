import React from "react";
import { useRequester } from "../context/RequesterContext.js";

interface HeaderProps {
  currentNav: "my-tickets" | "create-ticket";
  onNavigate: (nav: "my-tickets" | "create-ticket") => void;
}

export const Header: React.FC<HeaderProps> = ({ currentNav, onNavigate }) => {
  const { selectedRequester, setIsSelectorOpen } = useRequester();

  return (
    <header
      style={{
        backgroundColor: "#006B3C",
        color: "#FFFFFF",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          onClick={() => onNavigate("my-tickets")}
        >
          <span>TokTickIT</span>
        </div>

        <nav style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => onNavigate("my-tickets")}
            style={{
              background: currentNav === "my-tickets" ? "rgba(255, 255, 255, 0.2)" : "transparent",
              border: "none",
              color: "#FFFFFF",
              padding: "6px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: currentNav === "my-tickets" ? "600" : "normal",
              fontSize: "14px",
            }}
          >
            My Tickets
          </button>
          <button
            onClick={() => onNavigate("create-ticket")}
            style={{
              background: currentNav === "create-ticket" ? "rgba(255, 255, 255, 0.2)" : "transparent",
              border: "none",
              color: "#FFFFFF",
              padding: "6px 14px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: currentNav === "create-ticket" ? "600" : "normal",
              fontSize: "14px",
            }}
          >
            Create Ticket
          </button>
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {selectedRequester ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            <span>{selectedRequester.name}</span>
            <span style={{ opacity: 0.7, fontSize: "11px" }}>({selectedRequester.department})</span>
            <button
              onClick={() => setIsSelectorOpen(true)}
              style={{
                background: "#FFFFFF",
                color: "#006B3C",
                border: "none",
                borderRadius: "12px",
                padding: "2px 10px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                marginLeft: "6px",
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSelectorOpen(true)}
            style={{
              background: "#EAF6EF",
              color: "#006B3C",
              border: "none",
              padding: "6px 14px",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Select Requester
          </button>
        )}
      </div>
    </header>
  );
};
