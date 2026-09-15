import React, { useState } from "react";
import { loginApi, UserProfile } from "../api";

interface LoginProps {
  onLoginSuccess?: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await loginApi(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-lg border border-emerald-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Sign In to TokTickIT</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your portal</p>
      </div>

      {error && (
        <div id="login-error" className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. jennifer.a@example.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            disabled={submitting}
            required
          />
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50"
        >
          {submitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
