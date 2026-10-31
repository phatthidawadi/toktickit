import React, { useState, useEffect } from "react";
import { fetchStaffDashboard, StaffDashboardData, DashboardTicketSummary } from "../api.js";
import { useAuth } from "../context/AuthContext.js";

interface StaffDashboardProps {
  onNavigateToQueue: (filter?: string) => void;
  onNavigateToTicketDetail: (ticketId: number) => void;
  onNavigateToUserManagement: () => void;
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
    <span style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: "2px 9px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return <span style={{ color: "#65756E", fontSize: "12px" }}>�</span>;
  const map: Record<string, string> = { URGENT: "#C5221F", HIGH: "#D97706", MEDIUM: "#006B3C", LOW: "#6B7280" };
  return <span style={{ color: map[priority] || "#374151", fontWeight: 700, fontSize: "12px" }}>{priority}</span>;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigateToQueue,
  onNavigateToTicketDetail,
  onNavigateToUserManagement,
}) => {
  let authContext: any = null;
  try { authContext = useAuth(); } catch (_e) {}
  const user = authContext?.user;
  const isAdmin = user?.role === "ADMINISTRATOR";

  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchStaffDashboard()
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load dashboard."); setLoading(false); });
  }, []);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#65756E" }}>Loading dashboard...</div>;
  if (error || !data) return (
    <div style={{ backgroundColor: "#FDF2F2", border: "1px solid #F87171", borderRadius: "8px", padding: "24px", color: "#C5221F" }}>
      {error || "Failed to load dashboard."}
    </div>
  );

  const overviewCards = [
    { id: "dash-unassigned", label: "Unassigned", value: data.unassignedTickets, subtitle: "Tickets needing assignment", warn: data.unassignedTickets > 0, onClick: () => onNavigateToQueue("unassigned") },
    { id: "dash-assigned-me", label: "Assigned to Me", value: data.myAssignedTickets, subtitle: "My active workload", warn: false, onClick: () => onNavigateToQueue("my-assigned") },
    { id: "dash-urgent", label: "Urgent Priority", value: data.urgentTicketsCount, subtitle: "Active URGENT tickets", warn: data.urgentTicketsCount > 0, onClick: () => onNavigateToQueue("urgent") },
    { id: "dash-waiting", label: "Waiting for Requester", value: data.ticketsByStatus["WAITING_FOR_REQUESTER"] || 0, subtitle: "Awaiting customer response", warn: false, onClick: () => onNavigateToQueue("waiting") },
  ];

  const ALL_STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
  const totalTickets = Object.values(data.ticketsByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg, #006B3C, #0B7A46)", borderRadius: "12px", padding: "24px 28px", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 4px 0" }}>IT Helpdesk Dashboard</h1>
          <p style={{ fontSize: "13px", margin: 0, opacity: 0.85 }}>{today} � Logged in as {user?.name || "Staff"}</p>
        </div>
        <span style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>{isAdmin ? "Administrator" : "IT Staff"}</span>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {overviewCards.map((card) => (
          <button key={card.id} id={card.id} onClick={card.onClick}
            style={{ backgroundColor: "#FFFFFF", border: `2px solid ${card.warn ? "#D97706" : "#E0E6E2"}`, borderRadius: "10px", padding: "18px", textAlign: "left", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,107,60,0.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}>
            <div style={{ fontSize: "34px", fontWeight: "bold", color: card.warn ? "#92400E" : "#006B3C", backgroundColor: card.warn ? "#FEF3C7" : "#EAF6EF", borderRadius: "8px", padding: "4px 10px", display: "inline-block", marginBottom: "8px", minWidth: "48px", textAlign: "center" }}>{card.value}</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1F2925", marginBottom: "2px" }}>{card.label}</div>
            <div style={{ fontSize: "11px", color: "#65756E" }}>{card.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Status Distribution */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E0E6E2", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2925", margin: "0 0 16px 0" }}>Ticket Status Distribution</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ALL_STATUSES.map((status) => {
            const count = data.ticketsByStatus[status] || 0;
            const pct = Math.round((count / totalTickets) * 100);
            const style = STATUS_COLORS[status] || { bg: "#EAF6EF", color: "#006B3C", border: "#C8E6D5" };
            return (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#65756E", width: "160px", whiteSpace: "nowrap" }}>{status.replace(/_/g, " ")}</span>
                <div style={{ flex: 1, backgroundColor: "#F5F7F6", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, backgroundColor: style.color, height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1F2925", width: "36px", textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E0E6E2", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1F2925", margin: "0 0 14px 0" }}>Active Ticket Priority Breakdown</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { key: "URGENT", label: "Urgent", color: "#C5221F", bg: "#FEE2E2" },
            { key: "HIGH", label: "High", color: "#D97706", bg: "#FEF3C7" },
            { key: "MEDIUM", label: "Medium", color: "#006B3C", bg: "#EAF6EF" },
            { key: "LOW", label: "Low", color: "#6B7280", bg: "#F3F4F6" },
          ].map(({ key, label, color, bg }) => (
            <div key={key} id={`dash-priority-${key.toLowerCase()}`} style={{ backgroundColor: bg, border: `1px solid ${color}30`, borderRadius: "8px", padding: "12px 18px", textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "26px", fontWeight: "bold", color }}>{data.ticketsByPriority[key] || 0}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color, marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Queue Stream */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E0E6E2", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E0E6E2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2925", margin: 0 }}>Recent Queue Activity</h2>
          <button id="dash-view-queue" onClick={() => onNavigateToQueue()} style={{ backgroundColor: "transparent", border: "1px solid #006B3C", color: "#006B3C", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View Queue</button>
        </div>
        {data.recentQueueTickets.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#65756E", fontSize: "14px" }}>No tickets in the queue yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#F5F7F6" }}>
                  {["Ticket #", "Summary", "Status", "Priority", "Requester", "Last Updated", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#65756E", borderBottom: "1px solid #E0E6E2", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentQueueTickets.map((ticket: DashboardTicketSummary, i: number) => (
                  <tr key={ticket.id} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAFBFA", borderBottom: "1px solid #F0F4F1" }}>
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "#006B3C", whiteSpace: "nowrap" }}>{ticket.ticketNumber}</td>
                    <td style={{ padding: "11px 14px", color: "#1F2925", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.summary}</td>
                    <td style={{ padding: "11px 14px" }}><StatusPill status={ticket.currentStatus} /></td>
                    <td style={{ padding: "11px 14px" }}><PriorityBadge priority={ticket.itPriority} /></td>
                    <td style={{ padding: "11px 14px", color: "#65756E", whiteSpace: "nowrap" }}>{ticket.requester?.name || "�"}</td>
                    <td style={{ padding: "11px 14px", color: "#65756E", whiteSpace: "nowrap" }}>{new Date(ticket.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <button id={`staff-dash-ticket-${ticket.id}`} onClick={() => onNavigateToTicketDetail(ticket.id)} style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Administrator User Summary Card */}
      {isAdmin && data.adminUserSummary && (
        <div id="dash-admin-user-summary" style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #C7D2FE", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2925", margin: 0 }}>User Account Summary</h2>
            <button id="dash-user-management" onClick={onNavigateToUserManagement} style={{ backgroundColor: "transparent", border: "1px solid #4338CA", color: "#4338CA", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Manage Users</button>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { id: "dash-total-users", label: "Total Accounts", value: data.adminUserSummary.totalUsers, color: "#3730A3", bg: "#E0E7FF" },
              { id: "dash-active-users", label: "Active Accounts", value: data.adminUserSummary.activeUsers, color: "#065F46", bg: "#D1FAE5" },
              { id: "dash-requester-count", label: "Requesters", value: data.adminUserSummary.usersByRole["REQUESTER"] || 0, color: "#1E40AF", bg: "#DBEAFE" },
              { id: "dash-staff-count", label: "IT Staff", value: data.adminUserSummary.usersByRole["IT_STAFF"] || 0, color: "#065F46", bg: "#EAF6EF" },
              { id: "dash-admin-count", label: "Administrators", value: data.adminUserSummary.usersByRole["ADMINISTRATOR"] || 0, color: "#4338CA", bg: "#E0E7FF" },
            ].map(({ id, label, value, color, bg }) => (
              <div key={id} id={id} style={{ backgroundColor: bg, borderRadius: "8px", padding: "12px 18px", textAlign: "center", minWidth: "90px" }}>
                <div style={{ fontSize: "26px", fontWeight: "bold", color }}>{value}</div>
                <div style={{ fontSize: "11px", fontWeight: 600, color, marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
