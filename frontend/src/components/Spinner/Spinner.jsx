import "./Spinner.css";

const Spinner = ({ size = "medium", color = "primary", className = "" }) => {
  return (
    <span
      className={`spinner spinner-${size} spinner-${color} ${className}`}
    ></span>
  );
};

export default Spinner;
