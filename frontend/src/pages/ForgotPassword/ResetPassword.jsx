import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./resetPassword.css";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import useForm from "../../hooks/useForm";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { formData, handleChange } = useForm({
    userPassword: "",
    userConfirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    const password = formData.userPassword;

    if (!password) {
      return {
        text: "",
        class: "",
      };
    }

    if (password.length < 8) {
      return {
        text: "Weak",
        class: "weak",
      };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = hasUppercase + hasLowercase + hasNumber + hasSpecial;

    if (score <= 2) {
      return {
        text: "Medium",
        class: "medium",
      };
    }

    return {
      text: "Strong",
      class: "strong",
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.userPassword !== formData.userConfirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5051/api/auth/reset-password/${token}`,
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

        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
      title="Reset Password"
      subtitle="Create your new password."
      className="reset_password"
    >
      <form onSubmit={submitHandler}>
        <Input
          label="New Password"
          name="userPassword"
          type="password"
          placeholder="Enter new password"
          value={formData.userPassword}
          onChange={handleChange}
          minLength={8}
          required
        />
        {formData.userPassword && (
          <div className="password-strength">
            <div className="strength-bar">
              <div
                className={`strength-fill ${getPasswordStrength().class}`}
              ></div>
            </div>

            <small>
              Password Strength:
              <strong> {getPasswordStrength().text}</strong>
            </small>
          </div>
        )}
        <Input
          label="Confirm Password"
          name="userConfirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={formData.userConfirmPassword}
          onChange={handleChange}
          minLength={8}
          required
        />

        {formData.userConfirmPassword.length > 0 &&
          (formData.userPassword === formData.userConfirmPassword ? (
            <p className="success">✓ Passwords match</p>
          ) : (
            <p className="error">✗ Passwords do not match</p>
          ))}

        <Button
          type="submit"
          disabled={
            loading ||
            formData.userPassword !== formData.userConfirmPassword ||
            getPasswordStrength().text === "Weak" ||
            getPasswordStrength().text === "Medium"
          }
        >
          {loading ? "Updating..." : "Reset Password"}
        </Button>
      </form>
    </Card>
  );
};

export default ResetPassword;
