import "./App.css";
import { Routes, Route } from "react-router-dom";
import Register from "./Register";
import { Toaster } from "react-hot-toast";
import Login from "./Login";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="register" element={<Register />} />;
        <Route path="login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
