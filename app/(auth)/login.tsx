import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { setupAuthInterceptor } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const { login, logout } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    // FIX FE-15 — Removed console.log({ email, password })
    if (!email || !password) return setError("All fields required");

    try {
      setLoading(true);
      setError("");
      const response = await login(email, password);

      // FIX FE-17 — Wire up 401 interceptor now that we have a logout function
      setupAuthInterceptor(logout);

      // FIX FE-2 — Route based on role, not hardcoded to patient tabs
      const role = response?.user?.role;
      if (role === "caregiver") {
        router.replace("/caregiver/(tabs)");
      } else {
        router.replace("/patient/(tabs)");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View
        style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}
      >
        <Image
          source={require("../../assets/images/icon-logo.png")}
          style={styles.logo}
        />

        <Text style={[styles.title, { color: theme.text }]}>Welcome Back 👋</Text>

        {error ? <Text style={{ color: theme.danger, marginBottom: 10 }}>{error}</Text> : null}

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.subText}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        />

        <View>
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.subText}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.subText} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.rememberContainer} onPress={() => setRemember(!remember)}>
            <View style={[styles.checkbox, { borderColor: theme.border }, remember && { backgroundColor: theme.primary }]}>
              {remember && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.rememberText, { color: theme.subText }]}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password" as any)}>
            <Text style={[styles.forgotText, { color: theme.accent }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.buttonText} />
            : <Text style={{ color: theme.buttonText }}>Login</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={{ color: theme.primary, textAlign: "center", marginTop: 14 }}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { width: 100, height: 80, alignSelf: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { padding: 14, paddingRight: 45, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  button: { padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  eye: { position: "absolute", right: 18, top: 22, transform: [{ translateY: -10 }] },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "center" },
  rememberContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, marginRight: 6, alignItems: "center", justifyContent: "center" },
  rememberText: { fontSize: 13 },
  forgotText: { fontSize: 13, fontWeight: "600" },
});
