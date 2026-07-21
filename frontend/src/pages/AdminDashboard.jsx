import { useEffect, useState } from "react";

import Card from "../components/Card/Card";
import Spinner from "../components/Spinner/Spinner";
import useApi from "../hooks/useApi";

const AdminDashboard = () => {
  const { loading, request } = useApi();

  const [adminData, setAdminData] = useState(null);

  const fetchAdminDashboard = async () => {
    const result = await request({
      url: "/api/auth/admin-dashboard",
      method: "GET",
      showSuccessToast: false,
    });

    if (result.success) {
      setAdminData(result.data);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <Spinner />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <Card title="Admin Dashboard">
      {adminData ? (
        <div>
          <h2>{adminData.message}</h2>

          <p>
            <strong>Name:</strong> {adminData.user.userName}
          </p>

          <p>
            <strong>Email:</strong> {adminData.user.userEmail}
          </p>

          <p>
            <strong>Role:</strong> {adminData.user.role}
          </p>
        </div>
      ) : (
        <p>No admin data found.</p>
      )}
    </Card>
  );
};

export default AdminDashboard;
