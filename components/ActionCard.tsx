import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

export function ActionCard({ title, icon, onPress }: any) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 15,
        borderRadius: 16,
        elevation: 3,
      }}
    >
      <Ionicons name={icon} size={28} color="#4CAF50" />
      <Text style={{ color: theme.text, marginTop: 10, fontWeight: "600" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
