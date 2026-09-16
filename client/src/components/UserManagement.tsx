import React, { useState, useEffect } from "react";
import {
  AdminUser,
  fetchAdminUsersApi,
  createAdminUserApi,
  updateAdminUserApi,
  resetAdminUserPasswordApi,
} from "../api.js";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resettingUser, setResettingUser] = useState<AdminUser | null>(null);

  // Form states for Create Modal
  const [createName, setCreateName] = useState<string>("");
  const [createEmail, setCreateEmail] = useState<string>("");
  const [createRole, setCreateRole] = useState<string>("REQUESTER");
  const [createPassword, setCreatePassword] = useState<string>("");
  const [createIsActive, setCreateIsActive] = useState<boolean>(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form states for Edit Modal
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("REQUESTER");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Form states for Reset Password Modal
  const [resetPassword, setResetPassword] = useState<string>("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsersApi(search, roleFilter);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleOpenCreateModal = () => {
    setCreateName("");
    setCreateEmail("");
    setCreateRole("REQUESTER");
    setCreatePassword("");
    setCreateIsActive(true);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createName.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!createEmail.trim()) {
      setCreateError("Email is required");
      return;
    }
    if (!createPassword) {
      setCreateError("Initial password is required");
      return;
    }

    try {
      await createAdminUserApi({
        name: createName.trim(),
        email: createEmail.trim(),
        role: createRole,
        initialPassword: createPassword,
        isActive: createIsActive,
      });
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create user");
    }
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    try {
      await updateAdminUserApi(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        isActive: editIsActive,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setEditError(err.message || "Failed to update user");
    }
  };

  const handleOpenResetModal = (user: AdminUser) => {
    setResettingUser(user);
    setResetPassword("");
    setResetError(null);
    setResetSuccess(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setResetError(null);
    setResetSuccess(null);

    if (!resetPassword) {
      setResetError("New initial password is required");
      return;
    }

    try {
      await resetAdminUserPasswordApi(resettingUser.id, resetPassword);
      setResetSuccess("Initial password reset successfully!");
      setTimeout(() => {
        setResettingUser(null);
        setResetSuccess(null);
      }, 1200);
    } catch (err: any) {
      setResetError(err.message || "Failed to reset password");
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === "REQUESTER") {
      return <span className="role-badge role-badge-requester">Requester</span>;
    }
    if (role === "IT_STAFF") {
      return <span className="role-badge role-badge-staff">IT Staff</span>;
    }
    if (role === "ADMINISTRATOR") {
      return <span className="role-badge role-badge-admin">Administrator</span>;
    }
    return <span className="role-badge">{role}</span>;
  };

  return (
    <div className="user-management-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        className="user-management-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
      >
        <h2 style={{ color: "#1F2925", margin: 0 }}>User Management</h2>
        <button
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
          style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none" }}
        >
          + Create User
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="user-management-toolbar card p-3 mb-4"
        style={{
          display: "flex",
          gap: 16,
          backgroundColor: "#FFFFFF",
          border: "1px solid #E0E6E2",
          borderRadius: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="user-search-input" className="form-label" style={{ fontSize: "13px", color: "#65756E" }}>
            Search Users
          </label>
          <input
            id="user-search-input"
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: 220 }}>
          <label htmlFor="role-filter-select" className="form-label" style={{ fontSize: "13px", color: "#65756E" }}>
            Filter by Role
          </label>
          <select
            id="role-filter-select"
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="IT_STAFF">IT Staff</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert" style={{ backgroundColor: "#FDF2F2", color: "#C5221F" }}>
          {error}
        </div>
      )}

      {/* User Data Table */}
      <div className="card" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0E6E2", borderRadius: 8, overflowX: "auto" }}>
        {loading ? (
          <div className="p-4 text-center text-muted">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-muted">No user accounts found.</div>
        ) : (
          <table className="table table-hover mb-0" style={{ minWidth: 650 }}>
            <thead style={{ backgroundColor: "#F9FAFB" }}>
              <tr>
                <th style={{ color: "#65756E" }}>Name</th>
                <th style={{ color: "#65756E" }}>Email</th>
                <th style={{ color: "#65756E" }}>Role</th>
                <th style={{ color: "#65756E" }}>Status</th>
                <th style={{ color: "#65756E", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="user-row">
                  <td style={{ fontWeight: 600, color: "#1F2925" }}>{u.name}</td>
                  <td style={{ color: "#65756E" }}>{u.email}</td>
                  <td>{renderRoleBadge(u.role)}</td>
                  <td>
                    {u.isActive ? (
                      <span
                        className="status-badge status-badge-active"
                        style={{
                          backgroundColor: "#D1FAE5",
                          color: "#065F46",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className="status-badge status-badge-inactive"
                        style={{
                          backgroundColor: "#F3F4F6",
                          color: "#6B7280",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2 edit-user-btn"
                      onClick={() => handleOpenEditModal(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary reset-password-btn"
                      onClick={() => handleOpenResetModal(u)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div
          className="modal-backdrop-custom"
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
            zIndex: 1050,
          }}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h4 style={{ color: "#1F2925", marginBottom: 16 }}>Create New User Account</h4>

            {createError && (
              <div className="alert alert-danger" style={{ backgroundColor: "#FDF2F2", color: "#C5221F", padding: 10, fontSize: 14 }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div className="mb-3">
                <label htmlFor="create-name-input" className="form-label" style={{ fontWeight: 600 }}>
                  Full Name <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="create-name-input"
                  type="text"
                  className="form-control"
                  required
                  aria-required="true"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="create-email-input" className="form-label" style={{ fontWeight: 600 }}>
                  Email Address <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="create-email-input"
                  type="email"
                  className="form-control"
                  required
                  aria-required="true"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="create-role-select" className="form-label" style={{ fontWeight: 600 }}>
                  Role <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <select
                  id="create-role-select"
                  className="form-select"
                  required
                  aria-required="true"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                >
                  <option value="REQUESTER">Requester</option>
                  <option value="IT_STAFF">IT Staff</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="create-password-input" className="form-label" style={{ fontWeight: 600 }}>
                  Initial Password <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="create-password-input"
                  type="password"
                  className="form-control"
                  required
                  aria-required="true"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 number"
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  id="create-active-check"
                  type="checkbox"
                  className="form-check-input"
                  checked={createIsActive}
                  onChange={(e) => setCreateIsActive(e.target.checked)}
                />
                <label htmlFor="create-active-check" className="form-check-label">
                  Account Active
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none" }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div
          className="modal-backdrop-custom"
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
            zIndex: 1050,
          }}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h4 style={{ color: "#1F2925", marginBottom: 16 }}>Edit User Account</h4>

            {editError && (
              <div className="alert alert-danger error-alert" style={{ backgroundColor: "#FDF2F2", color: "#C5221F", padding: 10, fontSize: 14 }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="mb-3">
                <label htmlFor="edit-name-input" className="form-label" style={{ fontWeight: 600 }}>
                  Full Name <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="edit-name-input"
                  type="text"
                  className="form-control"
                  required
                  aria-required="true"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="edit-email-input" className="form-label" style={{ fontWeight: 600 }}>
                  Email Address <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="edit-email-input"
                  type="email"
                  className="form-control"
                  required
                  aria-required="true"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="edit-role-select" className="form-label" style={{ fontWeight: 600 }}>
                  Role <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <select
                  id="edit-role-select"
                  className="form-select"
                  required
                  aria-required="true"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="REQUESTER">Requester</option>
                  <option value="IT_STAFF">IT Staff</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="mb-3 form-check">
                <input
                  id="edit-active-check"
                  type="checkbox"
                  className="form-check-input"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                />
                <label htmlFor="edit-active-check" className="form-check-label">
                  Account Active
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET INITIAL PASSWORD MODAL */}
      {resettingUser && (
        <div
          className="modal-backdrop-custom"
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
            zIndex: 1050,
          }}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <h4 style={{ color: "#1F2925", marginBottom: 12 }}>Reset Initial Password</h4>

            <p style={{ fontSize: 14, color: "#65756E", marginBottom: 16 }}>
              This will set a new initial password for <strong>{resettingUser.name}</strong>. The user will be required to change this password upon their next login.
            </p>

            {resetError && (
              <div className="alert alert-danger error-alert" style={{ backgroundColor: "#FDF2F2", color: "#C5221F", padding: 10, fontSize: 14 }}>
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="alert alert-success" style={{ backgroundColor: "#EAF6EF", color: "#065F46", padding: 10, fontSize: 14 }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              <div className="mb-3">
                <label htmlFor="reset-password-input" className="form-label" style={{ fontWeight: 600 }}>
                  New Initial Password <span style={{ color: "#C5221F" }}>*</span>
                </label>
                <input
                  id="reset-password-input"
                  type="password"
                  className="form-control"
                  required
                  aria-required="true"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 upper, 1 lower, 1 number"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResettingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: "#006B3C", color: "#FFFFFF", border: "none" }}
                >
                  Set Initial Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
