import { useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebase/firebase";

export default function VerifyEmail() {
  console.log("Verify-email hit");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const checkVerification = async () => {
    try {
      setLoading(true);

      // 🔥 IMPORTANT: refresh Firebase user
      await auth.currentUser?.reload();

      if (auth.currentUser?.emailVerified) {
        router.replace("/auth/signup-success");
      } else {
        Alert.alert(
          "Not verified yet",
          "Please check your email and click the verification link.",
        );
      }
    } catch (err) {
      Alert.alert("Error", "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser!);
      Alert.alert("Email sent", "Verification email resent.");
    } catch (err) {
      Alert.alert("Error", "Could not resend email.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We’ve sent a verification link to your email address. Please verify your
        email to continue using MedAssist.
      </Text>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Almost there 🎉</Text>
        <Text style={styles.cardText}>
          Open your email inbox and click the verification link we sent you.
          After that, come back here and continue.
        </Text>
      </View>

      {/* Actions */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={checkVerification}
          >
            <Text style={styles.primaryButtonText}>I’ve verified my email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resendVerification}
          >
            <Text style={styles.secondaryButtonText}>
              Resend verification email
            </Text>
          </TouchableOpacity>
        </>
      )}
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
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 32,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
});
