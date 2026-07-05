import { useState } from "react";
import "./register.css";
import toast from "react-hot-toast";
const Register = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setuserConfirmPassword] = useState("");

  const userNameChange = (e) => {
    setUserName(e.target.value);
  };
  const userEmailChange = (e) => {
    setUserEmail(e.target.value);
  };
  const userPasswordChange = (e) => {
    setUserPassword(e.target.value);
  };
  const userConfirmPasswordChange = (e) => {
    setuserConfirmPassword(e.target.value);
  };

  const formHandler = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5051/register", {
      method: "POST",
      body: JSON.stringify({
        userName,
        userEmail,
        userPassword,
        userConfirmPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (response.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    console.log(result.message);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Join us today! It's quick and easy.</p>

        <form className="register-form" onSubmit={formHandler}>
          <input
            onChange={userNameChange}
            type="text"
            placeholder="User Name"
            required
          />

          <input
            onChange={userEmailChange}
            type="email"
            placeholder="Email Address"
            required
          />

          <input
            onChange={userPasswordChange}
            type="password"
            placeholder="Password"
            required
          />

          <input
            onChange={userConfirmPasswordChange}
            type="password"
            placeholder="Confirm Password"
            required
          />
          {userConfirmPassword.length > 0 &&
            (userPassword === userConfirmPassword ? (
              <p className="success">✓ Passwords match</p>
            ) : (
              <p className="error">✗ Passwords do not match</p>
            ))}

          <button type="submit">Create Account</button>
        </form>

        <div className="login-link">
          Already have an account?
          <a href="/login"> Login</a>
        </div>
      </div>
    </div>
  );
};
export default Register;
