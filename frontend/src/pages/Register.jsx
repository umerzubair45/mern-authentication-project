import "./Register.css";

import useForm from "../hooks/useForm";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../components/Spinner/Spinner";
import Card from "../components/Card/Card";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";
import Alert from "../components/Alert/Alert";
import Form from "../components/Form/Form";
import useApi from "../hooks/useApi";

const Register = () => {
  const navigate = useNavigate();
  const { loading, request } = useApi();
  const { formData, handleChange, resetForm, errors, setErrors } = useForm({
    userName: "",
    userEmail: "",
    userPassword: "",
    userConfirmPassword: "",
  });
  const onChange = (e) => {
    if (e.target.name === "userEmail") {
      e.target.value = e.target.value.toLowerCase();
    }

    handleChange(e);

    setErrors((prev) => ({
      ...prev,

      [e.target.name]: validateField(
        e.target.name,

        e.target.value,
      ),
    }));
  };

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

  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        if (value.length < 6) {
          return "Username must be at least 6 characters.";
        }

        return "";

      case "userEmail":
        if (!/\S+@\S+\.\S+/.test(value)) {
          return "Please enter a valid email.";
        }

        return "";

      case "userPassword":
        if (value.length < 8) {
          return "Password must be at least 8 characters.";
        }

        return "";

      default:
        return "";
    }
  };

  const formHandler = async (e) => {
    e.preventDefault();

    const result = await request({
      url: "/api/auth/register",
      method: "POST",
      body: formData,
    });
    if (result.success) {
      resetForm();
      navigate("/login");
    }
  };
  return (
    <div className="register-page">
      <Card className="register-card">
        <div className="register-header">
          <h1>Create Account 🚀</h1>
          <p>Join us today! It's quick and easy.</p>
        </div>
        <Form className="register-form" onSubmit={formHandler}>
          <Input
            id="userName"
            label="Username"
            name="userName"
            type="text"
            placeholder="Enter your username"
            value={formData.userName}
            onChange={onChange}
            minLength={6}
            error={errors.userName}
            required
          />

          <Input
            id="userEmail"
            label="Email Address"
            name="userEmail"
            type="email"
            placeholder="Enter your email"
            value={formData.userEmail}
            error={errors.userEmail}
            onChange={onChange}
            required
          />

          <Input
            id="userPassword"
            label="Password"
            name="userPassword"
            type="password"
            placeholder="Enter your password"
            value={formData.userPassword}
            error={errors.userPassword}
            onChange={onChange}
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
            id="userConfirmPassword"
            label="Confirm Password"
            name="userConfirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.userConfirmPassword}
            onChange={onChange}
            required
          />
          {formData.userConfirmPassword.length > 0 &&
            (formData.userPassword === formData.userConfirmPassword ? (
              <Alert type="success">Passwords match</Alert>
            ) : (
              <Alert type="danger">Passwords do not match</Alert>
            ))}

          <div className="terms">
            <label>
              <input type="checkbox" required />I agree to the Terms &
              Conditions
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={
              loading || formData.userPassword !== formData.userConfirmPassword
            }
          >
            {loading ? (
              <>
                <Spinner size="small" color="white" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>

        <div className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
};
export default Register;
