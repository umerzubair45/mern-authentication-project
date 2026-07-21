import { useEffect } from "react";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { loading } = useContext(AuthContext);
  console.log(user);
  if (loading) {
    return <h2>Loading...</h2>;
  }
  return (
    <div>
      <h2>Profile</h2>

      {user ? (
        <>
          <p>Name: {user.userName}</p>
          <p>Email: {user.userEmail}</p>
        </>
      ) : (
        <p>No user found</p>
      )}
    </div>
  );
};
export default Profile;
