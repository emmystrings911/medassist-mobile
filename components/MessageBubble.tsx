import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import AudioPlayer from "./AudioPlayer";

export default function MessageBubble({ item, userId }: any) {
  const [sound, setSound] = useState<any>(null);

  // ✅ NEW
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  if (!item || typeof item !== "object") return null;

  const { sender, message, type, status, createdAt, role } = item;

  if (message === undefined || message === null) {
    return null;
  }

  const isSystem = role === "system";

  const isMe =
    !isSystem && sender && userId && sender.toString() === userId.toString();

  const formatTime = (date: any) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (role === "system") {
    return (
      <View
        style={{
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          {message}
        </Text>
      </View>
    );
  }

  if (item.type === "call") {
    return (
      <View
        style={{
          alignSelf: "center",
          backgroundColor: "#1e293b",
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          marginVertical: 10,
        }}
      >
        <Text
          style={{
            color: "#94a3b8",
            fontSize: 13,
            fontStyle: "italic",
          }}
        >
          {item.message}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Animated.View entering={FadeInUp}>
        <View
          style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            marginVertical: 6,
            paddingHorizontal: 10,
            maxWidth: "80%",
          }}
        >
          <View
            style={{
              backgroundColor: isMe ? "#22c55e" : "#1f2937",
              padding: 10,
              borderRadius: 16,
              borderTopRightRadius: isMe ? 4 : 16,
              borderTopLeftRadius: isMe ? 16 : 4,
            }}
          >
            {/* TEXT */}
            {type === "text" && (
              <Text style={{ color: "white", fontSize: 15 }}>{message}</Text>
            )}

            {/* IMAGE */}
            {type === "image" && (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPreviewVisible(true)}
                >
                  <Image
                    source={{ uri: message }}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* ✅ FULLSCREEN IMAGE MODAL */}
                <Modal
                  visible={previewVisible}
                  transparent
                  animationType="fade"
                >
                  <Pressable
                    onPress={() => setPreviewVisible(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.95)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: message }}
                      style={{
                        width: "100%",
                        height: "80%",
                      }}
                      resizeMode="contain"
                    />

                    {/* CLOSE BUTTON */}
                    <TouchableOpacity
                      onPress={() => setPreviewVisible(false)}
                      style={{
                        position: "absolute",
                        top: 50,
                        right: 20,
                        backgroundColor: "#111",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </Pressable>
                </Modal>
              </>
            )}

            {/* AUDIO */}
            {type === "audio" && <AudioPlayer uri={message} />}

            {/* FOOTER */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 10, color: "#e5e7eb" }}>
                {formatTime(createdAt)}
              </Text>

              {isMe && (
                <Text style={{ fontSize: 10, marginTop: 5 }}>
                  {item.status === "sent" && "✓"}
                  {item.status === "delivered" && "✓✓"}
                  {item.status === "seen" && (
                    <Text style={{ color: "#3b82f6" }}>✓✓</Text>
                  )}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
