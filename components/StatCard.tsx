import { useTheme } from "@/hooks/useTheme";
import { Text, View } from "react-native";

export function StatCard({ label, value, color }: any) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 15,
        borderRadius: 16,
        alignItems: "center",
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", color }}>{value}</Text>
      <Text style={{ color: theme.subText }}>{label}</Text>
    </View>
  );
}
