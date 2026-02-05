import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { syncUserWithBackend } from "@/api/auth";
import { auth } from "../../firebase/firebase";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // UI only

  /**
   * ---------------------------
   * GOOGLE AUTH CONFIG
   * ---------------------------
   */
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  /**
   * ---------------------------
   * EMAIL + PASSWORD SIGNUP
   * ---------------------------
   */
  const handleEmailSignup = async () => {
    if (!fullName.trim()) {
      return Alert.alert("Missing name", "Please enter your full name");
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, {
        displayName: fullName.trim(),
      });

      const token = await cred.user.getIdToken();

      await syncUserWithBackend(token, {
        name: fullName.trim(),
        email: cred.user.email,
        provider: "password",
      });

      router.replace("/auth/verify-email");
    } catch (err: any) {
      Alert.alert("Signup error", err.message);
    }
  };

  /**
   * ---------------------------
   * GOOGLE SIGNUP FLOW
   * ---------------------------
   */
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignup();
    }
  }, [response]);

  const handleGoogleSignup = async () => {
    try {
      if (response?.type !== "success") return;

      const idToken = response.params?.id_token;
      if (!idToken) throw new Error("Google token missing");

      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);

      const user = userCred.user;
      const token = await user.getIdToken();

      const name = user.displayName || response?.params?.name || "User";

      await syncUserWithBackend(token, {
        name,
        email: user.email ?? "",
        provider: "google",
      });

      router.replace("/auth/signup-success");
    } catch (err: any) {
      Alert.alert("Google signup failed", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      {/* Full Name */}
      <TextInput
        placeholder="Full name"
        placeholderTextColor="#9CA3AF"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      {/* Email */}
      <TextInput
        placeholder="Email address"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      {/* Password */}
      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, styles.passwordInput]}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEmailSignup}
      >
        <Text style={styles.primaryButtonText}>Create account</Text>
      </TouchableOpacity>

      <Text style={styles.divider}>OR</Text>

      {/* Google Button */}
      <TouchableOpacity
        style={styles.googleButton}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/auth/login")}>
          <Text style={styles.link}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===========================
   STYLES (UI ONLY)
   =========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 180,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 18,
    marginHorizontal: 24,
  },

  passwordWrapper: {
    position: "relative",
    marginHorizontal: 0,
  },

  passwordInput: {
    paddingRight: 60,
  },

  eyeButton: {
    position: "absolute",
    right: 40,
    top: 16,
  },

  eyeText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 24,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  divider: {
    textAlign: "center",
    marginVertical: 22,
    color: "#94A3B8",
    fontSize: 13,
  },

  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 24,
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  footerText: {
    fontSize: 14,
    color: "#64748B",
  },

  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
});
