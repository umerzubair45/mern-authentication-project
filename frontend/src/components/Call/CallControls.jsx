import {
  FiMic,
  FiMicOff,
  FiPhoneOff,
  FiVideo,
  FiVolume2,
} from "react-icons/fi";

const CallControls = ({ isMuted, onMute, onSpeaker, onVideo, onEnd }) => {
  return (
    <div className="call-controls">
      <button
        type="button"
        className={`call-control ${isMuted ? "active" : ""}`}
        onClick={onMute}
      >
        {isMuted ? <FiMicOff /> : <FiMic />}
        <span>{isMuted ? "Unmute" : "Mute"}</span>
      </button>

      <button type="button" className="call-control" onClick={onSpeaker}>
        <FiVolume2 />
        <span>Speaker</span>
      </button>

      <button type="button" className="call-control" onClick={onVideo}>
        <FiVideo />
        <span>Video</span>
      </button>

      <button type="button" className="call-control call-end" onClick={onEnd}>
        <FiPhoneOff />
        <span>End</span>
      </button>
    </div>
  );
};

export default CallControls;
