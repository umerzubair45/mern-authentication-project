let peerConnection = null;
let localStream = null;

// ICE candidates can arrive before remoteDescription is set.
// We temporarily store them here.
let pendingIceCandidates = [];

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

/**
 * Create a new WebRTC peer connection
 */
export const createPeerConnection = ({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
}) => {
  // Clean up an old connection if one exists
  if (peerConnection) {
    console.log("🧹 Closing existing peer connection");
    peerConnection.close();
  }

  // Clear candidates from a previous call
  pendingIceCandidates = [];

  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  /**
   * ICE candidate generated locally
   */
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 Local ICE Candidate:", event.candidate);

      onIceCandidate?.(event.candidate);
    }
  };

  /**
   * Remote audio/video track received
   */
  peerConnection.ontrack = (event) => {
    console.log("🔊 Remote track received");

    const [remoteStream] = event.streams;

    if (remoteStream) {
      console.log("🔊 Remote Stream:", remoteStream);

      onTrack?.(remoteStream);
    }
  };

  /**
   * WebRTC connection state
   */
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;

    console.log("🌐 WebRTC Connection State:", state);

    onConnectionStateChange?.(state);
  };

  return peerConnection;
};

/**
 * Get microphone
 */
export const getLocalAudioStream = async () => {
  if (localStream) {
    return localStream;
  }

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  console.log("🎙️ Microphone access granted");
  console.log("🎙️ Local Audio Stream:", localStream);

  return localStream;
};

/**
 * Add local microphone tracks to peer connection
 */
export const addLocalStream = (stream) => {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  console.log("🎙️ Local audio added to peer connection");
};

/**
 * Create WebRTC offer
 */
export const createOffer = async () => {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  console.log("📡 WebRTC Offer Created:", offer);

  return offer;
};

/**
 * Set remote description
 *
 * Used for:
 * - Caller receiving the answer
 * - Receiver receiving the offer
 */
export const setRemoteDescription = async (description) => {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(description),
  );

  console.log("📡 Remote Description Set");

  /**
   * Some ICE candidates may have arrived before
   * the remote description was available.
   *
   * Add those candidates now.
   */
  if (pendingIceCandidates.length > 0) {
    console.log(
      "🧊 Adding queued ICE candidates:",
      pendingIceCandidates.length,
    );

    for (const candidate of pendingIceCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("🧊 Queued ICE Candidate Added");
      } catch (error) {
        console.error("❌ Failed to add queued ICE candidate:", error);
      }
    }

    pendingIceCandidates = [];
  }
};

/**
 * Create WebRTC answer
 */
export const createAnswer = async () => {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  const answer = await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(answer);

  console.log("📡 WebRTC Answer Created:", answer);

  return answer;
};

/**
 * Add remote ICE candidate
 */
export const addIceCandidate = async (candidate) => {
  if (!peerConnection) {
    throw new Error("Peer connection has not been created.");
  }

  /**
   * ICE candidate can arrive before the remote
   * offer/answer has been applied.
   */
  if (!peerConnection.remoteDescription) {
    console.log("⏳ Remote description not ready.");
    console.log("⏳ Queueing ICE candidate.");

    pendingIceCandidates.push(candidate);

    return;
  }

  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

    console.log("🧊 Remote ICE Candidate Added");
  } catch (error) {
    console.error("❌ Failed to add remote ICE candidate:", error);
  }
};

/**
 * Get current peer connection
 */
export const getPeerConnection = () => {
  return peerConnection;
};

/**
 * End WebRTC connection
 */
export const cleanupWebRTC = () => {
  console.log("🧹 Cleaning WebRTC");

  /**
   * Close peer connection
   */
  if (peerConnection) {
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.onconnectionstatechange = null;

    peerConnection.close();
    peerConnection = null;
  }

  /**
   * Stop microphone
   */
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });

    localStream = null;
  }

  /**
   * Clear pending ICE candidates
   */
  pendingIceCandidates = [];
};
