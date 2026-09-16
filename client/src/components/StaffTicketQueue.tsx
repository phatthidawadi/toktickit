import React, { useState, useEffect } from "react";
import { fetchStaffTicketsApi, fetchCategories, Category, Ticket, PaginatedTickets } from "../api";

interface StaffTicketQueueProps {
  onTicketClick?: (ticketId: number) => void;
}

export const StaffTicketQueue: React.FC<StaffTicketQueueProps> = ({ onTicketClick }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [requestedPriority, setRequestedPriority] = useState<string>("");
  const [itPriority, setItPriority] = useState<string>("");
  const [assignedStaffFilter, setAssignedStaffFilter] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTickets, setTotalTickets] = useState<number>(0);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: PaginatedTickets = await fetchStaffTicketsApi({
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status: status || undefined,
        requestedPriority: requestedPriority || undefined,
        itPriority: itPriority || undefined,
        assignedStaffId: assignedStaffFilter || undefined,
        sort: sort || undefined,
        page,
        limit: 10,
      });
      setTickets(data.tickets);
      setTotalPages(data.totalPages);
      setTotalTickets(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load staff ticket queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [page, categoryId, status, requestedPriority, itPriority, assignedStaffFilter, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQueue();
  };

  const renderStatusBadge = (currentStatus: string) => {
    let bg = "#F1F5F9";
    let color = "#475569";
    if (currentStatus === "NEW") {
      bg = "#DBEAFE"; color = "#1E40AF";
    } else if (currentStatus === "OPEN") {
      bg = "#E0F2FE"; color = "#075985";
    } else if (currentStatus === "IN_PROGRESS") {
      bg = "#FEF3C7"; color = "#92400E";
    } else if (currentStatus === "WAITING_FOR_REQUESTER") {
      bg = "#F3E8FF"; color = "#6B21A8";
    } else if (currentStatus === "RESOLVED") {
      bg = "#D1FAE5"; color = "#065F46";
    } else if (currentStatus === "CLOSED") {
      bg = "#F1F5F9"; color = "#475569";
    } else if (currentStatus === "REOPENED") {
      bg = "#FFEDD5"; color = "#9A3412";
    } else if (currentStatus === "CANCELLED") {
      bg = "#FEE2E2"; color = "#991B1B";
    }

    return (
      <span
        className="status-pill"
        style={{
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: 600,
          backgroundColor: bg,
          color,
          display: "inline-block",
        }}
      >
        {currentStatus.replace(/_/g, " ")}
      </span>
    );
  };

  const renderPriorityBadge = (p: string, labelPrefix?: string) => {
    let bg = "#F1F5F9";
    let color = "#475569";
    if (p === "URGENT") {
      bg = "#FEE2E2"; color = "#991B1B";
    } else if (p === "HIGH") {
      bg = "#FFEDD5"; color = "#9A3412";
    } else if (p === "MEDIUM") {
      bg = "#FEF3C7"; color = "#92400E";
    } else if (p === "LOW") {
      bg = "#F1F5F9"; color = "#475569";
    }

    return (
      <span
        className="priority-pill"
        style={{
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: p === "URGENT" ? 700 : 500,
          backgroundColor: bg,
          color,
          display: "inline-block",
        }}
      >
        {labelPrefix ? `${labelPrefix}: ${p}` : p}
      </span>
    );
  };

  return (
    <div className="staff-queue-container" style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>
          IT Staff Ticket Queue
        </h2>
        <span style={{ fontSize: "0.875rem", color: "#6B7280", fontWeight: 500 }}>
          Total Tickets: {totalTickets}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="filter-bar"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <input
            id="queue-search-input"
            type="text"
            placeholder="Search number, summary, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              flex: "1 1 200px",
              minWidth: "160px",
            }}
          />

          <select
            id="queue-category-filter"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
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

          <select
            id="queue-status-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="WAITING_FOR_REQUESTER">WAITING FOR REQUESTER</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REOPENED">REOPENED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            id="queue-it-priority-filter"
            value={itPriority}
            onChange={(e) => { setItPriority(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All IT Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            id="queue-assigned-filter"
            value={assignedStaffFilter}
            onChange={(e) => { setAssignedStaffFilter(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="">All Ownership</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
          </select>

          <select
            id="queue-sort-filter"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
            }}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="priority_desc">Highest IT Priority</option>
          </select>

          <button
            id="queue-search-btn"
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#0B7A46",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      {loading && <div style={{ padding: "20px", textAlign: "center", color: "#4B5563" }}>Loading tickets queue...</div>}

      {error && (
        <div style={{ padding: "12px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div style={{ padding: "30px", textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: "8px", color: "#6B7280" }}>
          No tickets found matching current filters.
        </div>
      )}

      {/* Desktop / Tablet View */}
      {!loading && tickets.length > 0 && (
        <div className="table-responsive-wrapper" style={{ overflowX: "auto" }}>
          <table
            id="staff-queue-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Ticket #</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Summary</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>IT Priority</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Assigned Staff</th>
                <th style={{ padding: "12px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="queue-table-row"
                  onClick={() => onTicketClick && onTicketClick(t.id)}
                  style={{
                    borderBottom: "1px solid #E5E7EB",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0B7A46", fontSize: "0.875rem" }}>
                    {t.ticketNumber}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#111827", fontSize: "0.875rem" }}>
                    {t.summary}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4B5563", fontSize: "0.875rem" }}>
                    {t.category?.name || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {renderStatusBadge(t.currentStatus)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {renderPriorityBadge((t as any).itPriority || t.requestedPriority)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                    {(t as any).assignedStaff ? (
                      <span style={{ fontWeight: 500, color: "#1F2937" }}>
                        {(t as any).assignedStaff.name}
                      </span>
                    ) : (
                      <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: "0.75rem" }}>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" }}>
          <button
            id="queue-prev-page-btn"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              backgroundColor: page === 1 ? "#F3F4F6" : "#FFFFFF",
              color: page === 1 ? "#9CA3AF" : "#374151",
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: "0.875rem", color: "#374151" }}>
            Page {page} of {totalPages}
          </span>
          <button
            id="queue-next-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              backgroundColor: page === totalPages ? "#F3F4F6" : "#FFFFFF",
              color: page === totalPages ? "#9CA3AF" : "#374151",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
