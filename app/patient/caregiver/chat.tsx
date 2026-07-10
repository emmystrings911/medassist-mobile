import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { useSocket } from "@/utils/SocketProvider";
import { uploadToCloudinary } from "@/utils/upload";
import { useLocalSearchParams } from "expo-router";
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

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const caregiverId = Array.isArray(params.caregiverId) ? params.caregiverId[0] : params.caregiverId;
  const patientId = Array.isArray(params.patientId) ? params.patientId[0] : params.patientId;

  const { socket } = useSocket();
  // FIX FE-5 — Get userId from AuthContext instead of decoding JWT client-side
  const { user } = useAuth();
  const userId = user?._id ?? user?.id ?? null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [chatUser, setChatUser] = useState<any>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const flatListRef = useRef<any>(null);

  // FIX FE-6 — Use api client (env-var URL) instead of hardcoded API_BASE_URL
  const loadMessages = async () => {
    try {
      const res = await api.get(`/chats/messages/${roomId}`);
      if (res.data?.data) setMessages(res.data.data);
    } catch {
      // FIX FE-15 — Removed console.log
    }
  };

  const loadRoom = async () => {
    try {
      const res = await api.get(`/chats/room/${caregiverId}`);
      if (res.data?.data) {
        const otherUser =
          res.data.data.caregiver?._id === userId
            ? res.data.data.patient
            : res.data.data.caregiver;
        setChatUser(otherUser);
      }
    } catch {
      // FIX FE-15 — Removed console.log
    }
  };

  useEffect(() => { if (caregiverId) loadRoom(); }, [caregiverId]);
  useEffect(() => { if (roomId) loadMessages(); }, [roomId]);
  useEffect(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  // Socket event wiring
  useEffect(() => {
    if (!socket?.connected || !roomId || !userId) return;

    // FIX FE-7 — "join" no longer sends userId (server uses JWT); just join the room
    socket.emit("join_room", roomId);

    const handleReceiveMessage = (msg: any) => {
      if (!msg || typeof msg !== "object") return;
      if (!msg.message && msg.role !== "system") return;

      const cleanMsg: Message = {
        _id: msg._id || msg.clientId || Date.now().toString(),
        sender: msg.sender ?? "",
        message: msg.message ?? "",
        type: msg.type || "text",
        role: msg.role || "patient",
        status: msg.status || "sent",
        createdAt: msg.createdAt,
        replyTo: msg.replyTo,
        clientId: msg.clientId,
      };

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.clientId && msg.clientId && m.clientId === msg.clientId);
        if (idx !== -1) { const u = [...prev]; u[idx] = cleanMsg; return u; }
        if (prev.some((m) => m._id === cleanMsg._id)) return prev;
        return [...prev, cleanMsg];
      });
    };

    const handleMessageStatus = ({ id, status }: any) =>
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));

    const handleBulkStatus = ({ status }: any) =>
      setMessages((prev) => prev.map((m) => (m.sender !== userId ? { ...m, status } : m)));

    const handleUserOnline = ({ userId: id }: any) => {
      if (id === caregiverId) { setIsOnline(true); setLastSeen(null); }
    };
    const handleUserOffline = ({ userId: id, lastSeen }: any) => {
      if (id === caregiverId) { setIsOnline(false); setLastSeen(lastSeen); }
    };
    const handleTypingEvent = ({ from }: any) => setTypingUser(from);
    const handleStopTyping = () => setTypingUser(null);

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_status", handleMessageStatus);
    socket.on("message_status_bulk", handleBulkStatus);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("typing", handleTypingEvent);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_status", handleMessageStatus);
      socket.off("message_status_bulk", handleBulkStatus);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("typing", handleTypingEvent);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [socket, roomId, userId]);

  // FIX FE-14 — Emit mark_seen once per batch of messages, not once per message
  useEffect(() => {
    if (!messages.length || !socket) return;
    const hasUnseen = messages.some((m) => m.sender !== userId && m.status !== "seen");
    if (hasUnseen) socket.emit("mark_seen", { roomId });
  }, [messages]);

  if (!roomId || !userId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" }}>
        <Text style={{ color: "white" }}>Loading chat...</Text>
      </View>
    );
  }

  const generateClientId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const sendText = () => {
    if (!text.trim() || !userId) return;
    const clientId = generateClientId();
    const tempMessage: Message = {
      _id: clientId, sender: userId, role: "patient",
      message: text, type: "text", status: "sent",
      createdAt: new Date().toISOString(), replyTo: replyingTo, clientId,
    };
    setMessages((prev) => [...prev, tempMessage]);
    // FIX FE-15 — Removed console.log("📤 Sending message")
    socket?.emit("send_message", { roomId, message: text, type: "text", clientId, replyTo: replyingTo });
    setText("");
    setReplyingTo(null);
  };

  const sendImage = async (uri: string) => {
    const url = await uploadToCloudinary(uri, "image");
    socket?.emit("send_message", { roomId, message: url, type: "image", clientId: generateClientId(), replyTo: replyingTo });
  };

  const sendFile = async (file: any) => {
    const url = await uploadToCloudinary(file.uri, "raw");
    socket?.emit("send_message", { roomId, message: url, type: "file", clientId: generateClientId(), replyTo: replyingTo });
  };

  const sendAudio = async (uri: string) => {
    const url = await uploadToCloudinary(uri, "video");
    socket?.emit("send_message", { roomId, message: url, type: "audio", clientId: generateClientId(), replyTo: replyingTo });
  };

  const handleTyping = (value: string) => {
    setText(value);
    socket?.emit("typing", { roomId });
    setTimeout(() => socket?.emit("stop_typing", { roomId }), 1000);
  };

  const renderItem = ({ item }: any) => {
    let startX = 0;
    return (
      <View
        onTouchStart={(e) => { startX = e.nativeEvent.pageX; }}
        onTouchEnd={(e) => {
          if (e.nativeEvent.pageX - startX > 50) {
            setReplyingTo({ ...item, senderName: item.sender === userId ? "You" : chatUser?.name || "User" });
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
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ChatHeader
            name={chatUser?.name || "Caregiver"}
            isOnline={isOnline}
            typingUser={typingUser}
            lastSeen={lastSeen}
            userId={caregiverId}
            roomId={roomId}
            caregiverId={caregiverId}
            patientId={patientId || userId}
          />
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item?._id || index.toString()}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={false} onRefresh={loadMessages} tintColor="#fff" />}
            contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
          />
          <ChatInput
            text={text} setText={setText} onSend={sendText}
            onImage={sendImage} onAudio={sendAudio} onFile={sendFile}
            onTyping={handleTyping} replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
