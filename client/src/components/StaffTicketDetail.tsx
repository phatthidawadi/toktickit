import React, { useState, useEffect } from "react";
import {
  fetchStaffTicketDetailApi,
  assignStaffTicketApi,
  updateItPriorityApi,
  updateTicketStatusApi,
  uploadAttachment,
  softRemoveAttachment,
  getAttachmentDownloadUrl,
  Ticket,
  AttachmentSummary,
} from "../api";
import { PublicComments } from "./PublicComments";
import { InternalNotes } from "./InternalNotes";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ["OPEN", "IN_PROGRESS", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  CLOSED: ["REOPENED"],
  CANCELLED: [],
};

interface StaffTicketDetailProps {
  ticketId: number;
  onBack?: () => void;
}

export const StaffTicketDetail: React.FC<StaffTicketDetailProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"comments" | "notes" | "attachments">("comments");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [removeModalAttachment, setRemoveModalAttachment] = useState<AttachmentSummary | null>(null);
  const [removeReason, setRemoveReason] = useState<string>("");

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffTicketDetailApi(ticketId);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const handleClaim = async () => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await assignStaffTicketApi(ticketId, { claim: true });
      setTicket(updated);
      setActionSuccess("Ticket successfully claimed.");
    } catch (err: any) {
      setActionError(err.message || "Failed to claim ticket.");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await updateItPriorityApi(ticketId, newPriority);
      setTicket(updated);
      setActionSuccess(`IT Priority updated to ${newPriority}.`);
    } catch (err: any) {
      setActionError(err.message || "Failed to update IT Priority.");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await updateTicketStatusApi(ticketId, newStatus);
      setTicket(updated);
      setActionSuccess(`Ticket status updated to ${newStatus}.`);
    } catch (err: any) {
      setActionError(err.message || "Failed to update status.");
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setActionError(null);
    try {
      await uploadAttachment(ticketId, uploadFile, (ticket as any)?.requesterId || 1);
      setUploadFile(null);
      await loadTicket();
      setActionSuccess("Attachment uploaded successfully.");
    } catch (err: any) {
      setActionError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSoftRemove = async () => {
    if (!removeModalAttachment) return;
    setActionError(null);
    try {
      await softRemoveAttachment(removeModalAttachment.id, removeReason, (ticket as any)?.requesterId || 1);
      setRemoveModalAttachment(null);
      setRemoveReason("");
      await loadTicket();
      setActionSuccess("Attachment soft-removed.");
    } catch (err: any) {
      setActionError(err.message || "Removal failed.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#4B5563" }}>Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ padding: "16px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "8px", marginBottom: "16px" }}>
          {error || "Ticket not found"}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: "8px 16px",
              backgroundColor: "#E5E7EB",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Back to Queue
          </button>
        )}
      </div>
    );
  }

  const currentStatus = ticket.currentStatus;
  const allowedNextStatuses = (ALLOWED_TRANSITIONS as any)[currentStatus] || [];

  return (
    <div id="staff-ticket-detail-view" style={{ padding: "16px 0" }}>
      {/* Top Header Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button
          id="back-to-queue-btn"
          onClick={onBack}
          style={{
            padding: "8px 16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            color: "#374151",
            fontWeight: 500,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Back to Queue
        </button>
        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0B7A46" }}>
          {ticket.ticketNumber}
        </span>
      </div>

      {actionError && (
        <div style={{ padding: "12px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", marginBottom: "16px" }}>
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div style={{ padding: "12px", backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: "6px", marginBottom: "16px" }}>
          {actionSuccess}
        </div>
      )}

      {/* Operational Controls Panel */}
      <div
        className="operational-panel"
        style={{
          backgroundColor: "#F3F4F6",
          padding: "16px 20px",
          borderRadius: "8px",
          border: "1px solid #E5E7EB",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Ownership Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>Assigned Staff:</span>
          {(ticket as any).assignedStaff ? (
            <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
              {(ticket as any).assignedStaff.name}
            </span>
          ) : (
            <span style={{ color: "#9CA3AF", fontStyle: "italic", fontSize: "0.875rem" }}>Unassigned</span>
          )}
          <button
            id="claim-ticket-btn"
            onClick={handleClaim}
            style={{
              padding: "6px 12px",
              backgroundColor: "#0B7A46",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Claim Ticket
          </button>
        </div>

        {/* IT Priority Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="it-priority-select" style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
            IT Priority:
          </label>
          <select
            id="it-priority-select"
            value={(ticket as any).itPriority || ticket.requestedPriority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        {/* Status Matrix Transition Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="status-transition-select" style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
            Change Status:
          </label>
          <select
            id="status-transition-select"
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              backgroundColor: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            <option value={currentStatus}>{currentStatus.replace(/_/g, " ")} (Current)</option>
            {allowedNextStatuses.map((st: string) => (
              <option key={st} value={st}>
                Transition to {st.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket Details Summary Card */}
      <div
        className="ticket-summary-card"
        style={{
          backgroundColor: "#FFFFFF",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>
              {ticket.summary}
            </h1>
            <div style={{ fontSize: "0.875rem", color: "#4B5563" }}>
              Requested by <strong style={{ color: "#111827" }}>{ticket.requester?.name || "Requester"}</strong> ({ticket.requester?.email}) on {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>
          {ticket.isRequesterResolved && (
            <span
              style={{
                backgroundColor: "#D1FAE5",
                color: "#065F46",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              Requester Resolved Indicator
            </span>
          )}
        </div>

        <p style={{ fontSize: "1rem", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "20px" }}>
          {ticket.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            backgroundColor: "#F9FAFB",
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #F3F4F6",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", display: "block" }}>Category</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{ticket.category?.name || "-"}</span>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", display: "block" }}>Related System</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{ticket.relatedSystem?.name || "-"}</span>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", display: "block" }}>Requested Priority</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{ticket.requestedPriority}</span>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", display: "block" }}>IT Priority</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0B7A46" }}>{(ticket as any).itPriority || ticket.requestedPriority}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", borderBottom: "2px solid #E5E7EB", marginBottom: "20px" }}>
        <button
          id="tab-comments-btn"
          onClick={() => setActiveTab("comments")}
          style={{
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            borderBottom: activeTab === "comments" ? "3px solid #0B7A46" : "none",
            backgroundColor: "transparent",
            color: activeTab === "comments" ? "#0B7A46" : "#6B7280",
            cursor: "pointer",
          }}
        >
          Public Comments
        </button>
        <button
          id="tab-notes-btn"
          onClick={() => setActiveTab("notes")}
          style={{
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            borderBottom: activeTab === "notes" ? "3px solid #D97706" : "none",
            backgroundColor: "transparent",
            color: activeTab === "notes" ? "#D97706" : "#6B7280",
            cursor: "pointer",
          }}
        >
          Internal Notes (Staff Only)
        </button>
        <button
          id="tab-attachments-btn"
          onClick={() => setActiveTab("attachments")}
          style={{
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            borderBottom: activeTab === "attachments" ? "3px solid #0B7A46" : "none",
            backgroundColor: "transparent",
            color: activeTab === "attachments" ? "#0B7A46" : "#6B7280",
            cursor: "pointer",
          }}
        >
          Attachments ({ticket.attachments?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "comments" && <PublicComments ticketId={ticket.id} />}

      {activeTab === "notes" && <InternalNotes ticketId={ticket.id} />}

      {activeTab === "attachments" && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>
            Ticket Attachments
          </h3>

          {(!ticket.attachments || ticket.attachments.length === 0) ? (
            <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>No attachments uploaded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {ticket.attachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    backgroundColor: att.isRemoved ? "#F9FAFB" : "#FFFFFF",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: att.isRemoved ? "#9CA3AF" : "#111827" }}>
                      {att.originalName} {att.isRemoved && "(Removed)"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                      {(att.size / 1024).toFixed(1)} KB | {att.mimeType}
                    </div>
                    {att.isRemoved && att.removedReason && (
                      <div style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: "4px" }}>
                        Reason: {att.removedReason}
                      </div>
                    )}
                  </div>

                  <div>
                    {!att.isRemoved ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <a
                          href={getAttachmentDownloadUrl(att.id)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#0B7A46",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          Download
                        </a>
                        <button
                          onClick={() => setRemoveModalAttachment(att)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#FEE2E2",
                            color: "#991B1B",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Soft Remove
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>File Soft-Removed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Upload Form */}
          <form onSubmit={handleFileUpload} style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              style={{ fontSize: "0.875rem" }}
            />
            <button
              type="submit"
              disabled={!uploadFile || uploading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#0B7A46",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: !uploadFile || uploading ? "not-allowed" : "pointer",
                opacity: !uploadFile || uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        </div>
      )}

      {/* Soft Remove Modal */}
      {removeModalAttachment && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "8px", maxWidth: "450px", width: "90%" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>
              Soft Remove Attachment
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#4B5563", marginBottom: "16px" }}>
              Please provide a reason for soft-removing <strong>{removeModalAttachment.originalName}</strong> (minimum 5 characters).
            </p>
            <textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Reason for removal..."
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #D1D5DB", marginBottom: "16px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setRemoveModalAttachment(null)}
                style={{ padding: "8px 16px", backgroundColor: "#E5E7EB", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSoftRemove}
                disabled={removeReason.trim().length < 5}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: removeReason.trim().length < 5 ? "not-allowed" : "pointer",
                  opacity: removeReason.trim().length < 5 ? 0.6 : 1,
                }}
              >
                Confirm Soft Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
