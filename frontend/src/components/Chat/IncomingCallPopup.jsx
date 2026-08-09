import { FiPhone, FiPhoneOff } from "react-icons/fi";

import Button from "../Button/Button";

import "./IncomingCallPopup.css";

const IncomingCallPopup = ({ call, onAccept, onReject }) => {
  if (!call) {
    return null;
  }

  const callerName = call.caller?.userName || call.callerName || "Unknown User";

  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-popup">
        <div className="incoming-call-icon">
          <FiPhone />
        </div>

        <div className="incoming-call-label">Incoming Voice Call</div>

        <div className="incoming-call-avatar">
          {callerName.charAt(0).toUpperCase()}
        </div>

        <h3 className="incoming-call-name">{callerName}</h3>

        <p className="incoming-call-text">wants to talk with you</p>

        <div className="incoming-call-actions">
          <Button
            type="button"
            variant="secondary"
            className="incoming-call-reject"
            onClick={onReject}
            title="Reject call"
          >
            <FiPhoneOff />
            <span>Decline</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            className="incoming-call-accept"
            onClick={onAccept}
            title="Accept call"
          >
            <FiPhone />
            <span>Accept</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;
