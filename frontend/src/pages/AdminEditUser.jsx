import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useApi from "../hooks/useApi";
import "./AdminEditUser.css";

const AdminEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { request, loading } = useApi();

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
  });

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const result = await request({
        url: `/api/users/${id}`,
        method: "GET",
        showSuccessToast: false,
      });

      if (result?.success) {
        setFormData({
          userName: result.data.user.userName || "",
          userEmail: result.data.user.userEmail || "",
        });
      }

      setPageLoading(false);
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await request({
      url: `/api/users/${id}`,
      method: "PUT",
      body: formData,
    });

    if (result?.success) {
      navigate(`/admin/users/${id}`);
    }
  };

  if (pageLoading) {
    return (
      <div className="admin-edit-user-page">
        <div className="edit-loading">Loading user information...</div>
      </div>
    );
  }

  return (
    <div className="admin-edit-user-page">
      {/* Breadcrumb */}
      <div className="edit-breadcrumb">
        <Link to="/admin">User Management</Link>

        <span>/</span>

        <Link to={`/admin/users/${id}`}>User Details</Link>

        <span>/</span>

        <span>Edit User</span>
      </div>

      {/* Page Header */}
      <div className="edit-page-header">
        <div>
          <h1>Edit User</h1>

          <p>Update the user's basic account information.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="edit-user-card">
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="userName">Full Name</label>

            <input
              id="userName"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter user's name"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="userEmail">Email Address</label>

            <input
              id="userEmail"
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="Enter user's email"
              required
            />
          </div>

          {/* Role Information */}
          <div className="role-info">
            <strong>Role</strong>

            <p>
              User roles cannot be changed from this page. Role management is
              handled separately for security.
            </p>
          </div>

          {/* Actions */}
          <div className="edit-actions">
            <Link to={`/admin/users/${id}`} className="cancel-edit-btn">
              Cancel
            </Link>

            <button type="submit" className="save-user-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;
