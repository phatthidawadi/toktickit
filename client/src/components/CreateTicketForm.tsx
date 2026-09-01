import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  fetchRelatedSystems,
  createTicket,
  Category,
  RelatedSystem,
  Ticket,
} from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

interface CreateTicketFormProps {
  onSuccess?: (ticket: Ticket) => void;
  onCancel?: () => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onSuccess, onCancel }) => {
  const { selectedRequester, setIsSelectorOpen } = useRequester();

  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // Form State
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [relatedSystemId, setRelatedSystemId] = useState<number | "">("");
  const [requestedPriority, setRequestedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // UI / Validation State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingOptions(true);

    Promise.all([fetchCategories(), fetchRelatedSystems()])
      .then(([cats, syss]) => {
        if (!isMounted) return;
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
        setRelatedSystems(syss);
        setLoadingOptions(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setFormError(err.message || "Failed to load form reference data");
        setLoadingOptions(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Related Systems when Category changes
  useEffect(() => {
    if (categoryId) {
      const filtered = relatedSystems.filter((s) => s.categoryId === Number(categoryId));
      if (filtered.length > 0) {
        setRelatedSystemId(filtered[0].id);
      } else {
        setRelatedSystemId("");
      }
    }
  }, [categoryId, relatedSystems]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!summary.trim()) {
      newErrors.summary = "Summary is required";
    } else if (summary.trim().length < 5 || summary.trim().length > 100) {
      newErrors.summary = "Summary must be between 5 and 100 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10 || description.trim().length > 1000) {
      newErrors.description = "Description must be between 10 and 1000 characters";
    }

    if (!categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!relatedSystemId) {
      newErrors.relatedSystemId = "Related System is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedRequester) {
      setIsSelectorOpen(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      const ticket = await createTicket(
        {
          summary: summary.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          relatedSystemId: Number(relatedSystemId),
          requestedPriority,
        },
        selectedRequester.id
      );

      setCreatedTicket(ticket);
      setSubmitting(false);
      if (onSuccess) onSuccess(ticket);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit ticket");
      setSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedTicket(null);
    setSummary("");
    setDescription("");
    setErrors({});
    setFormError(null);
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
          No Development Requester Selected
        </h3>
        <p style={{ color: "#65756E", fontSize: "14px", marginBottom: "20px" }}>
          Please select a Development Requester context before creating a support ticket.
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

  if (createdTicket) {
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          padding: "32px",
        }}
      >
        <div
          style={{
            backgroundColor: "#EAF6EF",
            border: "1px solid #C8E6D5",
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ color: "#006B3C", fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0" }}>
            Ticket Submitted Successfully!
          </h3>
          <p style={{ color: "#1F2925", fontSize: "15px", margin: "0 0 12px 0" }}>
            Official Ticket Number: <strong style={{ color: "#006B3C", fontSize: "18px" }}>{createdTicket.ticketNumber}</strong>
          </p>
          <span
            style={{
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Status: {createdTicket.currentStatus}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button
            onClick={handleCreateAnother}
            style={{
              backgroundColor: "#006B3C",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Create Another Ticket
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #C8D2CC",
                color: "#1F2925",
                padding: "10px 24px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Back to My Tickets
            </button>
          )}
        </div>
      </div>
    );
  }

  const availableSystems = relatedSystems.filter((s) => s.categoryId === Number(categoryId));

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        border: "1px solid #E0E6E2",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        padding: "32px",
      }}
    >
      <div style={{ marginBottom: "24px", borderBottom: "1px solid #E0E6E2", pb: "16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1F2925", margin: "0 0 6px 0" }}>
          Create IT Support Ticket
        </h2>
        <p style={{ color: "#65756E", fontSize: "14px", margin: 0 }}>
          Submit a new request for IT support. Required fields are marked with a red asterisk (
          <span style={{ color: "#C5221F" }}>*</span>).
        </p>
      </div>

      {formError && (
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
          {formError}
        </div>
      )}

      {loadingOptions ? (
        <div style={{ textAlign: "center", padding: "32px", color: "#65756E" }}>
          Loading reference data...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Read-Only System Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
                Requester Context
              </label>
              <input
                type="text"
                readOnly
                value={`${selectedRequester.name} (${selectedRequester.department})`}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid #C8D2CC",
                  backgroundColor: "#F0F4F2",
                  color: "#1F2925",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#65756E", marginBottom: "4px" }}>
                Initial Status
              </label>
              <input
                type="text"
                readOnly
                value="NEW (System Assigned)"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid #C8D2CC",
                  backgroundColor: "#F0F4F2",
                  color: "#1F2925",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Classification Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                htmlFor="category-select"
                style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
              >
                Category <span style={{ color: "#C5221F" }}>*</span>
              </label>
              <select
                id="category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: errors.categoryId ? "1px solid #C5221F" : "1px solid #C8D2CC",
                  backgroundColor: "#FFFFFF",
                  fontSize: "14px",
                  color: "#1F2925",
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <div style={{ color: "#C5221F", fontSize: "12px", marginTop: "4px" }}>{errors.categoryId}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="system-select"
                style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
              >
                Related System <span style={{ color: "#C5221F" }}>*</span>
              </label>
              <select
                id="system-select"
                value={relatedSystemId}
                onChange={(e) => setRelatedSystemId(Number(e.target.value))}
                disabled={availableSystems.length === 0}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: errors.relatedSystemId ? "1px solid #C5221F" : "1px solid #C8D2CC",
                  backgroundColor: availableSystems.length === 0 ? "#E0E6E2" : "#FFFFFF",
                  fontSize: "14px",
                  color: "#1F2925",
                }}
              >
                {availableSystems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.relatedSystemId && (
                <div style={{ color: "#C5221F", fontSize: "12px", marginTop: "4px" }}>{errors.relatedSystemId}</div>
              )}
            </div>
          </div>

          {/* Requested Priority */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="priority-select"
              style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
            >
              Requested Priority <span style={{ color: "#C5221F" }}>*</span>
            </label>
            <select
              id="priority-select"
              value={requestedPriority}
              onChange={(e) => setRequestedPriority(e.target.value as any)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px",
                borderRadius: "6px",
                border: "1px solid #C8D2CC",
                backgroundColor: "#FFFFFF",
                fontSize: "14px",
                color: "#1F2925",
              }}
            >
              <option value="LOW">LOW - Minor inconvenience</option>
              <option value="MEDIUM">MEDIUM - Standard issue affecting work</option>
              <option value="HIGH">HIGH - Important system degraded</option>
              <option value="URGENT">URGENT - Critical system completely down</option>
            </select>
          </div>

          {/* Ticket Summary */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="summary-input"
              style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
            >
              Ticket Summary <span style={{ color: "#C5221F" }}>*</span>
            </label>
            <input
              id="summary-input"
              type="text"
              placeholder="e.g. Laptop battery drains quickly after update"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px",
                borderRadius: "6px",
                border: errors.summary ? "1px solid #C5221F" : "1px solid #C8D2CC",
                backgroundColor: "#FFFFFF",
                fontSize: "14px",
                color: "#1F2925",
              }}
            />
            {errors.summary && (
              <div style={{ color: "#C5221F", fontSize: "12px", marginTop: "4px" }}>{errors.summary}</div>
            )}
          </div>

          {/* Ticket Description */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="description-input"
              style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "4px" }}
            >
              Detailed Description <span style={{ color: "#C5221F" }}>*</span>
            </label>
            <textarea
              id="description-input"
              placeholder="Describe the issue in detail, including error messages or steps to reproduce..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: errors.description ? "1px solid #C5221F" : "1px solid #C8D2CC",
                backgroundColor: "#FFFFFF",
                fontSize: "14px",
                color: "#1F2925",
                resize: "vertical",
                minHeight: "120px",
              }}
            />
            {errors.description && (
              <div style={{ color: "#C5221F", fontSize: "12px", marginTop: "4px" }}>{errors.description}</div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #C8D2CC",
                  color: "#1F2925",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? "#65756E" : "#006B3C",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 24px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting Ticket..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
