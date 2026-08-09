import {
  startAudioCall,
  acceptAudioCall,
  rejectAudioCall,
  endAudioCall,
} from "../socket/emitEvents";

const createCallService = () => {
  const startCall = (receiverId, callId) => {
    startAudioCall({
      receiverId,
      callId,
    });
  };

  const acceptCall = (callId, callerId) => {
    acceptAudioCall({
      callId,
      callerId,
    });
  };

  const rejectCall = (callId, callerId) => {
    rejectAudioCall({
      callId,
      callerId,
    });
  };

  const endCall = (callId, receiverId) => {
    endAudioCall({
      callId,
      receiverId,
    });
  };

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};

export default createCallService;
