import { useEffect } from "react";

const Profile = () => {
  async function getProfile() {
    localStorage.clear();
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5051/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  useEffect(() => {
    getProfile();
  }, []);
  return <div> hi from Profile</div>;
};
export default Profile;
