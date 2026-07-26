import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./resetPassword.css";

import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import useForm from "../../hooks/useForm";
import useApi from "../../hooks/useApi";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const { formData, handleChange } = useForm({
    userPassword: "",
    userConfirmPassword: "",
  });

  const { loading, request } = useApi();

  const [errors, setErrors] = useState({});

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

    setErrors({});

    // Password match validation
    if (formData.userPassword !== formData.userConfirmPassword) {
      setErrors({
        userConfirmPassword: "Passwords do not match.",
      });

      return;
    }

    // Password strength validation
    if (getPasswordStrength().text !== "Strong") {
      setErrors({
        userPassword: "Please choose a stronger password.",
      });

      return;
    }

    const result = await request({
      url: `/api/auth/reset-password/${token}`,
      method: "POST",
      body: {
        userPassword: formData.userPassword,
        userConfirmPassword: formData.userConfirmPassword,
      },
    });

    if (result?.success) {
      // Redirect after successful password reset
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Card
      title="Reset Password"
      subtitle="Create your new password."
      className="reset_password"
    >
      {" "}
      <form onSubmit={submitHandler}>
        {" "}
        <Input
          label="New Password"
          name="userPassword"
          type="password"
          placeholder="Enter new password"
          value={formData.userPassword}
          onChange={handleChange}
          minLength={8}
          error={errors.userPassword}
          required
        />
        {formData.userPassword && (
          <div className="password-strength">
            <div className="strength-bar">
              <div className={`strength-fill ${passwordStrength.class}`}></div>
            </div>

            <small>
              Password Strength:
              <strong> {passwordStrength.text}</strong>
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
          error={errors.userConfirmPassword}
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
            passwordStrength.text !== "Strong"
          }
        >
          {loading ? "Updating..." : "Reset Password"}
        </Button>
      </form>
    </Card>
  );
};

export default ResetPassword;
