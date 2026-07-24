import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useApi from "../hooks/useApi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { request, loading } = useApi();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await request({
        url: "/api/users",
        method: "GET",
        showSuccessToast: false,
      });

      if (result?.success) {
        setUsers(result.data.users);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage and monitor all registered users.</p>
        </div>

        <div className="user-count">
          <span>{users.length}</span>
          <small>Total Users</small>
        </div>
      </div>

      {/* Users Card */}
      <div className="users-card">
        <div className="users-card-header">
          <div>
            <h2>All Users</h2>
            <p>View and manage registered accounts</p>
          </div>

          <div className="user-search">
            <span>🔍</span>

            <input type="text" placeholder="Search users..." />
          </div>
        </div>

        {/* Loading */}
        {loading && <div className="users-loading">Loading users...</div>}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="empty-users">
            <div className="empty-icon">👥</div>

            <h3>No users found</h3>

            <p>There are currently no registered users.</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && users.length > 0 && (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    {/* User */}
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.userName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{user.userName}</strong>

                          <span>ID: {user._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className="user-email">{user.userEmail}</span>
                    </td>

                    {/* Role */}
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      {user.isVerified ? (
                        <span className="status verified">
                          <span>●</span>
                          Verified
                        </span>
                      ) : (
                        <span className="status unverified">
                          <span>●</span>
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="view-user-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
