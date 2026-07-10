import { Text, View } from "react-native";

export function EmptyState() {
  return (
    <View
      style={{
        alignItems: "center",
        marginTop: 40,
      }}
    >
      <Text style={{ fontSize: 40 }}>🎉</Text>
      <Text style={{ marginTop: 10, color: "#666" }}>
        No medications for today
      </Text>
    </View>
  );
}
