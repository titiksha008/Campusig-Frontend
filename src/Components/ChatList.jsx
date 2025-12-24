//4.ChatList.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const socketRef = useRef();

  // Fetch chats from API
  const fetchChats = async () => {
    if (!user?._id) return;
    try {
     const res = await api.get(`/chat/user/${user._id}`);
const validChats = res.data.filter(

        (chat) =>
          chat &&
          chat.posterId?.name &&
          chat.posterId?._id &&
          chat.acceptedUserId?.name &&
          chat.acceptedUserId?._id
      );
      setChats(validChats);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    fetchChats();

    // Connect Socket.IO
    socketRef.current = io("http://localhost:5000");

    // Listen for new messages
    socketRef.current.on("newMessage", (msg) => {
      fetchChats();
    });

    // Listen for seen updates
    socketRef.current.on("messageSeenUpdate", () => {
      fetchChats();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user?._id]);

  const handleChatClick = async (chat) => {
    if (!chat?.posterId?._id || !chat?.acceptedUserId?._id) return;

    const otherUser =
      chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

    if (!otherUser?._id) return;

    const otherUserChats = chats.filter(
      (c) =>
        c?.posterId?._id === otherUser._id ||
        c?.acceptedUserId?._id === otherUser._id
    );

    const latestChat = otherUserChats
      .filter((c) => c.messages?.length > 0)
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.createdAt || 0;
        const bLast = b.messages[b.messages.length - 1]?.createdAt || 0;
        return new Date(bLast) - new Date(aLast);
      })[0];

    if (!latestChat || !latestChat.messages?.length) return;

    const latestJobId =
      latestChat.messages[latestChat.messages.length - 1]?.jobId;
    if (!latestJobId) return;

    // --- Mark messages as seen ---
    try {
      await api.post("/chat/mark-seen", {
        posterId: latestChat.posterId._id,
        acceptedUserId: latestChat.acceptedUserId._id,
        jobId: latestJobId,
        viewerId: user._id,
      });

      // Notify other clients via Socket.IO
      const roomId = [
        latestChat.posterId._id,
        latestChat.acceptedUserId._id,
        latestJobId,
      ]
        .sort()
        .join("-");
      socketRef.current.emit("messageSeen", {
        posterId: latestChat.posterId._id,
        acceptedUserId: latestChat.acceptedUserId._id,
        jobId: latestJobId,
        viewerId: user._id,
      });
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
navigate(
  `/chat/${latestChat.posterId._id}/${latestJobId}/${latestChat.acceptedUserId._id}`,
  { state: { posterName: otherUser?.name || "Unknown User" } }
);

  };

  return (
    <div className="chat-list">
      <h2>Chats</h2>
      {!user ? (
        <p>Please log in to see your chats.</p>
      ) : chats.length === 0 ? (
        <p>No chats yet.</p>
      ) : (
        chats.map((chat) => {
          if (!chat?.posterId?._id || !chat?.acceptedUserId?._id) return null;

          const otherUser =
            chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

          if (!otherUser) return null;

          // --- Check for unseen message ---
          const latestMsg =
            chat.messages[chat.messages.length - 1] || null;
          const hasUnseen =
            latestMsg &&
            latestMsg.senderId !== user._id &&
            !latestMsg.seen;

          return (
            <div
              key={chat._id || Math.random()}
              className="chat-item"
              onClick={() => handleChatClick(chat)}
            >
              <strong>{otherUser?.name || "Unknown User"}</strong>
              {hasUnseen && <span style={{ color: "red", marginLeft: "8px" }}>• New Message</span>}
            </div>
          );
        })
      )}
    </div>
  );
}