import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState({ name: false, email: false, password: false });

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email || !password || !name || !role) return setError("All fields are required");

      // FIX FE-9 — Minimum password length aligned with backend (8, not 6)
      if (password.length < 8) return setError("Password must be at least 8 characters");

      const data = await register(email, password, name, role);

      // FIX FE-2 — registerApi normalises to data directly (no .data.data nesting)
      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email: data.user.email, type: "verify_email" },
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // FIX FE-9 — Strength threshold starts at 8 chars (not 6)
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", color: "#ef4444" };
    if (score === 2) return { label: "Medium", color: "#f59e0b" };
    return { label: "Strong", color: "#22c55e" };
  };

  const strength = getStrength();

  const renderInput = ({
    label, value, onChangeText, icon, secure, field,
  }: {
    label: string; value: string; onChangeText: (t: string) => void;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    secure?: boolean; field: keyof typeof focus;
  }) => {
    const isFocused = focus[field] || !!value;
    return (
      <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: isFocused ? theme.primary : theme.border }]}>
        <Ionicons name={icon} size={20} color={isFocused ? theme.primary : theme.subText} style={styles.icon} />
        <Text style={[styles.label, { color: theme.subText }, isFocused && styles.labelActive, isFocused && { color: theme.primary }]}>
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure ? !showPassword : false}
          style={[styles.input, { color: theme.text }]}
          onFocus={() => setFocus({ ...focus, [field]: true })}
          onBlur={() => setFocus({ ...focus, [field]: false })}
          autoCapitalize={field === "email" ? "none" : "words"}
          keyboardType={field === "email" ? "email-address" : "default"}
        />
        {secure && (
          <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={theme.subText} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/icon-logo.png")} style={styles.logo} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>

        {error ? <Text style={{ color: theme.danger, marginBottom: 10 }}>{error}</Text> : null}

        {renderInput({ label: "Full Name", value: name, onChangeText: setName, icon: "person-outline", field: "name" })}
        {renderInput({ label: "Email", value: email, onChangeText: setEmail, icon: "mail-outline", field: "email" })}
        {renderInput({ label: "Password", value: password, onChangeText: setPassword, icon: "lock-closed-outline", secure: true, field: "password" })}

        {password.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <View style={{ height: 4, borderRadius: 4, backgroundColor: strength.color }} />
            <Text style={{ color: strength.color, marginTop: 4 }}>{strength.label}</Text>
          </View>
        )}

        <View style={[styles.pickerWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Picker selectedValue={role} style={{ color: theme.text }} onValueChange={(v) => setRole(v)}>
            <Picker.Item label="Patient" value="patient" />
            <Picker.Item label="Caregiver" value="caregiver" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={theme.buttonText} />
            : <Text style={{ color: theme.buttonText }}>Register</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={{ color: theme.primary, textAlign: "center" }}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 80 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  inputWrapper: { borderRadius: 12, borderWidth: 1, marginBottom: 16, paddingHorizontal: 40, paddingTop: 18, paddingBottom: 8 },
  input: { fontSize: 16 },
  label: { position: "absolute", left: 40, top: 18, fontSize: 14 },
  labelActive: { top: 6, fontSize: 11 },
  icon: { position: "absolute", left: 12, top: 18 },
  eye: { position: "absolute", right: 12, top: 18 },
  pickerWrapper: { borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 15 },
});
