import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import useForm from "../../hooks/useForm";
import useApi from "../../hooks/useApi";

const ForgotPassword = () => {
  const { formData, setFormData, handleChange } = useForm({
    userEmail: "",
  });

  const { loading, request } = useApi();

  const submitHandler = async (e) => {
    e.preventDefault();

    const result = await request({
      url: "/api/auth/forgot-password",
      method: "POST",
      body: formData,
    });

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        userEmail: "",
      }));
    }
  };

  return (
    <Card
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link."
      className="forgotPassword"
    >
      <form onSubmit={submitHandler}>
        <Input
          label="Email"
          name="userEmail"
          type="email"
          placeholder="Enter your email"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="auth-link">
        Remember your password?
        <Link to="/login"> Login</Link>
      </p>
    </Card>
  );
};

export default ForgotPassword;
