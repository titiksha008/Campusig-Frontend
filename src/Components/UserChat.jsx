import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import "./UserChat.css";
import { useAuth } from "../context/AuthContext";
import { FaMicrophone, FaStop, FaCheck, FaTimes, FaArrowLeft, FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { FaVideo, FaPhoneSlash } from "react-icons/fa";

export default function UserChat({ currentUserId: propCurrentUserId }) {
  const { posterId, jobId, acceptedUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentUserId = propCurrentUserId || user?._id;
  const { posterName } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationSound = useRef(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordTime, setRecordTime] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatusPopup, setCallStatusPopup] = useState(null);

  const otherUserId = currentUserId === posterId ? acceptedUserId : posterId;
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  const stopCurrentMedia = () => {
    try {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
    } catch (e) {
      console.error("Error stopping previous media:", e);
    }
  };

  useEffect(() => {
    if (!socketRef.current || !otherUserId || !currentUserId) return;
    socketRef.current.emit("userOnline", currentUserId);
    socketRef.current.on("updateUserStatus", (onlineUsers) => {
      setOtherUserOnline(!!onlineUsers[otherUserId]);
    });
    return () => socketRef.current.off("updateUserStatus");
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    if (!posterId || !acceptedUserId || !jobId) return;
    if (socketRef.current) return;

    const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("registerUser", currentUserId);
    socketRef.current.emit("joinRoom", roomId);

    socketRef.current.on("onlineUsers", (onlineUsers) => {
      const isOnline = onlineUsers.includes(otherUserId);
      setOtherUserOnline(isOnline);
      pushNotification(isOnline ? "User is online" : "User went offline");
    });

    socketRef.current.on("callIncoming", ({ from, signal, name }) => {
      setIncomingCall({ from, signal, name });
      pushNotification(`${name || "User"} is calling you`);
    });

    socketRef.current.on("callAccepted", (signal) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socketRef.current.on("callRejected", () => {
      setCallStatusPopup({ message: "Call rejected by the user" });
      setIncomingCall(null);
      endCall(true);
      setTimeout(() => setCallStatusPopup(null), 3000);
    });

    socketRef.current.on("callEnded", () => {
      endCallCleanup();
      setCallStatusPopup({ message: "Call ended" });
      setTimeout(() => setCallStatusPopup(null), 3000);
    });

    socketRef.current.on("iceCandidate", (candidate) => {
      if (candidate && peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    const handleNewMessage = (msg) => {
      if (msg.text || msg.file) setMessages((prev) => [...prev, msg]);
      if (msg.senderId !== currentUserId) pushNotification("New message received");
    };

    socketRef.current.on("newMessage", handleNewMessage);

    return () => {
      socketRef.current.emit("leaveRoom", roomId);
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [posterId, acceptedUserId, jobId, currentUserId]);

  useEffect(() => {
    if (!posterId || !acceptedUserId || !jobId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${posterId}/${jobId}/${acceptedUserId}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [posterId, acceptedUserId, jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => setNewMsg(e.target.value);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const msgData = { posterId, acceptedUserId, jobId, senderId: currentUserId, text: newMsg.trim(), file: "", fileType: "" };
    setNewMsg("");
    socketRef.current.emit("sendMessage", msgData);
  };

  const handleEmojiClick = (emojiObject) => setNewMsg((prev) => prev + (emojiObject?.emoji || ""));
  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  // Voice Recording — unchanged
  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];
      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        clearInterval(timerRef.current);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Microphone in use or permission denied.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    setRecording(false);
    clearInterval(timerRef.current);
    mediaRecorder.stop();
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecording(false);
    clearInterval(timerRef.current);
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/chat/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

      const msgData = {
        posterId,
        acceptedUserId,
        jobId,
        senderId: currentUserId,
        file: res.data.url,
        fileType: "audio",
        text: ""
      };

      socketRef.current.emit("sendMessage", msgData);
      setAudioBlob(null);
    } catch (err) {
      console.error("Voice upload failed", err);
    }
  };

  const endCallCleanup = () => {
    try {
      stopCurrentMedia();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject = null;
      }
    } catch (e) {}
    setInCall(false);
    setIncomingCall(null);
  };

  const startVideoCall = async () => {
    try {
      stopCurrentMedia();

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;
      setInCall(true);

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      pc.ontrack = (e) => (remoteVideoRef.current.srcObject = e.streams[0]);

      pc.onicecandidate = (e) => {
        if (e.candidate) socketRef.current.emit("iceCandidate", { candidate: e.candidate, to: otherUserId });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("callUser", { userToCall: otherUserId, signal: offer, from: currentUserId, name: user?.name || "User" });
    } catch (err) {
      console.error("startVideoCall error:", err);
      endCallCleanup();
    }
  };

  const endCall = (remote = false) => {
    if (!remote) socketRef.current.emit("endCall", { from: currentUserId, to: otherUserId });
    endCallCleanup();
    setCallStatusPopup({ message: "Call Ended" });
    setTimeout(() => setCallStatusPopup(null), 3000);
  };

  const acceptCall = async () => {
    try {
      stopCurrentMedia();
      setInCall(true);
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      pc.ontrack = (e) => (remoteVideoRef.current.srcObject = e.streams[0]);

      pc.onicecandidate = (e) => {
        if (e.candidate) socketRef.current.emit("iceCandidate", { candidate: e.candidate, to: incomingCall.from });
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("answerCall", { signal: answer, to: incomingCall.from });
      setIncomingCall(null);
    } catch (err) {
      console.error("acceptCall error:", err);
      endCallCleanup();
    }
  };

  const rejectCall = () => {
    socketRef.current.emit("rejectCall", { to: incomingCall.from });
    setIncomingCall(null);
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      if (socketRef.current) socketRef.current.emit("endCall", { from: currentUserId, to: otherUserId });
      endCallCleanup();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [currentUserId, otherUserId]);

  const renderMessage = (m) => {
    if (m.text) return <span>{m.text}</span>;
    if (m.fileType === "image") return <img src={m.file} alt="sent" className="chat-file" />;
    if (m.fileType === "video") return <video src={m.file} controls className="chat-file" />;
    if (m.fileType === "audio" && m.file) return <audio controls src={m.file} />;
    return null;
  };

  const pushNotification = (text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);
    try {
      notificationSound.current?.play();
    } catch {}
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3000);
  };

  return (
    <div className="user-chat">
      {callStatusPopup && <div className="call-status-popup"><p>{callStatusPopup.message}</p></div>}

      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <div className="user-info">
          <span className="username">{posterName || otherUserId}</span>
          <span className={`user-status ${otherUserOnline ? "online" : "offline"}`}>
            {otherUserOnline ? "Online" : "Offline"}
          </span>
        </div>
        {inCall ? (
          <button className="end-btn" onClick={() => endCall(false)}><FaPhoneSlash /></button>
        ) : (
          <button className="video-btn" onClick={startVideoCall}><FaVideo /></button>
        )}
      </div>

      <div className="chat-body">
        {messages.map((m, idx) => {
          const uniqueKey = m._id || `${m.senderId}-${m.createdAt || m.time || Date.now()}-${idx}`;
          return (
            <div key={uniqueKey} className={`chat-msg-wrapper ${m.senderId === currentUserId ? "me-wrapper" : "them-wrapper"}`}>
              <div className={`chat-msg ${m.senderId === currentUserId ? "me" : "them"}`}>
                {renderMessage(m)}
              </div>

              {m.senderId === currentUserId && m.seen && idx === messages.length - 1 && (
                <div className="seen-label-below">Seen</div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {inCall && (
        <div className="video-call-container">
          <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        </div>
      )}

      <div className="chat-input">
        <div className="input-row">
          <input
            type="text"
            value={newMsg}
            onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="emoji-btn" onClick={toggleEmojiPicker}><FaSmile /></button>
          <button className="send-btn" onClick={handleSend}><FaPaperPlane /></button>

          {!recording && <button className="record-btn" onClick={startRecording}><FaMicrophone /></button>}
          {recording && <button className="stop-btn" onClick={stopRecording}><FaStop /> ({recordTime}s)</button>}
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-wrapper">
            <button className="close-emoji-btn" onClick={toggleEmojiPicker}>×</button>
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        )}

        {audioBlob && (
          <div className="voice-preview">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <button className="send-audio-btn" onClick={sendAudio}><FaCheck /></button>
            <button className="cancel-audio-btn" onClick={cancelRecording}><FaTimes /></button>
          </div>
        )}
      </div>

      {incomingCall && !inCall && (
        <div className="incoming-call-popup">
          <p>{incomingCall.name || "Someone"} is calling...</p>
          <div className="popup-buttons">
            <button className="accept-btn" onClick={acceptCall}><FaCheck /></button>
            <button className="reject-btn" onClick={rejectCall}><FaTimes /></button>
          </div>
        </div>
      )}

      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className="notification-toast">
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
