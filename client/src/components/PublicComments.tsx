import React, { useState, useEffect } from "react";
import { fetchPublicCommentsApi, createPublicCommentApi, PublicComment } from "../api";

interface PublicCommentsProps {
  ticketId: number;
  onCommentAdded?: () => void;
}

export const PublicComments: React.FC<PublicCommentsProps> = ({ ticketId, onCommentAdded }) => {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicCommentsApi(ticketId);
      setComments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load public comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadComments();
    }
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = newComment.trim();
    if (!trimmed) {
      setSubmitError("Comment content cannot be empty.");
      return;
    }
    if (trimmed.length > 1000) {
      setSubmitError("Comment content cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await createPublicCommentApi(ticketId, trimmed);
      setNewComment("");
      await loadComments();
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "REQUESTER":
        return <span style={{ backgroundColor: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>Requester</span>;
      case "IT_STAFF":
        return <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>IT Staff</span>;
      case "ADMINISTRATOR":
        return <span style={{ backgroundColor: "#E0E7FF", color: "#3730A3", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>Admin</span>;
      default:
        return <span style={{ backgroundColor: "#F3F4F6", color: "#374151", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>{role}</span>;
    }
  };

  return (
    <div id="public-comments-container" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E5E7EB" }}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>
        Public Comments ({comments.length})
      </h3>

      {loading && <div style={{ color: "#6B7280", fontSize: "0.875rem" }}>Loading comments...</div>}

      {error && (
        <div style={{ padding: "12px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {!loading && !error && comments.length === 0 && (
        <div style={{ color: "#6B7280", fontSize: "0.875rem", fontStyle: "italic", marginBottom: "16px" }}>
          No public comments yet.
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="comment-card"
              style={{
                padding: "12px 16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>{comment.author?.name || "User"}</span>
                  {getRoleBadge(comment.author?.role || "REQUESTER")}
                </div>
                <span style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, color: "#374151", fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                {comment.content}
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
          id="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a public comment..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #D1D5DB",
            fontSize: "0.875rem",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            id="submit-comment-btn"
            type="submit"
            disabled={submitting}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0B7A46",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};
