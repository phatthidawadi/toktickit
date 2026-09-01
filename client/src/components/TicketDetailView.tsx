import React, { useState, useEffect } from "react";
import { fetchTicketDetail, Ticket } from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface TicketDetailViewProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticketId, onBack }) => {
  const { selectedRequester, setIsSelectorOpen } = useRequester();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedRequester) return;

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    fetchTicketDetail(ticketId, selectedRequester.id)
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.message.includes("403 Forbidden") || err.message.includes("Access denied")) {
          setIsForbidden(true);
        } else {
          setError(err.message || "Failed to load ticket details");
        }
        setLoading(false);
      });
  }, [ticketId, selectedRequester]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "NEW":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF", border: "1px solid #BFDBFE" };
      case "IN_PROGRESS":
        return { backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" };
      case "RESOLVED":
        return { backgroundColor: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" };
      case "CLOSED":
        return { backgroundColor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" };
      default:
        return { backgroundColor: "#EAF6EF", color: "#006B3C", border: "1px solid #C8E6D5" };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return { color: "#C5221F", fontWeight: "bold" };
      case "HIGH":
        return { color: "#D97706", fontWeight: "600" };
      case "MEDIUM":
        return { color: "#006B3C", fontWeight: "500" };
      default:
        return { color: "#65756E", fontWeight: "normal" };
    }
  };

  if (!selectedRequester) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", color: "#1F2925", marginBottom: "12px" }}>
          No Requester Context Selected
        </h3>
        <p style={{ color: "#65756E", fontSize: "14px", marginBottom: "20px" }}>
          Please select a Development Requester to view ticket details.
        </p>
        <button
          onClick={() => setIsSelectorOpen(true)}
          style={{
            backgroundColor: "#006B3C",
            color: "#FFFFFF",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Select Requester Context
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          padding: "40px",
          textAlign: "center",
          color: "#65756E",
        }}
      >
        Loading ticket details...
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #F87171",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#FDF2F2",
            color: "#C5221F",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          403
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#C5221F", marginBottom: "8px" }}>
          403 Forbidden Access
        </h3>
        <p style={{ color: "#1F2925", fontSize: "14px", marginBottom: "20px" }}>
          Access denied. You can only view tickets that you requested under your active requester context.
        </p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: "#006B3C",
            color: "#FFFFFF",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Back to My Tickets
        </button>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", color: "#C5221F", marginBottom: "12px" }}>
          Ticket Not Found
        </h3>
        <p style={{ color: "#65756E", fontSize: "14px", marginBottom: "20px" }}>
          {error || "The requested ticket does not exist or has been removed."}
        </p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: "#006B3C",
            color: "#FFFFFF",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Back to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Navigation & Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #C8D2CC",
            color: "#1F2925",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          &larr; Back to My Tickets
        </button>

        <span
          style={{
            backgroundColor: "#EAF6EF",
            color: "#006B3C",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            border: "1px solid #C8E6D5",
          }}
        >
          Read-Only Mode (Sprint 2 Spec 5.4)
        </span>
      </div>

      {/* Ticket Header & Specification Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid #E0E6E2",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#006B3C" }}>
              {ticket.ticketNumber}
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1F2925", margin: "4px 0 0 0" }}>
              {ticket.summary}
            </h2>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", ...getPriorityBadgeStyle(ticket.requestedPriority) }}>
              Priority: {ticket.requestedPriority}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "600",
                ...getStatusBadgeStyle(ticket.currentStatus),
              }}
            >
              {ticket.currentStatus}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            backgroundColor: "#F5F7F6",
            padding: "16px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          <div>
            <span style={{ color: "#65756E", display: "block", marginBottom: "2px" }}>Category</span>
            <strong style={{ color: "#1F2925" }}>{ticket.category?.name || "N/A"}</strong>
          </div>
          <div>
            <span style={{ color: "#65756E", display: "block", marginBottom: "2px" }}>Related System</span>
            <strong style={{ color: "#1F2925" }}>{ticket.relatedSystem?.name || "N/A"}</strong>
          </div>
          <div>
            <span style={{ color: "#65756E", display: "block", marginBottom: "2px" }}>Submitted Date</span>
            <strong style={{ color: "#1F2925" }}>{new Date(ticket.createdAt).toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: "#65756E", display: "block", marginBottom: "2px" }}>Last Updated</span>
            <strong style={{ color: "#1F2925" }}>{new Date(ticket.updatedAt).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          padding: "24px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2925", marginBottom: "12px" }}>
          Detailed Description
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#1F2925",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {ticket.description}
        </p>
      </div>

      {/* File Attachments Section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          padding: "24px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2925", marginBottom: "12px" }}>
          Attachments
        </h3>

        {!ticket.attachments || ticket.attachments.length === 0 ? (
          <p style={{ color: "#65756E", fontSize: "14px", margin: 0 }}>
            No file attachments uploaded for this ticket.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {ticket.attachments.map((att) => (
              <li
                key={att.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F5F7F6",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  border: "1px solid #E0E6E2",
                }}
              >
                <div>
                  <strong style={{ fontSize: "14px", color: "#1F2925" }}>{att.originalName}</strong>
                  <span style={{ fontSize: "12px", color: "#65756E", marginLeft: "10px" }}>
                    ({(att.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
