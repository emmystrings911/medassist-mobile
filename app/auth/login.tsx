import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth } from "../../firebase/firebase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      let message = "Failed to log in";
      if (err.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address";
      }
      Alert.alert("Login error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSubtitle}>
          Log in to continue managing your medications
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
          />

          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggleText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[
            styles.primaryButton,
            loading && { backgroundColor: "#93C5FD" },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Log in</Text>
          )}
        </Pressable>
      </View>

      {/* Footer */}
      <Pressable onPress={() => router.push("/auth/signUp")}>
        <Text style={styles.footerText}>
          Don’t have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}

/* ===========================
   STYLES (UI ONLY)
   =========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 200,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 70,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
    marginBottom: 14,
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },

  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
