import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import "./navBar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const logoutHandler = () => {
    logout();
    //navigate("/login");
    navigate("/login", { replace: true });
  };
  return (
    <header className="navbar">
      <div className="container">
        <Link className="logo" to="/">
          MERN<span>Auth</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>

              <Link to="/profile">Profile</Link>
              <p>{user.userName}</p>

              <button className="logout-btn" onClick={logoutHandler}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
