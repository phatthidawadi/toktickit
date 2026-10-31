import React, { useState, useEffect } from "react";
import {
  ActionTaken,
  ActionTakenUser,
  fetchActionsTakenApi,
  createActionTakenApi,
  updateActionTakenApi,
  fetchStaffAssigneesApi,
} from "../api.js";

interface ActionsTakenSectionProps {
  ticketId: number;
  isStaffOrAdmin?: boolean;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({
  ticketId,
  isStaffOrAdmin = false,
}) => {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [assignees, setAssignees] = useState<ActionTakenUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);

  // Form Fields
  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("COMPLETED");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpNote, setFollowUpNote] = useState<string>("");
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [concurrencyConflict, setConcurrencyConflict] = useState<string | null>(null);

  const loadActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActionsTakenApi(ticketId);
      setActions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load actions taken.");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignees = async () => {
    if (!isStaffOrAdmin) return;
    try {
      const data = await fetchStaffAssigneesApi();
      setAssignees(data);
    } catch (_err) {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadActions();
      loadAssignees();
    }
  }, [ticketId, isStaffOrAdmin]);

  const openRecordModal = () => {
    setDescription("");
    setResult("");
    setStatus("COMPLETED");
    setAssigneeId("");
    setFollowUpRequired(false);
    setFollowUpNote("");
    setAttachmentNotes("");
    setFormError(null);
    setConcurrencyConflict(null);
    setIsRecordModalOpen(true);
  };

  const openEditModal = (action: ActionTaken) => {
    setEditingAction(action);
    setDescription(action.description);
    setResult(action.result);
    setStatus(action.status);
    setAssigneeId(action.assigneeId ? String(action.assigneeId) : "");
    setFollowUpRequired(action.followUpRequired);
    setFollowUpNote(action.followUpNote || "");
    setAttachmentNotes(action.attachmentNotes || "");
    setFormError(null);
    setConcurrencyConflict(null);
  };

  const closeModals = () => {
    setIsRecordModalOpen(false);
    setEditingAction(null);
    setFormError(null);
    setConcurrencyConflict(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModalActive = isRecordModalOpen || !!editingAction;
      if (!isModalActive) return;

      if (e.key === "Escape") {
        closeModals();
        return;
      }

      if (e.key === "Tab") {
        const modalId = isRecordModalOpen ? "record-action-modal" : "edit-action-modal";
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalElement.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalElement.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecordModalOpen, editingAction]);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedDesc = description.trim();
    if (!trimmedDesc || trimmedDesc.length > 2000) {
      setFormError("Description is required (1-2000 characters).");
      return;
    }

    const trimmedResult = result.trim();
    if (!trimmedResult || trimmedResult.length > 2000) {
      setFormError("Result is required (1-2000 characters).");
      return;
    }

    if (followUpRequired) {
      const trimmedNote = followUpNote.trim();
      if (!trimmedNote || trimmedNote.length > 1000) {
        setFormError("Follow-Up Note is required when follow-up is checked (1-1000 characters).");
        return;
      }
    }

    setSubmitting(true);
    try {
      await createActionTakenApi(ticketId, {
        description: trimmedDesc,
        result: trimmedResult,
        status,
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes.trim() ? attachmentNotes.trim() : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      });
      closeModals();
      await loadActions();
    } catch (err: any) {
      setFormError(err.message || "Failed to record action.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    setFormError(null);
    setConcurrencyConflict(null);

    const trimmedDesc = description.trim();
    if (!trimmedDesc || trimmedDesc.length > 2000) {
      setFormError("Description is required (1-2000 characters).");
      return;
    }

    const trimmedResult = result.trim();
    if (!trimmedResult || trimmedResult.length > 2000) {
      setFormError("Result is required (1-2000 characters).");
      return;
    }

    if (followUpRequired) {
      const trimmedNote = followUpNote.trim();
      if (!trimmedNote || trimmedNote.length > 1000) {
        setFormError("Follow-Up Note is required when follow-up is checked (1-1000 characters).");
        return;
      }
    }

    setSubmitting(true);
    try {
      await updateActionTakenApi(editingAction.id, {
        version: editingAction.version,
        description: trimmedDesc,
        result: trimmedResult,
        status,
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes.trim() ? attachmentNotes.trim() : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      });
      closeModals();
      await loadActions();
    } catch (err: any) {
      if (err.status === 409 || err.code === "CONCURRENCY_CONFLICT") {
        setConcurrencyConflict(
          "This action line was modified by another technician in another session. Please review the updated record and re-apply your changes."
        );
      } else {
        setFormError(err.message || "Failed to update action.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReloadConflict = async () => {
    setConcurrencyConflict(null);
    setFormError(null);
    await loadActions();
    if (editingAction) {
      try {
        const freshList = await fetchActionsTakenApi(ticketId);
        const refreshed = freshList.find((a) => a.id === editingAction.id);
        if (refreshed) {
          openEditModal(refreshed);
        } else {
          closeModals();
        }
      } catch (_e) {
        closeModals();
      }
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (_e) {
      return isoString;
    }
  };

  const getStatusBadgeStyle = (actionStatus: string) => {
    switch (actionStatus) {
      case "COMPLETED":
        return { backgroundColor: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" };
      case "IN_PROGRESS":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF", border: "1px solid #BFDBFE" };
      case "PENDING":
        return { backgroundColor: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1" };
      case "CANCELLED":
        return { backgroundColor: "#FFE4E6", color: "#9F1239", border: "1px solid #FECDD3" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" };
    }
  };

  return (
    <div
      id="actions-taken-section"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        border: "1px solid #E0E6E2",
        padding: "24px",
        marginTop: "24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1E293B" }}>
            Actions Taken
          </h3>
          <span
            id="actions-count-pill"
            style={{
              backgroundColor: "#EAF6EF",
              color: "#006B3C",
              fontSize: "0.8125rem",
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: "12px",
              border: "1px solid #C8E6D5",
            }}
          >
            {actions.length}
          </span>
        </div>

        {isStaffOrAdmin && (
          <button
            id="record-action-btn"
            type="button"
            onClick={openRecordModal}
            style={{
              padding: "8px 16px",
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              minHeight: "44px",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
            onBlur={(e) => (e.currentTarget.style.outline = "none")}
          >
            + Record Action
          </button>
        )}
      </div>

      {loading && (
        <div id="actions-loading-state" style={{ padding: "20px", color: "#64748B", textAlign: "center" }}>
          Loading recorded actions...
        </div>
      )}

      {error && (
        <div
          id="actions-error-state"
          style={{
            padding: "14px 16px",
            backgroundColor: "#FDF2F2",
            border: "1px solid #F87171",
            color: "#C5221F",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && actions.length === 0 && (
        <div
          id="actions-empty-state"
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "#64748B",
            backgroundColor: "#F8FAF9",
            borderRadius: "8px",
            border: "1px dashed #CBD5E1",
            fontSize: "0.9375rem",
          }}
        >
          No technical actions have been recorded for this ticket yet.
        </div>
      )}

      {!loading && actions.length > 0 && (
        <>
          {/* Desktop & Tablet Table View */}
          <div className="table-responsive d-none d-md-block" style={{ overflowX: "auto" }}>
            <table
              id="actions-taken-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#F5F7F6", borderBottom: "2px solid #E2E8F0", color: "#475569" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Date / Time</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Description</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Result</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Performed By</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Assignee</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Follow-Up</th>
                  <th style={{ padding: "12px 14px", fontWeight: 600 }}>Attachments</th>
                  {isStaffOrAdmin && <th style={{ padding: "12px 14px", fontWeight: 600, textAlign: "right" }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {actions.map((act) => {
                  const badgeStyle = getStatusBadgeStyle(act.status);
                  return (
                    <tr
                      key={act.id}
                      data-testid={`action-row-${act.id}`}
                      style={{ borderBottom: "1px solid #E2E8F0", verticalAlign: "top" }}
                    >
                      <td style={{ padding: "12px 14px", color: "#64748B", whiteSpace: "nowrap" }}>
                        {formatDateTime(act.actionDateTime)}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#1E293B", fontWeight: 600, maxWidth: "240px" }}>
                        {act.description}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#334155", maxWidth: "240px" }}>
                        {act.result}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            ...badgeStyle,
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            display: "inline-block",
                          }}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 600, color: "#1E293B" }}>{act.performedBy?.name || "System"}</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>
                          {act.performedBy?.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        {act.assignee ? (
                          <>
                            <span style={{ fontWeight: 600, color: "#1E293B" }}>{act.assignee.name}</span>
                            <span style={{ fontSize: "0.75rem", color: "#64748B", display: "block" }}>
                              {act.assignee.role}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8125rem" }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {act.followUpRequired ? (
                          <div>
                            <span
                              style={{
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                border: "1px solid #FDE68A",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                display: "inline-block",
                              }}
                            >
                              Follow-Up Required
                            </span>
                            {act.followUpNote && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#78350F",
                                  marginTop: "4px",
                                  maxWidth: "200px",
                                }}
                              >
                                {act.followUpNote}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#64748B", fontSize: "0.8125rem" }}>
                        {act.attachmentNotes || "—"}
                      </td>
                      {isStaffOrAdmin && (
                        <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            id={`edit-action-btn-${act.id}`}
                            type="button"
                            onClick={() => openEditModal(act)}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #C8D2CC",
                              color: "#1E293B",
                              borderRadius: "4px",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              minHeight: "36px",
                            }}
                            onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                            onBlur={(e) => (e.currentTarget.style.outline = "none")}
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div id="actions-card-list" className="d-block d-md-none" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {actions.map((act) => {
              const badgeStyle = getStatusBadgeStyle(act.status);
              return (
                <div
                  key={act.id}
                  data-testid={`action-mobile-card-${act.id}`}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {formatDateTime(act.actionDateTime)}
                    </span>
                    <span
                      style={{
                        ...badgeStyle,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {act.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, color: "#1E293B", marginBottom: "4px" }}>
                    {act.description}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "12px" }}>
                    {act.result}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.8125rem", marginBottom: "8px" }}>
                    <div>
                      <span style={{ color: "#64748B" }}>By: </span>
                      <strong style={{ color: "#1E293B" }}>{act.performedBy?.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748B" }}>Assignee: </span>
                      <strong style={{ color: "#1E293B" }}>{act.assignee ? act.assignee.name : "Unassigned"}</strong>
                    </div>
                  </div>

                  {act.followUpRequired && (
                    <div
                      style={{
                        backgroundColor: "#FEF3C7",
                        border: "1px solid #FDE68A",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.8125rem",
                        color: "#92400E",
                        marginTop: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Follow-Up Needed:</strong> {act.followUpNote || "Action required"}
                    </div>
                  )}

                  {act.attachmentNotes && (
                    <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px" }}>
                      <strong>Attachment Notes:</strong> {act.attachmentNotes}
                    </div>
                  )}

                  {isStaffOrAdmin && (
                    <button
                      id={`edit-action-mobile-btn-${act.id}`}
                      type="button"
                      onClick={() => openEditModal(act)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #C8D2CC",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#1E293B",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                      onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                      onBlur={(e) => (e.currentTarget.style.outline = "none")}
                    >
                      Edit Action
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Record Action Modal Dialog */}
      {isRecordModalOpen && (
        <div
          id="record-action-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1050,
          }}
        >
          <div
            id="record-action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-action-modal-title"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              maxWidth: "580px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 id="record-action-modal-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1E293B" }}>
                Record Action Taken
              </h4>
              <button
                type="button"
                onClick={closeModals}
                aria-label="Close record action modal"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#94A3B8",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {formError && (
              <div
                id="action-form-error"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#FDF2F2",
                  border: "1px solid #F87171",
                  color: "#C5221F",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleRecordSubmit}>
              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="action-description-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Action Description <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <textarea
                  id="action-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the technical intervention, diagnostics, or configuration change..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Result */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="action-result-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Action Result <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <textarea
                  id="action-result-input"
                  rows={3}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="Detail the outcome, test results, or current diagnostic findings..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Status & Assignee Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label
                    htmlFor="action-status-select"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                  >
                    Initial Status
                  </label>
                  <select
                    id="action-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #D1D5DB",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="action-assignee-select"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                  >
                    Assignee
                  </label>
                  <select
                    id="action-assignee-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #D1D5DB",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  >
                    <option value="">Leave Unassigned</option>
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Follow-Up Toggle */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <input
                    id="action-follow-up-toggle"
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#006B3C" }}
                  />
                  Requires further follow-up action
                </label>
              </div>

              {/* Conditionally Visible Follow-Up Note */}
              {followUpRequired && (
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="action-follow-up-note-input"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#92400E", marginBottom: "6px" }}
                  >
                    Follow-Up Instructions / Note <span style={{ color: "#C5221F" }}>*</span>
                  </label>
                  <textarea
                    id="action-follow-up-note-input"
                    rows={2}
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Explain what follow-up is needed, who should perform it, and when..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #FDE68A",
                      backgroundColor: "#FFFBEB",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  />
                </div>
              )}

              {/* Attachment Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="action-attachment-notes-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Attachment Notes (Optional)
                </label>
                <input
                  id="action-attachment-notes-input"
                  type="text"
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  placeholder="e.g. RAM_receipt.pdf and memtest_result.png in physical cabinet"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  id="action-modal-cancel-btn"
                  type="button"
                  onClick={closeModals}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D1D5DB",
                    color: "#374151",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    minHeight: "44px",
                  }}
                >
                  Cancel
                </button>
                <button
                  id="action-modal-submit-btn"
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#006B3C",
                    border: "none",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    minHeight: "44px",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                >
                  {submitting ? "Saving..." : "Save Action Taken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Action Modal Dialog */}
      {editingAction && (
        <div
          id="edit-action-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 1050,
          }}
        >
          <div
            id="edit-action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-action-modal-title"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              maxWidth: "580px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 id="edit-action-modal-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1E293B" }}>
                Edit Action Taken
              </h4>
              <button
                type="button"
                onClick={closeModals}
                aria-label="Close edit action modal"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#94A3B8",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Concurrency Conflict Banner (HTTP 409) */}
            {concurrencyConflict && (
              <div
                id="action-concurrency-conflict"
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#FFFBEB",
                  border: "1px solid #F59E0B",
                  color: "#92400E",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Concurrency Conflict</div>
                <div>{concurrencyConflict}</div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    id="action-conflict-reload-btn"
                    type="button"
                    onClick={handleReloadConflict}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#006B3C",
                      fontWeight: 700,
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Reload Latest Data
                  </button>
                </div>
              </div>
            )}

            {formError && (
              <div
                id="action-edit-form-error"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#FDF2F2",
                  border: "1px solid #F87171",
                  color: "#C5221F",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="edit-action-description-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Action Description <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <textarea
                  id="edit-action-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Result */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="edit-action-result-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Action Result <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <textarea
                  id="edit-action-result-input"
                  rows={3}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Status & Assignee Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label
                    htmlFor="edit-action-status-select"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                  >
                    Status
                  </label>
                  <select
                    id="edit-action-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #D1D5DB",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-action-assignee-select"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                  >
                    Assignee
                  </label>
                  <select
                    id="edit-action-assignee-select"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #D1D5DB",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  >
                    <option value="">Leave Unassigned</option>
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Follow-Up Toggle */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <input
                    id="edit-action-follow-up-toggle"
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#006B3C" }}
                  />
                  Requires further follow-up action
                </label>
              </div>

              {/* Conditionally Visible Follow-Up Note */}
              {followUpRequired && (
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="edit-action-follow-up-note-input"
                    style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#92400E", marginBottom: "6px" }}
                  >
                    Follow-Up Instructions / Note <span style={{ color: "#C5221F" }}>*</span>
                  </label>
                  <textarea
                    id="edit-action-follow-up-note-input"
                    rows={2}
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Explain what follow-up is needed, who should perform it, and when..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #FDE68A",
                      backgroundColor: "#FFFBEB",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                    onBlur={(e) => (e.currentTarget.style.outline = "none")}
                  />
                </div>
              )}

              {/* Attachment Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="edit-action-attachment-notes-input"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "6px" }}
                >
                  Attachment Notes (Optional)
                </label>
                <input
                  id="edit-action-attachment-notes-input"
                  type="text"
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                />
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  id="edit-action-cancel-btn"
                  type="button"
                  onClick={closeModals}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D1D5DB",
                    color: "#374151",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    minHeight: "44px",
                  }}
                >
                  Cancel
                </button>
                <button
                  id="edit-action-submit-btn"
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#006B3C",
                    border: "none",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    minHeight: "44px",
                  }}
                  onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0B7A46")}
                  onBlur={(e) => (e.currentTarget.style.outline = "none")}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
