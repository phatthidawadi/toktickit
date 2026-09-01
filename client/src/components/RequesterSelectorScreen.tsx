import React, { useState, useEffect } from "react";
import { fetchRequesters, Requester } from "../api.js";
import { useRequester } from "../context/RequesterContext.js";

export const RequesterSelectorScreen: React.FC = () => {
  const { selectedRequester, setSelectedRequester, isSelectorOpen, setIsSelectorOpen } = useRequester();

  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | string>(selectedRequester?.id || "");

  useEffect(() => {
    if (isSelectorOpen) {
      setLoading(true);
      setError(null);
      fetchRequesters()
        .then((data) => {
          setRequesters(data);
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load requesters");
          setLoading(false);
        });
    }
  }, [isSelectorOpen]);

  if (!isSelectorOpen) return null;

  const handleContinue = () => {
    const found = requesters.find((r) => r.id === Number(selectedId));
    if (found) {
      setSelectedRequester(found);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E0E6E2",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "520px",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#EAF6EF",
              color: "#006B3C",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              marginBottom: "12px",
            }}
          >
            User
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1F2925", margin: "0 0 6px 0" }}>
            Select Development Requester
          </h2>
          <p style={{ fontSize: "13px", color: "#65756E", margin: 0 }}>
            Choose a development requester to simulate the current requester context for Lab 2.
            This is for testing only and is not a login screen.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#65756E" }}>
            Loading active requesters...
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FDF2F2",
              border: "1px solid #F87171",
              color: "#C5221F",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {requesters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px", color: "#65756E" }}>
                No active requesters available.
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="requester-select"
                  style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1F2925", marginBottom: "6px" }}
                >
                  Development Requester <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <select
                  id="requester-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    border: "1px solid #C8D2CC",
                    fontSize: "14px",
                    color: "#1F2925",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {requesters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.department} - {r.email})
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    backgroundColor: "#EAF6EF",
                    border: "1px solid #C8E6D5",
                    borderRadius: "6px",
                    padding: "12px",
                    marginTop: "16px",
                    fontSize: "12px",
                    color: "#1F2925",
                  }}
                >
                  <strong>Authentication coming in Lab 3</strong>
                  <br />
                  In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              {selectedRequester && (
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(false)}
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
              )}
              <button
                type="button"
                onClick={handleContinue}
                disabled={requesters.length === 0}
                style={{
                  backgroundColor: requesters.length === 0 ? "#E0E6E2" : "#006B3C",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: requesters.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
