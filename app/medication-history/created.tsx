import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export default function MedicationCreated() {
  const router = useRouter();

  // Auto-redirect after 1.5s
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(tabs)");
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Check icon */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "#DCFCE7",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 48 }}>✓</Text>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Medication added
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#64748B",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Your medication schedule has been saved successfully.
      </Text>

      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: "#2563EB",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
          Go to Home
        </Text>
      </Pressable>
    </View>
  );
}
