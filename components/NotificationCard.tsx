import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function NotificationCard({ item, onRead }: any) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => !item.read && onRead(item._id)}
      style={{
        backgroundColor: item.read ? theme.surface : theme.surfaceElevated,
        padding: 15,
        borderRadius: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Ionicons
        name={getIcon(item.type)}
        size={22}
        color={theme.primary}
        style={{ marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", color: theme.text }}>
          {item.title}
        </Text>

        <Text style={{ color: theme.subText, marginTop: 4 }}>{item.body}</Text>
      </View>

      {!item.read && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.primary,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "dose":
      return "time";
    case "missed":
      return "alert-circle";
    case "caregiver_alert":
      return "warning";
    case "chat":
      return "chatbubble";
    default:
      return "notifications";
  }
}
