import React, { useState, useEffect } from "react";
import {
  ActionTaken,
  ActionTakenStatus,
  fetchActionsTakenApi,
  createActionTakenApi,
  updateActionTakenApi,
  fetchStaffAssigneesApi,
} from "../api";

interface ActionsTakenSectionProps {
  ticketId: number;
  isReadOnly?: boolean;
}

interface StaffAssignee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({
  ticketId,
  isReadOnly = false,
}) => {
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Staff assignees list for dropdown
  const [assignees, setAssignees] = useState<StaffAssignee[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createDescription, setCreateDescription] = useState<string>("");
  const [createResult, setCreateResult] = useState<string>("");
  const [createStatus, setCreateStatus] = useState<ActionTakenStatus>("COMPLETED");
  const [createFollowUpRequired, setCreateFollowUpRequired] = useState<boolean>(false);
  const [createFollowUpNote, setCreateFollowUpNote] = useState<string>("");
  const [createAttachmentNotes, setCreateAttachmentNotes] = useState<string>("");
  const [createAssigneeId, setCreateAssigneeId] = useState<string>("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [submittingCreate, setSubmittingCreate] = useState<boolean>(false);

  // Edit Modal State
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);
  const [editDescription, setEditDescription] = useState<string>("");
  const [editResult, setEditResult] = useState<string>("");
  const [editStatus, setEditStatus] = useState<ActionTakenStatus>("COMPLETED");
  const [editFollowUpRequired, setEditFollowUpRequired] = useState<boolean>(false);
  const [editFollowUpNote, setEditFollowUpNote] = useState<string>("");
  const [editAttachmentNotes, setEditAttachmentNotes] = useState<string>("");
  const [editAssigneeId, setEditAssigneeId] = useState<string>("");
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

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
    if (isReadOnly) return;
    try {
      const list = await fetchStaffAssigneesApi();
      setAssignees(list);
    } catch {
      // Ignore staff list error gracefully
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadActions();
      loadAssignees();
    }
  }, [ticketId, isReadOnly]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateDescription("");
    setCreateResult("");
    setCreateStatus("COMPLETED");
    setCreateFollowUpRequired(false);
    setCreateFollowUpNote("");
    setCreateAttachmentNotes("");
    setCreateAssigneeId("");
    setCreateFormError(null);
    setShowCreateModal(true);
  };

  // Submit Create Action
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError(null);

    if (!createDescription.trim()) {
      setCreateFormError("Description is required.");
      return;
    }
    if (!createResult.trim()) {
      setCreateFormError("Result is required.");
      return;
    }
    if (createFollowUpRequired && !createFollowUpNote.trim()) {
      setCreateFormError("Follow-up note is required when follow-up is requested.");
      return;
    }

    setSubmittingCreate(true);
    try {
      await createActionTakenApi(ticketId, {
        description: createDescription.trim(),
        result: createResult.trim(),
        status: createStatus,
        followUpRequired: createFollowUpRequired,
        followUpNote: createFollowUpRequired ? createFollowUpNote.trim() : null,
        attachmentNotes: createAttachmentNotes.trim() ? createAttachmentNotes.trim() : null,
        assigneeId: createAssigneeId ? parseInt(createAssigneeId, 10) : null,
      });
      setShowCreateModal(false);
      await loadActions();
    } catch (err: any) {
      setCreateFormError(err.message || "Failed to record action taken.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (action: ActionTaken) => {
    setEditingAction(action);
    setEditDescription(action.description);
    setEditResult(action.result);
    setEditStatus(action.status);
    setEditFollowUpRequired(action.followUpRequired);
    setEditFollowUpNote(action.followUpNote || "");
    setEditAttachmentNotes(action.attachmentNotes || "");
    setEditAssigneeId(action.assigneeId ? String(action.assigneeId) : "");
    setEditFormError(null);
    setConflictWarning(null);
  };

  // Submit Edit Action
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;
    setEditFormError(null);
    setConflictWarning(null);

    if (!editDescription.trim()) {
      setEditFormError("Description is required.");
      return;
    }
    if (!editResult.trim()) {
      setEditFormError("Result is required.");
      return;
    }
    if (editFollowUpRequired && !editFollowUpNote.trim()) {
      setEditFormError("Follow-up note is required when follow-up is requested.");
      return;
    }

    setSubmittingEdit(true);
    try {
      await updateActionTakenApi(editingAction.id, {
        description: editDescription.trim(),
        result: editResult.trim(),
        status: editStatus,
        followUpRequired: editFollowUpRequired,
        followUpNote: editFollowUpRequired ? editFollowUpNote.trim() : null,
        attachmentNotes: editAttachmentNotes.trim() ? editAttachmentNotes.trim() : null,
        assigneeId: editAssigneeId ? parseInt(editAssigneeId, 10) : null,
        version: editingAction.version,
      });
      setEditingAction(null);
      await loadActions();
    } catch (err: any) {
      if (err.status === 409 || err.code === "CONCURRENCY_CONFLICT") {
        setConflictWarning(
          "This action line was modified by another technician in another session. Please review the updated record and re-apply your changes."
        );
      } else {
        setEditFormError(err.message || "Failed to update action item.");
      }
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConflictReload = async () => {
    await loadActions();
    setEditingAction(null);
    setConflictWarning(null);
  };

  const getStatusBadgeStyle = (status: ActionTakenStatus) => {
    switch (status) {
      case "COMPLETED":
        return { backgroundColor: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" };
      case "IN_PROGRESS":
        return { backgroundColor: "#DBEAFE", color: "#1E40AF", border: "1px solid #BFDBFE" };
      case "PENDING":
        return { backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" };
      case "CANCELLED":
        return { backgroundColor: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1" };
      default:
        return { backgroundColor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" };
    }
  };

  return (
    <div
      id="actions-taken-container"
      data-testid="actions-taken-section"
      style={{
        backgroundColor: "#FFFFFF",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #E2E8F0",
        marginTop: "24px",
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
          marginBottom: "16px",
          borderBottom: "1px solid #F1F5F9",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>
            Actions Taken
          </h3>
          <span
            id="actions-count-badge"
            style={{
              backgroundColor: "#E6F4EA",
              color: "#006B3C",
              padding: "2px 10px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ({actions.length})
          </span>
        </div>

        {!isReadOnly && (
          <button
            id="add-action-btn"
            type="button"
            onClick={handleOpenCreate}
            style={{
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>+</span> Record Action
          </button>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div id="actions-loading-state" style={{ padding: "20px", textAlign: "center", color: "#64748B" }}>
          Loading actions taken...
        </div>
      )}

      {error && (
        <div
          id="actions-error-state"
          style={{
            padding: "12px 16px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && actions.length === 0 && (
        <div
          id="no-actions-message"
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "#64748B",
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
            fontSize: "0.95rem",
            border: "1px dashed #CBD5E1",
          }}
        >
          No technical actions have been recorded for this ticket yet.
        </div>
      )}

      {/* Actions List / Table */}
      {!loading && actions.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            id="actions-taken-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Date/Time</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Description</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Result</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Performed By</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Assignee</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Follow-Up</th>
                <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Attachments</th>
                {!isReadOnly && (
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => {
                const badgeStyle = getStatusBadgeStyle(act.status);
                const formattedDate = new Date(act.actionDateTime).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={act.id}
                    id={`action-row-${act.id}`}
                    style={{ borderBottom: "1px solid #E2E8F0" }}
                  >
                    <td style={{ padding: "12px", color: "#64748B", whiteSpace: "nowrap" }}>
                      {formattedDate}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#1E293B" }}>
                      {act.description}
                    </td>
                    <td style={{ padding: "12px", color: "#334155" }}>
                      {act.result}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          ...badgeStyle,
                        }}
                      >
                        {act.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#334155" }}>
                      {act.performedBy?.name || "Staff"}
                    </td>
                    <td style={{ padding: "12px", color: "#64748B" }}>
                      {act.assignee ? act.assignee.name : "—"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {act.followUpRequired ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span
                            style={{
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              alignSelf: "flex-start",
                            }}
                          >
                            Required
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#78350F" }}>
                            {act.followUpNote}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#94A3B8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", color: "#64748B", fontSize: "0.8rem" }}>
                      {act.attachmentNotes || "—"}
                    </td>
                    {!isReadOnly && (
                      <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                        <button
                          id={`edit-action-${act.id}-btn`}
                          type="button"
                          onClick={() => handleOpenEdit(act)}
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            borderRadius: "4px",
                            padding: "4px 10px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#0F172A",
                            cursor: "pointer",
                          }}
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
      )}

      {/* Create Action Modal */}
      {showCreateModal && (
        <div
          id="create-action-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            id="create-action-modal"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
              Record Action Taken
            </h3>

            {createFormError && (
              <div
                id="create-action-error-alert"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                {createFormError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="action-description"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Description <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  id="action-description"
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Describe the technical intervention, diagnostics, or configuration change..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="action-result"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Result <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  id="action-result"
                  rows={3}
                  value={createResult}
                  onChange={(e) => setCreateResult(e.target.value)}
                  placeholder="Detail the outcome, test results, or diagnostic findings..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label
                    htmlFor="action-status"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                  >
                    Action Status
                  </label>
                  <select
                    id="action-status"
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as ActionTakenStatus)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="action-assignee"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                  >
                    Assignee (Optional)
                  </label>
                  <select
                    id="action-assignee"
                    value={createAssigneeId}
                    onChange={(e) => setCreateAssigneeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="">Leave Unassigned</option>
                    {assignees.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    id="action-followup-toggle"
                    checked={createFollowUpRequired}
                    onChange={(e) => setCreateFollowUpRequired(e.target.checked)}
                  />
                  Requires further follow-up action
                </label>
              </div>

              {createFollowUpRequired && (
                <div style={{ marginBottom: "14px", padding: "12px", backgroundColor: "#FFFBEB", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                  <label
                    htmlFor="action-followup-note"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#92400E", marginBottom: "4px" }}
                  >
                    Follow-Up Instructions / Note <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea
                    id="action-followup-note"
                    rows={2}
                    value={createFollowUpNote}
                    onChange={(e) => setCreateFollowUpNote(e.target.value)}
                    placeholder="Explain what follow-up is needed, who should perform it, and when..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #FCD34D",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="action-attachment-notes"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Attachment Notes (Optional)
                </label>
                <input
                  type="text"
                  id="action-attachment-notes"
                  value={createAttachmentNotes}
                  onChange={(e) => setCreateAttachmentNotes(e.target.value)}
                  placeholder="e.g. Wireshark trace stored on network share..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  id="cancel-create-action-btn"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-action-btn"
                  disabled={submittingCreate}
                  style={{
                    backgroundColor: "#006B3C",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: submittingCreate ? "not-allowed" : "pointer",
                    opacity: submittingCreate ? 0.7 : 1,
                  }}
                >
                  {submittingCreate ? "Saving..." : "Save Action Taken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Action Modal */}
      {editingAction && (
        <div
          id="edit-action-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            id="edit-action-modal"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
              Edit Action Taken #{editingAction.id}
            </h3>

            {/* Concurrency Conflict Warning Banner */}
            {conflictWarning && (
              <div
                id="conflict-warning-banner"
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#FFFBEB",
                  border: "2px solid #F59E0B",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem", color: "#D97706" }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: "#92400E", display: "block", marginBottom: "4px" }}>
                      Concurrency Conflict
                    </strong>
                    <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#B45309" }}>
                      {conflictWarning}
                    </p>
                    <button
                      type="button"
                      id="conflict-reload-btn"
                      onClick={handleConflictReload}
                      style={{
                        backgroundColor: "#D97706",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reload Latest Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editFormError && (
              <div
                id="edit-action-error-alert"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                }}
              >
                {editFormError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="edit-action-description"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Description <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  id="edit-action-description"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="edit-action-result"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Result <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  id="edit-action-result"
                  rows={3}
                  value={editResult}
                  onChange={(e) => setEditResult(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label
                    htmlFor="edit-action-status"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                  >
                    Action Status
                  </label>
                  <select
                    id="edit-action-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ActionTakenStatus)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-action-assignee"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                  >
                    Assignee (Optional)
                  </label>
                  <select
                    id="edit-action-assignee"
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="">Leave Unassigned</option>
                    {assignees.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", fontWeight: 600, color: "#334155", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    id="edit-action-followup-toggle"
                    checked={editFollowUpRequired}
                    onChange={(e) => setEditFollowUpRequired(e.target.checked)}
                  />
                  Requires further follow-up action
                </label>
              </div>

              {editFollowUpRequired && (
                <div style={{ marginBottom: "14px", padding: "12px", backgroundColor: "#FFFBEB", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                  <label
                    htmlFor="edit-action-followup-note"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#92400E", marginBottom: "4px" }}
                  >
                    Follow-Up Instructions / Note <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea
                    id="edit-action-followup-note"
                    rows={2}
                    value={editFollowUpNote}
                    onChange={(e) => setEditFollowUpNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #FCD34D",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="edit-action-attachment-notes"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                >
                  Attachment Notes (Optional)
                </label>
                <input
                  type="text"
                  id="edit-action-attachment-notes"
                  value={editAttachmentNotes}
                  onChange={(e) => setEditAttachmentNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  id="cancel-edit-action-btn"
                  onClick={() => setEditingAction(null)}
                  style={{
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="update-action-btn"
                  disabled={submittingEdit}
                  style={{
                    backgroundColor: "#006B3C",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: submittingEdit ? "not-allowed" : "pointer",
                    opacity: submittingEdit ? 0.7 : 1,
                  }}
                >
                  {submittingEdit ? "Updating..." : "Update Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
