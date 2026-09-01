import React, { useState, useEffect } from "react";
import {
  fetchMyTickets,
  fetchCategories,
  checkSystem,
  Category,
  Ticket,
  PaginatedTickets,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface MyTicketsViewProps {
  onCreateClick: () => void;
  onTicketClick?: (ticketId: number) => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ onCreateClick, onTicketClick }) => {
  const { selectedRequester, setIsSelectorOpen } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PaginatedTickets | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // System Status Check State (Lab 1 compatibility)
  const [systemState, setSystemState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [systemCategories, setSystemCategories] = useState<Category[]>([]);

  async function handleCheckSystem() {
    setSystemState("loading");
    try {
      const status = await checkSystem();
      setSystemCategories(status.categories);
      setSystemState("success");
    } catch (err) {
      setSystemState("error");
    }
  }

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Load Categories once
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  // Fetch Tickets on Filter/Page Change
  useEffect(() => {
    if (!selectedRequester) return;

    setLoading(true);
    setError(null);

    fetchMyTickets(
      {
        search: search.trim(),
        categoryId: selectedCategory,
        status: selectedStatus,
        priority: selectedPriority,
        page,
        limit: 10,
      },
      selectedRequester.id
    )
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load tickets");
        setLoading(false);
      });
  }, [selectedRequester, search, selectedCategory, selectedPriority, selectedStatus, page]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedPriority("");
    setSelectedStatus("");
    setPage(1);
  };

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
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "18px", color: "#1F2925", marginBottom: "12px" }}>
          No Requester Context Selected
        </h3>
        <p style={{ color: "#65756E", fontSize: "14px", marginBottom: "20px" }}>
          Please select a Development Requester to view tickets.
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

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        border: "1px solid #E0E6E2",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        padding: "24px",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
          borderBottom: "1px solid #E0E6E2",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1F2925", margin: "0 0 4px 0" }}>
            My IT Support Tickets
          </h2>
          <p style={{ color: "#65756E", fontSize: "14px", margin: 0 }}>
            Viewing tickets for <strong>{selectedRequester.name}</strong> ({selectedRequester.department})
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={handleCheckSystem}
            disabled={systemState === "loading"}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #006B3C",
              color: "#006B3C",
              padding: "8px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {systemState === "loading" ? "Checking..." : "Check System"}
          </button>
          <button
            onClick={onCreateClick}
            style={{
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Create Ticket
          </button>
        </div>
      </div>

      {systemState === "error" && (
        <div className="alert alert-danger mb-3" style={{ padding: "10px 14px", fontSize: "13px" }}>
          <strong>Offline:</strong> API is currently unavailable.
        </div>
      )}
      {systemState === "success" && (
        <div className="mb-3 p-3 bg-light border rounded">
          <span className="badge bg-success mb-2 fs-6">Online</span>
          <ul className="list-group">
            {systemCategories.map((c) => (
              <li key={c.id} className="list-group-item py-1">
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
          backgroundColor: "#F5F7F6",
          padding: "16px",
          borderRadius: "6px",
          border: "1px solid #E0E6E2",
        }}
      >
        <div>
          <label htmlFor="search-input" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
            Search
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search Ticket # or Summary..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 10px",
              borderRadius: "4px",
              border: "1px solid #C8D2CC",
              fontSize: "13px",
              backgroundColor: "#FFFFFF",
            }}
          />
        </div>

        <div>
          <label htmlFor="category-filter" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
            Category
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 8px",
              borderRadius: "4px",
              border: "1px solid #C8D2CC",
              fontSize: "13px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
            Priority
          </label>
          <select
            id="priority-filter"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 8px",
              borderRadius: "4px",
              border: "1px solid #C8D2CC",
              fontSize: "13px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div>
          <label htmlFor="status-filter" style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
            Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 8px",
              borderRadius: "4px",
              border: "1px solid #C8D2CC",
              fontSize: "13px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={handleClearFilters}
            style={{
              width: "100%",
              height: "36px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #C8D2CC",
              color: "#1F2925",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#FDF2F2",
            border: "1px solid #F87171",
            color: "#C5221F",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#65756E" }}>
          Loading tickets...
        </div>
      ) : !data || data.tickets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            backgroundColor: "#F5F7F6",
            borderRadius: "6px",
            color: "#65756E",
          }}
        >
          <h4 style={{ fontSize: "16px", color: "#1F2925", marginBottom: "6px" }}>No Tickets Found</h4>
          <p style={{ fontSize: "14px", margin: 0 }}>
            {search || selectedCategory || selectedPriority || selectedStatus
              ? "No tickets match your search criteria. Try clearing filters."
              : "You have not submitted any IT support tickets yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Responsive Layout: Table on Desktop, Cards on Mobile */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #E0E6E2", color: "#65756E", fontSize: "12px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 16px" }}>Ticket #</th>
                  <th style={{ padding: "12px 16px" }}>Summary</th>
                  <th style={{ padding: "12px 16px" }}>Category</th>
                  <th style={{ padding: "12px 16px" }}>Priority</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onTicketClick && onTicketClick(t.id)}
                    style={{
                      borderBottom: "1px solid #E0E6E2",
                      cursor: onTicketClick ? "pointer" : "default",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F7F6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: "600", color: "#006B3C", whiteSpace: "nowrap" }}>
                      {t.ticketNumber}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#1F2925", fontWeight: "500" }}>
                      {t.summary}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#65756E" }}>
                      {t.category?.name || "N/A"}
                    </td>
                    <td style={{ padding: "14px 16px", ...getPriorityBadgeStyle(t.requestedPriority) }}>
                      {t.requestedPriority}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "inline-block",
                          ...getStatusBadgeStyle(t.currentStatus),
                        }}
                      >
                        {t.currentStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#65756E", fontSize: "13px", whiteSpace: "nowrap" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #E0E6E2",
            }}
          >
            <span style={{ fontSize: "13px", color: "#65756E" }}>
              Showing {data.tickets.length} of {data.total} tickets (Page {data.page} of {data.totalPages})
            </span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #C8D2CC",
                  color: page <= 1 ? "#A0AEA7" : "#1F2925",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #C8D2CC",
                  color: page >= data.totalPages ? "#A0AEA7" : "#1F2925",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  cursor: page >= data.totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
