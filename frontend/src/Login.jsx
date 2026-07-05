import "./login.css";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back 👋</h1>
          <p>Login to continue to your account</p>
        </div>

        <form className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="input-group">
            <label>Password</label>

            <div className="password-box">
              <input type="password" placeholder="Enter password" />

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
