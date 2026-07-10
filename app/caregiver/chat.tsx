import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import { useSocket } from "@/utils/SocketProvider";
import { uploadToCloudinary } from "@/utils/upload";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Message = {
  _id?: string;
  sender: string;
  role: "patient" | "caregiver" | "system";
  message: string;
  type: "text" | "image" | "audio" | "file" | "call";
  status?: "sent" | "delivered" | "seen";
  createdAt?: string;

  replyTo?: any;
  clientId?: string;
};

const API_BASE_URL = "http://10.143.246.4:5000/api";

export default function ChatScreen() {
  const params = useLocalSearchParams();

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;

  const caregiverId = Array.isArray(params.caregiverId)
    ? params.caregiverId[0]
    : params.caregiverId;

  const patientId = Array.isArray(params.patientId)
    ? params.patientId[0]
    : params.patientId;

  const patientName = Array.isArray(params.patientName)
    ? params.patientName[0]
    : params.patientName;

  const { socket } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [chatUser, setChatUser] = useState<any>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const flatListRef = useRef<any>(null);

  // =========================
  // ✅ LOAD USER
  // =========================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) return;

        const decoded: any = jwtDecode(token);

        setUserId(decoded.id);
      } catch (err) {
        console.log("❌ Token decode error:", err);
      }
    };

    loadUser();
  }, []);

  // =========================
  // ✅ LOAD MESSAGES
  // =========================
  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/chats/messages/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?.data) {
        setMessages(data.data);
      }
    } catch (err) {
      console.log("❌ Load messages error:", err);
    }
  };

  // =========================
  // ✅ LOAD ROOM
  // =========================
  const loadRoom = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/chats/room/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?.data) {
        const otherUser =
          data.data.caregiver?._id === userId
            ? data.data.patient
            : data.data.caregiver;

        setChatUser(otherUser);
      }
    } catch (err) {
      console.log("❌ Load room error:", err);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadRoom();
    }
  }, [patientId]);

  // =========================
  // ✅ SOCKET
  // =========================

  useEffect(() => {
    if (!socket || !socket.connected || !roomId || !userId) {
      console.log("⏳ Waiting for socket connection...");
      return;
    }

    console.log("🟢 Using global socket:", socket.id);

    // ✅ JOIN USER + ROOM
    socket.emit("join", userId);

    socket.emit("join_room", roomId);

    console.log("✅ Joined user + room:", {
      userId,
      roomId,
    });

    // =========================
    // 💬 RECEIVE MESSAGE
    // =========================
    const handleReceiveMessage = (msg: any) => {
      console.log("📩 RECEIVE MESSAGE:", msg);

      if (!msg || typeof msg !== "object") return;

      if (!msg.message && msg.role !== "system") return;

      const cleanMsg: Message = {
        _id: msg._id || msg.clientId || Date.now().toString(),
        sender: msg.sender ?? "",
        message: msg.message ?? "",
        type: msg.type || "text",
        role: msg.role || "caregiver",
        status: msg.status || "sent",
        createdAt: msg.createdAt,
        replyTo: msg.replyTo,
        clientId: msg.clientId,
      };

      setMessages((prev) => {
        const index = prev.findIndex(
          (m) => m.clientId && msg.clientId && m.clientId === msg.clientId,
        );

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = cleanMsg;
          return updated;
        }

        const exists = prev.some((m) => m._id === cleanMsg._id);

        if (exists) return prev;

        return [...prev, cleanMsg];
      });
    };

    // =========================
    // 👀 STATUS
    // =========================
    const handleMessageStatus = ({ id, status }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status } : m)),
      );
    };

    const handleBulkStatus = ({ status }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.sender !== userId ? { ...m, status } : m)),
      );
    };

    // =========================
    // 🟢 ONLINE
    // =========================
    const handleUserOnline = ({ userId: id }: any) => {
      console.log("🟢 USER ONLINE:", id);

      if (id === patientId) {
        setIsOnline(true);
        setLastSeen(null);
      }
    };

    const handleUserOffline = ({ userId: id, lastSeen }: any) => {
      console.log("🔴 USER OFFLINE:", id);

      if (id === patientId) {
        setIsOnline(false);
        setLastSeen(lastSeen);
      }
    };

    // =========================
    // ✍️ TYPING
    // =========================
    const handleTypingEvent = ({ from }: any) => {
      setTypingUser(from);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    // =========================
    // 📞 CALL EVENTS
    // =========================
    const handleIncomingCall = (data: any) => {
      console.log("📞 incoming_call:", data);
    };

    const handleCallAnswered = (data: any) => {
      console.log("✅ call_answered:", data);
    };

    const handleCallEnded = () => {
      console.log("❌ call_ended");
    };

    const handleMissedCall = (data: any) => {
      console.log("📵 missed_call:", data);
    };

    // REGISTER EVENTS
    socket.on("receive_message", handleReceiveMessage);

    socket.on("message_status", handleMessageStatus);

    socket.on("message_status_bulk", handleBulkStatus);

    socket.on("user_online", handleUserOnline);

    socket.on("user_offline", handleUserOffline);

    socket.on("typing", handleTypingEvent);

    socket.on("stop_typing", handleStopTyping);

    socket.on("incoming_call", handleIncomingCall);

    socket.on("call_answered", handleCallAnswered);

    socket.on("call_ended", handleCallEnded);

    socket.on("missed_call", handleMissedCall);

    // CLEANUP
    return () => {
      socket.off("receive_message", handleReceiveMessage);

      socket.off("message_status", handleMessageStatus);

      socket.off("message_status_bulk", handleBulkStatus);

      socket.off("user_online", handleUserOnline);

      socket.off("user_offline", handleUserOffline);

      socket.off("typing", handleTypingEvent);

      socket.off("stop_typing", handleStopTyping);

      socket.off("incoming_call", handleIncomingCall);

      socket.off("call_answered", handleCallAnswered);

      socket.off("call_ended", handleCallEnded);

      socket.off("missed_call", handleMissedCall);
    };
  }, [socket, roomId, userId]);
  // =========================
  // ✅ LOAD INITIAL MESSAGES
  // =========================
  useEffect(() => {
    if (roomId) {
      loadMessages();
    }
  }, [roomId]);

  // =========================
  // ✅ AUTO SCROLL
  // =========================
  useEffect(() => {
    flatListRef.current?.scrollToEnd({
      animated: true,
    });
  }, [messages]);

  // =========================
  // ✅ MARK SEEN
  // =========================
  useEffect(() => {
    if (!messages.length) return;

    messages.forEach((msg) => {
      if (msg.sender !== userId && msg.status !== "seen") {
        socket?.emit("mark_seen", {
          roomId,
        });
      }
    });
  }, [messages]);

  // =========================
  // ⏳ LOADING
  // =========================
  if (!roomId || !userId) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111",
        }}
      >
        <Text style={{ color: "white" }}>Loading chat...</Text>
      </View>
    );
  }

  // =========================
  // 🆔 CLIENT ID
  // =========================
  const generateClientId = () =>
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // =========================
  // ✅ SEND TEXT
  // =========================
  const sendText = () => {
    if (!text.trim() || !userId) return;

    const clientId = generateClientId();

    const tempMessage: Message = {
      _id: clientId,
      sender: userId,
      role: "caregiver",
      message: text,
      type: "text",
      status: "sent",
      createdAt: new Date().toISOString(),
      replyTo: replyingTo,
      clientId,
    };

    setMessages((prev) => [...prev, tempMessage]);

    console.log("📤 Sending message");

    socket?.emit("send_message", {
      roomId,
      message: text,
      type: "text",
      clientId,
      replyTo: replyingTo,
    });

    setText("");
    setReplyingTo(null);
  };

  // =========================
  // 🖼️ SEND IMAGE
  // =========================
  const sendImage = async (uri: string) => {
    const url = await uploadToCloudinary(uri, "image");
    const clientId = generateClientId();

    socket?.emit("send_message", {
      roomId,
      message: url,
      type: "image",
      clientId,
      replyTo: replyingTo,
    });
  };

  // =========================
  // 📎 SEND FILE
  // =========================
  const sendFile = async (file: any) => {
    const url = await uploadToCloudinary(file.uri, "raw");
    const clientId = generateClientId();

    socket?.emit("send_message", {
      roomId,
      message: url,
      type: "file",
      clientId,
      replyTo: replyingTo,
    });
  };

  // =========================
  // 🎤 SEND AUDIO
  // =========================
  const sendAudio = async (uri: string) => {
    const url = await uploadToCloudinary(uri, "video");

    socket?.emit("send_message", {
      roomId,
      message: url,
      type: "audio",
      clientId: generateClientId(),
      replyTo: replyingTo,
    });
  };

  // =========================
  // ✍️ TYPING
  // =========================
  const handleTyping = (value: string) => {
    setText(value);

    socket?.emit("typing", {
      roomId,
      from: userId,
    });

    setTimeout(() => {
      socket?.emit("stop_typing", {
        roomId,
        from: userId,
      });
    }, 1000);
  };

  // =========================
  // ↩️ SWIPE TO REPLY
  // =========================
  const renderItem = ({ item }: any) => {
    let startX = 0;

    return (
      <View
        onTouchStart={(e) => {
          startX = e.nativeEvent.pageX;
        }}
        onTouchEnd={(e) => {
          const diff = e.nativeEvent.pageX - startX;

          if (diff > 50) {
            setReplyingTo({
              ...item,

              senderName:
                item.sender === caregiverId ? "You" : chatUser?.name || "User",
            });
          }
        }}
        style={{ flex: 1 }}
      >
        <MessageBubble item={item} userId={userId} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ChatHeader
            name={patientName || "Patient"}
            isOnline={isOnline}
            typingUser={typingUser}
            lastSeen={lastSeen}
            userId={patientId}
            roomId={roomId}
            caregiverId={caregiverId}
            patientId={patientId || userId}
          />

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item?._id || index.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={loadMessages}
                tintColor="#fff"
              />
            }
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 20,
            }}
          />

          <ChatInput
            text={text}
            setText={setText}
            onSend={sendText}
            onImage={sendImage}
            onAudio={sendAudio}
            onFile={sendFile}
            onTyping={handleTyping}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
