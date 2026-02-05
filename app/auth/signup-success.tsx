import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SignupSuccess() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text style={{ fontSize: 48 }}>🎉</Text>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 16,
        }}
      >
        Account created!
      </Text>

      <Text
        style={{
          textAlign: "center",
          marginTop: 12,
          color: "#475569",
        }}
      >
        Your account has been successfully set up. You can now start managing
        your medications.
      </Text>

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={{
          marginTop: 32,
          backgroundColor: "#2563EB",
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Go to Dashboard
        </Text>
      </Pressable>
    </View>
  );
}
