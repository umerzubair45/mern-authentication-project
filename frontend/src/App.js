import "./App.css";
import { Routes, Route } from "react-router-dom";
import Register from "./Register";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/register" element={<Register />} />;
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
