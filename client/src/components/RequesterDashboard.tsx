import React, { useState, useEffect } from "react";
import {
  fetchRequesterDashboard,
  RequesterDashboardData,
  DashboardTicketSummary,
} from "../api.js";
import { useAuth } from "../context/AuthContext.js";

interface RequesterDashboardProps {
  onNavigateToTickets: (filter?: string) => void;
  onNavigateToTicketDetail: (ticketId: number) => void;
  onNavigateToCreate: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  NEW: { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  OPEN: { bg: "#E0E7FF", color: "#3730A3", border: "#C7D2FE" },
  IN_PROGRESS: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  WAITING_FOR_REQUESTER: { bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  RESOLVED: { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  CLOSED: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
  REOPENED: { bg: "#E0E7FF", color: "#4338CA", border: "#C7D2FE" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { bg: "#EAF6EF", color: "#006B3C", border: "#C8E6D5" };
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onNavigateToTickets,
  onNavigateToTicketDetail,
  onNavigateToCreate,
}) => {
  let authContext: any = null;
  try { authContext = useAuth(); } catch (_e) {}
  const user = authContext?.user;

  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRequesterDashboard()
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load dashboard."); setLoading(false); });
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#65756E" }}>Loading dashboard...</div>;
  if (error || !data) return (
    <div style={{ backgroundColor: "#FDF2F2", border: "1px solid #F87171", borderRadius: "8px", padding: "24px", color: "#C5221F" }}>
      {error || "Failed to load dashboard."}
    </div>
  );

  const metricCards = [
    { id: "dash-open-tickets", label: "Open Tickets", value: data.totalOpenTickets, subtitle: "Active tickets in progress", borderColor: "#006B3C", valueBg: "#EAF6EF", valueColor: "#006B3C", onClick: () => onNavigateToTickets("open") },
    { id: "dash-waiting-tickets", label: "Waiting on You", value: data.ticketsWaitingForRequester, subtitle: "Tickets awaiting your response", borderColor: data.ticketsWaitingForRequester > 0 ? "#D97706" : "#E0E6E2", valueBg: data.ticketsWaitingForRequester > 0 ? "#FEF3C7" : "#F5F7F6", valueColor: data.ticketsWaitingForRequester > 0 ? "#92400E" : "#374151", onClick: () => onNavigateToTickets("waiting") },
    { id: "dash-resolved-tickets", label: "Recently Resolved", value: data.recentlyResolvedTickets, subtitle: "Resolved in the last 30 days", borderColor: "#0B7A46", valueBg: "#D1FAE5", valueColor: "#065F46", onClick: () => onNavigateToTickets("resolved") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div style={{ backgroundColor: "#006B3C", borderRadius: "12px", padding: "24px 28px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 4px 0" }}>Welcome back, {user?.name || "Requester"}!</h1>
          <p style={{ fontSize: "13px", margin: 0, opacity: 0.85 }}>{today}</p>
        </div>
        <span style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>Requester</span>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {metricCards.map((card) => (
          <button key={card.id} id={card.id} onClick={card.onClick}
            style={{ backgroundColor: "#FFFFFF", border: `2px solid ${card.borderColor}`, borderRadius: "10px", padding: "20px", textAlign: "left", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,107,60,0.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: card.valueColor, backgroundColor: card.valueBg, borderRadius: "8px", padding: "6px 12px", display: "inline-block", marginBottom: "10px", minWidth: "52px", textAlign: "center" }}>{card.value}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1F2925", marginBottom: "4px" }}>{card.label}</div>
            <div style={{ fontSize: "12px", color: "#65756E" }}>{card.subtitle}</div>
          </button>
        ))}
        <button id="dash-create-ticket" onClick={onNavigateToCreate}
          style={{ backgroundColor: "#006B3C", border: "2px solid #006B3C", borderRadius: "10px", padding: "20px", textAlign: "left", cursor: "pointer", color: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#004F2C")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#006B3C")}>
          <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "10px", opacity: 0.9 }}>+</div>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Create Ticket</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Submit a new support request</div>
        </button>
      </div>

      {/* Recent Tickets */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E0E6E2", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E0E6E2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2925", margin: 0 }}>Recent Tickets</h2>
          <button id="dash-view-all-tickets" onClick={() => onNavigateToTickets()} style={{ backgroundColor: "transparent", border: "1px solid #006B3C", color: "#006B3C", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View All</button>
        </div>
        {data.myRecentTickets.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#65756E", fontSize: "14px" }}>No tickets yet. Create your first ticket above.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table id="dash-recent-tickets-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F5F7F6" }}>
                  {["Ticket #", "Summary", "Status", "Last Updated", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#65756E", borderBottom: "1px solid #E0E6E2", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.myRecentTickets.map((ticket: DashboardTicketSummary, i: number) => (
                  <tr key={ticket.id} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFBFA", borderBottom: "1px solid #F0F4F1" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#006B3C", whiteSpace: "nowrap" }}>{ticket.ticketNumber}</td>
                    <td style={{ padding: "12px 16px", color: "#1F2925", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.summary}</td>
                    <td style={{ padding: "12px 16px" }}><StatusPill status={ticket.currentStatus} /></td>
                    <td style={{ padding: "12px 16px", color: "#65756E", whiteSpace: "nowrap" }}>{new Date(ticket.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button id={`dash-open-ticket-${ticket.id}`} onClick={() => onNavigateToTicketDetail(ticket.id)} style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
