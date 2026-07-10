import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VerifiedScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: "rgba(34,197,94,0.15)" },
        ]}
      >
        <Ionicons name="checkmark-circle" size={70} color={theme.accent} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        Email Verified 🎉
      </Text>

      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Your account has been successfully verified.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>
          Continue to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  iconWrapper: {
    backgroundColor: "rgba(34,197,94,0.15)",
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },

  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
