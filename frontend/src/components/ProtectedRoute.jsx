import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Still checking authentication
  if (loading) {
    return <h2>Loading...</h2>;
  }

  // Authentication check finished, but no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  //console.log(children);
  // User is authenticated
  return children;
};

export default ProtectedRoute;
