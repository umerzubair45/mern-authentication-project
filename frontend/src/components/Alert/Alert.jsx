import "./Alert.css";

const Alert = ({ children, variant = "info", className = "" }) => {
  return (
    <div className={`alert alert-${variant} ${className}`}>{children}</div>
  );
};

export default Alert;
