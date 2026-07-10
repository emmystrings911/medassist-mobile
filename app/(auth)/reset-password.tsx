import { useTheme } from "@/hooks/useTheme";
import { resetPassword } from "@/services/auth.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { theme } = useTheme();
  const { email } = useLocalSearchParams();
  const emailString = Array.isArray(email) ? email[0] : email;

  const handleReset = async () => {
    // FIX FE-9 — Minimum 8 chars (backend enforces same)
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");

    try {
      setLoading(true);
      await resetPassword({ email: emailString, newPassword: password });
      router.replace("/(auth)/login");
    } catch (err: any) {
      // FIX FE-8 — Show error instead of silent failure
      setError(err?.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Set New Password</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>Enter your new password below</Text>

      {error ? <Text style={{ color: theme.danger, marginBottom: 12 }}>{error}</Text> : null}

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="New Password (min 8 characters)"
        placeholderTextColor={theme.subText}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
      />

      <TextInput
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Confirm New Password"
        placeholderTextColor={theme.subText}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={theme.buttonText} />
          : <Text style={[styles.buttonText, { color: theme.buttonText }]}>Reset Password</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { marginBottom: 20 },
  input: { padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  button: { padding: 15, borderRadius: 12, alignItems: "center" },
  buttonText: { fontWeight: "600" },
});
