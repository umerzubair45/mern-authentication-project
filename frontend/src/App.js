import "./App.css";
import { Routes, Route } from "react-router-dom";
import Register from "./Register";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="register" element={<Register />} />;
      </Routes>
    </>
  );
}

export default App;
