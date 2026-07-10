import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { registerForPushNotifications } from "@/services/push";
import { getProfile, savePushToken, updateProfile, uploadProfileImage } from "@/services/user.service";
import { useSocket } from "@/utils/SocketProvider";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";

export default function CaregiverProfileScreen() {
  const { logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { theme, mode, setThemeMode } = useTheme();
  const { socket } = useSocket();

  useEffect(() => { loadUser(); registerPush(); }, []);

  const loadUser = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
      setName(res.data.name);
      setPhone(res.data.phone || "");
    } catch { /* silent */ }
  };

  const registerPush = async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) await savePushToken(token);
    } catch { /* silent */ }
  };

  const pickImage = async () => {
    if (!isEditing) return;
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
    if (result.canceled) return;
    const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
    try {
      setLoading(true);
      const res = await uploadProfileImage(base64);
      setUser(res.data.user);
      Alert.alert("Success", "Profile image updated");
    } catch { Alert.alert("Error", "Upload failed"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updateProfile({ name, phone });
      setUser(res.data);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch { Alert.alert("Error", "Update failed"); }
    finally { setLoading(false); }
  };

  // FIX FE-11 — Use useAuth().logout() so state + SecureStore + axios header are all cleared
  const handleLogout = async () => {
    socket?.removeAllListeners();
    socket?.disconnect();
    await logout();
    router.replace("/(auth)/login");
  };

  // FIX FE-6 — Use api client (env-var URL) instead of hardcoded IP
  const openChat = async () => {
    try {
      const patients = await api.get("/caregiver/my-patients");
      if (!patients.data.data.length) { alert("No patients linked"); return; }
      const patientId = patients.data.data[0].patient._id;
      const roomData = await api.get(`/chats/room/${patientId}`);
      router.push({
        pathname: "/caregiver/inbox",
        params: { roomId: roomData.data.data._id, patientId, patientName: roomData.data.data.patient.name },
      });
    } catch { /* silent */ }
  };

  if (!user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, alignItems: "center" }]}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: user.avatar || "https://via.placeholder.com/100" }} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
        <Text style={{ color: theme.subText }}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: theme.primarySoft }]}>
          <Text style={{ color: theme.primary, fontSize: 12 }}>{user.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Info</Text>
        <Text style={{ color: theme.subText }}>Name</Text>
        {isEditing
          ? <TextInput value={name} onChangeText={setName} style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]} />
          : <Text style={{ color: theme.text }}>{user.name}</Text>
        }
        <Text style={{ color: theme.subText, marginTop: 10 }}>Phone</Text>
        {isEditing
          ? <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.text, borderColor: theme.border }]} />
          : <Text style={{ color: theme.text }}>{user.phone || "Not set"}</Text>
        }
      </View>

      {isEditing ? (
        <View style={styles.row}>
          <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.buttonText }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.button, { backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border }]}>
            <Text style={{ color: theme.text }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.button, { backgroundColor: theme.accent }]}>
          <Text style={{ color: theme.buttonText }}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity onPress={openChat} style={styles.item}>
          <Text style={{ color: theme.text }}>💬 Chat with Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/patient/settings/change-password")} style={styles.item}>
          <Text style={{ color: theme.text }}>🔐 Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/patient/settings/notifications")} style={styles.item}>
          <Text style={{ color: theme.text }}>🔔 Notification Settings</Text>
        </TouchableOpacity>
        <View style={styles.switchRow}>
          <Text style={{ color: theme.text }}>Theme Mode</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {(["light", "dark", "system"] as const).map((m) => (
              <TouchableOpacity key={m} onPress={() => setThemeMode(m)}>
                <Text style={{ color: mode === m ? theme.accent : theme.subText, textTransform: "capitalize" }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.item}>
          <Text style={{ color: theme.danger }}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "600" },
  roleBadge: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  sectionTitle: { fontWeight: "600", marginBottom: 10 },
  input: { padding: 12, borderRadius: 10, marginTop: 5, borderWidth: 1 },
  button: { padding: 14, borderRadius: 12, alignItems: "center", flex: 1, marginBottom: 20 },
  row: { flexDirection: "row", gap: 10 },
  item: { paddingVertical: 12 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
});
