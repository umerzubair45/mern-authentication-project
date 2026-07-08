import { useContext, useState } from "react";
import "./login.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ userEmail: "", userPassword: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5051/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        localStorage.setItem("token", result.token);
        login(result.user, result.token);
        navigate("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back 👋</h1>
          <p>Login to continue to your account</p>
        </div>

        <form className="login-form" onSubmit={loginHandler}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <div className="password-box">
              <input
                type="password"
                name="userPassword"
                value={formData.userPassword}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />

              <span className="eye-btn">👁</span>
            </div>
          </div>

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" />
              Remember Me
            </label>

            <a href="/">Forgot Password?</a>
          </div>

          <button>Login</button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-btn">
            Continue with Google
          </button>

          <p className="register-link">
            Don't have an account?
            <a href="/register"> Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
