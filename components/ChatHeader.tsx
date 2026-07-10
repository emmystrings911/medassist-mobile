import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name?: string;
  avatar?: string;
  isOnline?: boolean;
  typingUser?: string | null;
  lastSeen?: string | null;

  // 👇 target user
  userId?: string;

  // 👇 REQUIRED FOR RETURN NAVIGATION
  roomId?: string;
  caregiverId?: string;
  patientId?: string;
};

export default function ChatHeader({
  name = "User",
  avatar,
  isOnline,
  lastSeen,
  typingUser,
  userId,
  roomId,
  caregiverId,
  patientId,
}: Props) {
  const router = useRouter();

  const navigateToCall = (callType: "audio" | "video") => {
    router.push({
      pathname: "/patient/caregiver/callScreen",
      params: {
        targetId: userId,
        isCaller: "true",
        callType,

        // ✅ IMPORTANT
        roomId,
        caregiverId,
        patientId,
      },
    });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 15,
        backgroundColor: "#0f172a",
        borderBottomWidth: 1,
        borderColor: "#1f2937",
      }}
    >
      {/* 🔙 BACK */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text
          style={{
            color: "white",
            fontSize: 22,
            marginRight: 12,
          }}
        >
          ←
        </Text>
      </TouchableOpacity>

      {/* 👤 AVATAR */}
      <Image
        source={{
          uri:
            avatar ||
            "https://ui-avatars.com/api/?name=User&background=22c55e&color=fff",
        }}
        style={{
          width: 45,
          height: 45,
          borderRadius: 22.5,
          marginRight: 12,
        }}
      />

      {/* 🟢 INFO */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "white",
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          {name}
        </Text>

        <Text
          style={{
            color: typingUser ? "#22c55e" : "#94a3b8",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {typingUser
            ? "Typing..."
            : isOnline
              ? "Online"
              : lastSeen
                ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}`
                : "Offline"}
        </Text>
      </View>

      {/* 📞 AUDIO */}
      <TouchableOpacity
        onPress={() => navigateToCall("audio")}
        style={{ marginRight: 15 }}
      >
        <Text style={{ fontSize: 20 }}>📞</Text>
      </TouchableOpacity>

      {/* 🎥 VIDEO */}
      <TouchableOpacity onPress={() => navigateToCall("video")}>
        <Text style={{ fontSize: 20 }}>🎥</Text>
      </TouchableOpacity>
    </View>
  );
}
