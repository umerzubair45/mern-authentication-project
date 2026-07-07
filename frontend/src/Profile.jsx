import { useEffect } from "react";

const Profile = () => {
  async function getProfile() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5051/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log(result.userData.userEmail);
  }
  useEffect(() => {
    getProfile();
  }, []);
  return <div> hi from Profile</div>;
};
export default Profile;
