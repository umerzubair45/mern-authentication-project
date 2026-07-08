import { useNavigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import { useContext } from "react";
const Dashboard = () => {
  const { loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const clickBtn = () => {
    navigate("/profile");
  };
  return (
    <div>{loading ? "" : <button onClick={clickBtn}>click me</button>}</div>
  );
};
export default Dashboard;
