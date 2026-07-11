import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "./forgotPassword.css";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import useForm from "../../hooks/useForm";

const ForgotPassword = () => {
  const { formData, handleChange } = useForm({
    userEmail: "",
  });

  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5051/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }

    setLoading(false);
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
