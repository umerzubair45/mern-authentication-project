import "./FloatingButton.css";

const FloatingButton = ({ onClick }) => {
  return (
    <button className="floating-chat-btn" onClick={onClick}>
      💬
    </button>
  );
};

export default FloatingButton;
