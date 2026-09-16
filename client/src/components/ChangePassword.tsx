import React, { useState } from "react";
import { changePasswordApi } from "../api";

interface ChangePasswordProps {
  onPasswordChanged?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onPasswordChanged }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("New password must contain uppercase, lowercase, and numbers");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    try {
      setSubmitting(true);
      const res = await changePasswordApi(currentPassword, newPassword, confirmPassword);
      setSuccess(res.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (onPasswordChanged) {
        onPasswordChanged();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-password-container max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-lg border border-amber-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Mandatory Password Update</h2>
        <p className="text-sm text-slate-500 mt-1">
          Your account requires a new password before accessing system features.
        </p>
      </div>

      {error && (
        <div id="change-password-error" className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div id="change-password-success" className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="current-password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 8 chars (A-Z, a-z, 0-9)"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            disabled={submitting}
            required
          />
        </div>

        <button
          id="change-password-submit-btn"
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {submitting ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
