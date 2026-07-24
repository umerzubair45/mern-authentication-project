import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import useApi from "../hooks/useApi";
import "./AdminUserDetails.css";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { request, loading } = useApi();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const result = await request({
        url: `/api/users/${id}`,
        method: "GET",
        showSuccessToast: false,
      });

      if (result?.success) {
        setUser(result.data.user);
        setSelectedRole(result.data.user.role);
      }
    };

    fetchUser();
  }, [id]);
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;

    setSelectedRole(newRole);

    const result = await request({
      url: `/api/users/${id}/role`,
      method: "PATCH",
      body: {
        role: newRole,
      },
    });

    if (result?.success) {
      setUser(result.data.user);
    } else {
      // Restore original role if request failed
      setSelectedRole(user.role);
    }
  };

  if (loading) {
    return (
      <div className="admin-user-details-page">
        <div className="user-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-user-details-page">
        <div className="user-not-found">
          <div className="not-found-icon">👤</div>

          <h2>User Not Found</h2>

          <p>
            The user you are looking for does not exist or may have been
            removed.
          </p>

          <Link to="/admin" className="back-users-btn">
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  // Check if the currently logged-in admin
  // is viewing their own account
  const isCurrentUser =
    currentUser &&
    (currentUser._id === user._id || currentUser.userId === user._id);

  return (
    <div className="admin-user-details-page">
      {/* =========================
          BREADCRUMB
      ========================== */}

      <div className="user-details-breadcrumb">
        <Link to="/admin">User Management</Link>

        <span>/</span>

        <span>User Details</span>
      </div>

      {/* =========================
          BACK BUTTON
      ========================== */}

      <button className="back-button" onClick={() => navigate("/admin")}>
        ← Back to Users
      </button>

      {/* =========================
          PROFILE HEADER
      ========================== */}

      <div className="user-profile-header">
        <div className="profile-main">
          {/* Avatar */}

          <div className="large-user-avatar">
            {user.userName?.charAt(0).toUpperCase()}
          </div>

          {/* User Information */}

          <div className="profile-info">
            <h1>{user.userName}</h1>

            <p>{user.userEmail}</p>

            {/* Badges */}

            <div className="profile-badges">
              <span className={`role-badge ${user.role}`}>{user.role}</span>

              {user.isVerified ? (
                <span className="status verified">
                  <span>●</span>
                  Verified Account
                </span>
              ) : (
                <span className="status unverified">
                  <span>●</span>
                  Email Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User ID */}

        <div className="profile-id">
          <span>User ID</span>

          <strong>{user._id}</strong>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="user-details-grid">
        {/* =========================
            ACCOUNT INFORMATION
        ========================== */}

        <div className="details-card">
          <div className="details-card-header">
            <div>
              <h2>Account Information</h2>

              <p>Basic information about this account</p>
            </div>
          </div>

          <div className="details-list">
            {/* Full Name */}

            <div className="detail-item">
              <div className="detail-label">Full Name</div>

              <div className="detail-value">{user.userName}</div>
            </div>

            {/* Email */}

            <div className="detail-item">
              <div className="detail-label">Email Address</div>

              <div className="detail-value">{user.userEmail}</div>
            </div>

            {/* Role */}

            <div className="detail-item">
              <div className="detail-label">Account Role</div>

              <div className="detail-value">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
            </div>

            {/* Verification */}

            <div className="detail-item">
              <div className="detail-label">Email Verification</div>

              <div className="detail-value">
                {user.isVerified ? (
                  <span className="status verified">
                    <span>●</span>
                    Verified
                  </span>
                ) : (
                  <span className="status unverified">
                    <span>●</span>
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* User ID */}

            <div className="detail-item">
              <div className="detail-label">User ID</div>

              <div className="detail-value user-id-value">{user._id}</div>
            </div>
          </div>
        </div>

        {/* =========================
            ACCOUNT STATUS
            + ROLE MANAGEMENT
        ========================== */}

        <div className="details-card">
          {/* Card Header */}

          <div className="details-card-header">
            <div>
              <h2>Account Status</h2>

              <p>Current status and access management</p>
            </div>
          </div>

          {/* =========================
              VERIFICATION STATUS
          ========================== */}

          <div className="account-status-box">
            <div
              className={`status-icon ${
                user.isVerified ? "success" : "warning"
              }`}
            >
              {user.isVerified ? "✓" : "!"}
            </div>

            <div>
              <h3>
                {user.isVerified ? "Account Verified" : "Verification Required"}
              </h3>

              <p>
                {user.isVerified
                  ? "This user has successfully verified their email address."
                  : "This user has not yet verified their email address."}
              </p>
            </div>
          </div>

          {/* =========================
              ROLE MANAGEMENT
          ========================== */}

          <div className="role-management">
            {/* Role Header */}

            <div className="role-management-header">
              <div>
                <h3>Manage User Role</h3>

                <p>Change the access level assigned to this user.</p>
              </div>
            </div>

            {/* Role Label */}

            <label htmlFor="userRole">User Role</label>

            {/* Role Select */}

            <select
              id="userRole"
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={isCurrentUser}
            >
              <option value="user">User</option>

              <option value="manager">Manager</option>

              <option value="admin">Admin</option>
            </select>

            {/* Own Account Warning */}

            {isCurrentUser && (
              <div className="role-warning">
                <span>⚠️</span>

                <p>You cannot change your own role.</p>
              </div>
            )}

            {/* Role Change Information */}

            {!isCurrentUser && (
              <div className="role-info-message">
                <span>ℹ️</span>

                <p>
                  Changing a user's role will immediately update their access
                  permissions.
                </p>
              </div>
            )}
          </div>

          {/* =========================
              ACCOUNT ACTIONS
          ========================== */}

          <div className="user-actions">
            <h3>Account Actions</h3>

            {/* Edit User */}

            <Link
              to={`/admin/users/${user._id}/edit`}
              className="secondary-action-btn"
            >
              Edit User
            </Link>

            {/* Delete User */}

            <button className="danger-action-btn" disabled>
              Delete User
            </button>

            <small>Delete functionality will be available soon.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
