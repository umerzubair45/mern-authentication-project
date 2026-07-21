import { useContext, useState } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Card from "../components/Card/Card";
import Input from "../components/Input/Input";
import Button from "../components/Button/Button";
import Spinner from "../components/Spinner/Spinner";
import useForm from "../hooks/useForm";
import useApi from "../hooks/useApi";

const Login = () => {
  const { formData, handleChange, resetForm } = useForm({
    userEmail: "",
    userPassword: "",
  });
  const { loading, request } = useApi();
  //const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onInputChange = (e) => {
    handleChange(e);

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };
  const validateForm = () => {
    const newErrors = {};

    // Email Validation
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = "Please enter a valid email address";
    }

    // Password Validation
    if (!formData.userPassword.trim()) {
      newErrors.userPassword = "Password is required";
    } else if (formData.userPassword.length < 8) {
      newErrors.userPassword = "Password must be at least 8 characters";
    }
    return newErrors;
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    //setLoading(true);
    /*  try {
      const response = await fetch("http://localhost:5051/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });*/

    const result = await request({
      url: "/api/auth/login",
      method: "POST",
      body: formData,
    });
    if (result.success) {
      login(result.data.user, result.data.token);
      resetForm();
      console.log(result.data.user);
      if (result.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
    /*
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        //localStorage.setItem("token", result.token);
        login(result.user, result.token);
        resetForm();
        navigate("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }*/
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <h1>Welcome Back 👋</h1>
          <p>Login to continue to your account</p>
        </div>

        <form className="login-form" onSubmit={loginHandler}>
          <Input
            id="email"
            label="Email Address"
            type="email"
            name="userEmail"
            placeholder="Enter your email"
            value={formData.userEmail}
            onChange={onInputChange}
            errors={errors.userEmail}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            name="userPassword"
            placeholder="Enter your password"
            value={formData.userPassword}
            onChange={onInputChange}
            error={errors.userPassword}
            required
          />

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="small" color="white" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="divider">
            <span>OR</span>
          </div>

          <Button type="button" variant="secondary">
            Continue with Google
          </Button>

          <p className="register-link">
            Don't have an account?
            <Link to="/register">Register</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login;
