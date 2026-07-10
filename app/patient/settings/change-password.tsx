import { useTheme } from "@/hooks/useTheme";
import { changePassword } from "@/services/user.service";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();

  const handleChange = async () => {
    try {
      if (!oldPassword || !newPassword) {
        return Alert.alert("Error", "All fields are required");
      }

      if (newPassword.length < 8) {
        return Alert.alert("Error", "Password must be at least 8 characters");
      }

      setLoading(true);

      await changePassword({ oldPassword, newPassword });

      Alert.alert("Success", "Password updated");

      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: theme.background,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          color: theme.text,
        }}
      >
        Change Password 🔐
      </Text>

      <Text style={{ color: theme.text }}>Current Password</Text>
      <TextInput
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={{
          backgroundColor: theme.inputBg,
          color: theme.text,
          padding: 12,
          borderRadius: 10,
          marginTop: 5,
        }}
      />

      <Text style={{ marginTop: 15, color: theme.text }}>New Password</Text>
      <TextInput
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={{
          backgroundColor: theme.inputBg,
          color: theme.text,
          padding: 12,
          borderRadius: 10,
          marginTop: 5,
        }}
      />

      <TouchableOpacity
        disabled={loading}
        onPress={handleChange}
        style={{
          backgroundColor: loading ? "#999" : theme.accent,
          padding: 15,
          borderRadius: 10,
          marginTop: 25,
        }}
      >
        <Text style={{ color: theme.buttonText, textAlign: "center" }}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
