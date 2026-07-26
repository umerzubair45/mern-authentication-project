import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Spinner from "../components/Spinner/Spinner";
import Alert from "../components/Alert/Alert";
import Card from "../components/Card/Card";
import useApi from "../hooks/useApi";

const VerifyEmail = () => {
  const { token } = useParams();

  const { loading, request } = useApi();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState({});

  useEffect(() => {
    const verifyEmail = async () => {
      const result = await request({
        url: `/api/auth/verify-email/${token}`,
        method: "GET",
        showSuccessToast: false,
      });

      if (result?.success) {
        setSuccess(result.data.message);
        setError("");
      } else {
        setError(result?.data?.message || "Something went wrong.");
        setResult(result?.data || {});
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Card>
      {success && <Alert type="success">{success}</Alert>}

      {error && <Alert type="error">{error}</Alert>}

      {error && result?.code === "VERIFICATION_TOKEN_EXPIRED" ? (
        <Link to="/resend-verification">Resend Verification Email</Link>
      ) : (
        <Link to="/login" replace>
          Go To Login
        </Link>
      )}
    </Card>
  );
};

export default VerifyEmail;
