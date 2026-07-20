import { Link } from "react-router-dom";

import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

import useForm from "../../hooks/useForm";
import useApi from "../../hooks/useApi";

const ResendVerification = () => {
  const { formData, handleChange, setFormData } = useForm({
    userEmail: "",
  });

  const { loading, request } = useApi();

  const submitHandler = async (e) => {
    e.preventDefault();

    const result = await request({
      url: "/api/auth/resend-verification",
      method: "POST",
      body: formData,
    });

    if (result.success) {
      setFormData({
        userEmail: "",
      });
    }
  };

  return (
    <Card
      title="Resend Verification Email"
      subtitle="Enter your registered email address."
      className="resend-verification"
    >
      <form onSubmit={submitHandler}>
        <Input
          label="Email Address"
          name="userEmail"
          type="email"
          placeholder="Enter your email"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Verification Email"}
        </Button>
      </form>

      <p className="auth-link">
        Already verified?
        <Link to="/login"> Login</Link>
      </p>
    </Card>
  );
};

export default ResendVerification;
