import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Spinner from "../components/Spinner/Spinner";
import Alert from "../components/Alert/Alert";
import Card from "../components/Card/Card";

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5051/api/auth/verify-email/${token}`,
        );

        const result = await response.json();

        if (response.ok) {
          setSuccess(result.message);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    verifyEmail();
  }, [token]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Card>
      {success && <Alert type="success">{success}</Alert>}

      {error && <Alert type="error">{error}</Alert>}

      <Link to="/login">Go To Login</Link>
    </Card>
  );
};

export default VerifyEmail;
