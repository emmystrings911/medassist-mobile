import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InviteCaregiverScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleInvite = async () => {
    if (!email.trim()) {
      return Alert.alert("Error", "Please enter caregiver email");
    }

    try {
      setLoading(true);

      await api.post("/caregiver/invite", { email });

      Alert.alert("Success", "Invite sent successfully 🎉");
      setEmail("");
    } catch (err: any) {
      console.log("❌ Invite error:", err?.response?.data);

      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to send invite",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
        Invite Caregiver
      </Text>

      <Text style={{ color: theme.subText, marginBottom: 20 }}>
        Enter the email of a caregiver to help monitor medication adherence.
      </Text>

      {/* INPUT CARD */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 14,
          padding: 16,
          shadowColor: theme.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <Text style={{ color: theme.text, marginBottom: 6 }}>
          Caregiver Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. caregiver@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor: theme.inputBg,
            padding: 14,
            borderRadius: 10,
          }}
        />
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleInvite}
        disabled={loading}
        style={{
          backgroundColor: theme.accent,
          padding: 16,
          borderRadius: 12,
          marginTop: 20,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: theme.text,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Send Invite
          </Text>
        )}
      </TouchableOpacity>

      {/* INFO BOX */}
      <View
        style={{
          marginTop: 30,
          backgroundColor: "#E3F2FD",
          padding: 14,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#1565C0", fontSize: 13 }}>
          ℹ️ Caregivers can view adherence, receive alerts, and monitor
          medication usage.
        </Text>
      </View>
    </View>
  );
}
