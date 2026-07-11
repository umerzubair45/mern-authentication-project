import "./Input.css";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Input = ({ label, error = "", className = "", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    props.type === "password"
      ? showPassword
        ? "text"
        : "password"
      : props.type;
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={props.id} className="input-label">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        <input {...props} type={inputType} className={`input ${className}`} />

        {props.type === "password" && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {error && <small className="input-error">{error}</small>}
    </div>
  );
};

export default Input;
