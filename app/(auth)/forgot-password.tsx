import { useTheme } from "@/hooks/useTheme";
import { forgotPassword } from "@/services/auth.api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async () => {
    if (!email.trim()) return setError("Please enter your email");
    setError("");

    try {
      setLoading(true);
      await forgotPassword({ email: email.trim() });
      // Always navigate — backend returns same response whether email exists or not (anti-enumeration)
      router.push({ pathname: "/(auth)/verify-otp", params: { email: email.trim(), type: "reset_password" } });
    } catch (err: any) {
      // FIX FE-8 — Show actual error (rate limit, network, etc.) instead of silent failure
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Enter your email to receive a verification code
      </Text>

      {error ? <Text style={{ color: theme.danger, marginBottom: 12 }}>{error}</Text> : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.subText}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={theme.buttonText} />
          : <Text style={[styles.buttonText, { color: theme.buttonText }]}>Send OTP</Text>
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
