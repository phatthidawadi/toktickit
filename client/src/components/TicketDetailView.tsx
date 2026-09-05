import React, { useState, useEffect } from "react";
import {
  fetchTicketDetail,
  uploadAttachment,
  getAttachmentDownloadUrl,
  softRemoveAttachment,
  Ticket,
  AttachmentSummary,
} from "../api.js";
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

  // Attachment Management States
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingAttachment, setRemovingAttachment] = useState<AttachmentSummary | null>(null);
  const [removeReason, setRemoveReason] = useState<string>("");
  const [removeError, setRemoveError] = useState<string | null>(null);

  const loadDetail = () => {
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
  };

  useEffect(() => {
    loadDetail();
  }, [ticketId, selectedRequester]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file || !selectedRequester || !ticket) return;

    setUploading(true);
    try {
      await uploadAttachment(ticket.id, file, selectedRequester.id);
      setUploading(false);
      e.target.value = "";
      loadDetail();
    } catch (err: any) {
      setUploadError(err.message || "File upload failed");
      setUploading(false);
    }
  };

  const handleConfirmSoftRemove = async () => {
    if (!removingAttachment || !selectedRequester) return;
    setRemoveError(null);

    if (!removeReason.trim() || removeReason.trim().length < 5) {
      setRemoveError("Removal reason must be at least 5 characters long");
      return;
    }

    try {
      await softRemoveAttachment(removingAttachment.id, removeReason, selectedRequester.id);
      setRemovingAttachment(null);
      setRemoveReason("");
      loadDetail();
    } catch (err: any) {
      setRemoveError(err.message || "Soft removal failed");
    }
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
      {/* Soft Removal Confirmation Modal Dialog */}
      {removingAttachment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E0E6E2",
              padding: "24px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#C5221F", margin: "0 0 8px 0" }}>
              Remove File Attachment
            </h4>
            <p style={{ fontSize: "14px", color: "#1F2925", marginBottom: "16px" }}>
              You are about to soft-remove <strong>{removingAttachment.originalName}</strong>. Please state the reason for removal.
            </p>

            {removeError && (
              <div
                style={{
                  backgroundColor: "#FDF2F2",
                  border: "1px solid #F87171",
                  color: "#C5221F",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {removeError}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="removal-reason-input"
                style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
              >
                Removal Reason <span style={{ color: "#C5221F" }}>*</span>
              </label>
              <textarea
                id="removal-reason-input"
                rows={3}
                placeholder="e.g. File contains sensitive data / uploaded duplicate file"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #C8D2CC",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setRemovingAttachment(null);
                  setRemoveReason("");
                  setRemoveError(null);
                }}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #C8D2CC",
                  color: "#1F2925",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftRemove}
                style={{
                  backgroundColor: "#C5221F",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Remove Attachment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
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

      {/* File Attachments & Upload Section (Issue 12) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2925", margin: 0 }}>
            File Attachments
          </h3>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              id="ticket-detail-file-input"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{
                fontSize: "13px",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #C8D2CC",
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>
        </div>

        {uploadError && (
          <div
            style={{
              backgroundColor: "#FDF2F2",
              border: "1px solid #F87171",
              color: "#C5221F",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {uploadError}
          </div>
        )}

        {!ticket.attachments || ticket.attachments.length === 0 ? (
          <p style={{ color: "#65756E", fontSize: "14px", margin: 0 }}>
            No file attachments uploaded for this ticket yet.
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
                  padding: "12px 16px",
                  backgroundColor: att.isRemoved ? "#F9FAFB" : "#F5F7F6",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  border: "1px solid #E0E6E2",
                  opacity: att.isRemoved ? 0.65 : 1,
                }}
              >
                <div>
                  <strong style={{ fontSize: "14px", color: "#1F2925" }}>{att.originalName}</strong>
                  <span style={{ fontSize: "12px", color: "#65756E", marginLeft: "10px" }}>
                    ({(att.size / 1024).toFixed(1)} KB)
                  </span>

                  {att.isRemoved && (
                    <div style={{ color: "#C5221F", fontSize: "12px", marginTop: "2px" }}>
                      Soft-Removed (Reason: {att.removedReason || "N/A"})
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {!att.isRemoved ? (
                    <>
                      <a
                        href={getAttachmentDownloadUrl(att.id)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#006B3C",
                          fontSize: "13px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => setRemovingAttachment(att)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#C5221F",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#65756E", fontStyle: "italic" }}>
                      Download Disabled (410 Gone)
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
