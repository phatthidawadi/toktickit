import React, { useState, useEffect } from "react";
import { fetchInternalNotesApi, createInternalNoteApi, TicketInternalNote } from "../api";

interface InternalNotesProps {
  ticketId: number;
}

export const InternalNotes: React.FC<InternalNotesProps> = ({ ticketId }) => {
  const [notes, setNotes] = useState<TicketInternalNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newNote, setNewNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInternalNotesApi(ticketId);
      setNotes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load internal notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadNotes();
    }
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = newNote.trim();
    if (!trimmed) {
      setSubmitError("Internal note content cannot be empty.");
      return;
    }
    if (trimmed.length > 1000) {
      setSubmitError("Internal note content cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await createInternalNoteApi(ticketId, trimmed);
      setNewNote("");
      await loadNotes();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to post internal note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="internal-notes-container"
      style={{
        marginTop: "24px",
        padding: "20px",
        backgroundColor: "#FEF3C7",
        border: "1px solid #FDE68A",
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#92400E", margin: 0 }}>
          Confidential Internal Notes ({notes.length})
        </h3>
        <span
          style={{
            backgroundColor: "#F59E0B",
            color: "#FFFFFF",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Staff/Admin Only
        </span>
      </div>

      {loading && <div style={{ color: "#92400E", fontSize: "0.875rem" }}>Loading internal notes...</div>}

      {error && (
        <div style={{ padding: "10px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div style={{ color: "#B45309", fontSize: "0.875rem", fontStyle: "italic", marginBottom: "16px" }}>
          No internal notes recorded yet.
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {notes.map((note) => (
            <div
              key={note.id}
              className="internal-note-card"
              style={{
                padding: "12px 16px",
                backgroundColor: "#FFFBEB",
                borderRadius: "6px",
                border: "1px solid #FCD34D",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "#78350F", fontSize: "0.875rem" }}>{note.author?.name || "Staff"}</span>
                <span style={{ color: "#B45309", fontSize: "0.75rem" }}>
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, color: "#92400E", fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {submitError && (
          <div style={{ padding: "8px 12px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "0.875rem" }}>
            {submitError}
          </div>
        )}
        <textarea
          id="note-input"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Record a confidential internal note..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #FCD34D",
            fontSize: "0.875rem",
            resize: "vertical",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            id="submit-note-btn"
            type="submit"
            disabled={submitting}
            style={{
              padding: "8px 16px",
              backgroundColor: "#D97706",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving Note..." : "Save Internal Note"}
          </button>
        </div>
      </form>
    </div>
  );
};
