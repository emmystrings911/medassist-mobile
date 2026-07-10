import { useSocket } from "@/utils/SocketProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const API_BASE_URL = "http://10.143.246.4:5000/api";

export default function InboxScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouter();

  const loadInbox = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/chats/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data?.data) {
        setChats(data.data);
      }
    } catch (err) {
      console.log("Inbox error:", err);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("inbox_update", loadInbox);

    return () => {
      socket.off("inbox_update", loadInbox);
    };
  }, [socket]);
  const renderItem = ({ item }: any) => {
    const patient = item.patient;
    const last = item.lastMessage;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/caregiver/chat",
            params: {
              roomId: item._id,
              patientId: patient._id,
              patientName: patient.name,
              caregiverId: item.caregiver._id,
            },
          })
        }
        style={{
          padding: 15,
          borderBottomWidth: 1,
          borderColor: "#222",
        }}
      >
        {/* NAME */}
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          {patient.name}
        </Text>

        {/* LAST MESSAGE */}
        <Text style={{ color: "#aaa", marginTop: 4 }}>
          {last?.type === "audio"
            ? "🎤 Voice message"
            : last?.type === "image"
              ? "📷 Image"
              : last?.message || "No messages yet"}
        </Text>

        {/* TIME */}
        <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
          {last?.createdAt ? new Date(last.createdAt).toLocaleTimeString() : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <Text
        style={{
          color: "white",
          fontSize: 22,
          fontWeight: "bold",
          padding: 15,
        }}
      >
        Chats
      </Text>

      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}
