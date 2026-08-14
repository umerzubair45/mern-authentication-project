import { useEffect, useState } from "react";

const CallTimer = ({ isRunning }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <span>
      {String(minutes).padStart(2, "0")}:
      {String(remainingSeconds).padStart(2, "0")}
    </span>
  );
};

export default CallTimer;
