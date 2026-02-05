import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth } from "../../firebase/firebase";

/* ---------- Reusable Info Modal (UNCHANGED) ---------- */
function InfoModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showAbout, setShowAbout] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName ?? "");
      setPhoto(user.photoURL ?? null);
    }
  }, [user]);

  const pickImage = async () => {
    if (!isEditing) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateProfile(user, {
        displayName: name,
        photoURL: photo || undefined,
      });
      Alert.alert("Success", "Profile updated");
      setIsEditing(false);
    } catch {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/signUp");
    } catch {
      Alert.alert("Error", "Failed to log out");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>My Profile</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Pressable onPress={pickImage} style={styles.avatarWrapper}>
          <Image
            source={
              photo
                ? { uri: photo }
                : require("../../assets/images/placeholder.jpeg")
            }
            style={styles.avatar}
          />

          {isEditing && <Text style={styles.changePhoto}>Change photo</Text>}
        </Pressable>

        <Text style={styles.name}>{name || "User"}</Text>
        <Text style={styles.verified}>✔ Verified Member</Text>

        {!isEditing ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </Pressable>
        ) : (
          <>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Full name"
            />

            <TextInput
              value={user?.email ?? ""}
              editable={false}
              style={[
                styles.input,
                { backgroundColor: "#F1F5F9", color: "#6B7280" },
              ]}
            />

            <Pressable
              style={[styles.primaryButton, saving && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsEditing(false);
                setName(user?.displayName ?? "");
                setPhoto(user?.photoURL ?? null);
              }}
            >
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <ProfileRow label="Contact Support" onPress={() => {}} />
        <ProfileRow
          label="Terms of Service"
          onPress={() => setShowTerms(true)}
        />
        <ProfileRow label="Privacy Policy" onPress={() => setShowTerms(true)} />
        <ProfileRow label="About us" onPress={() => setShowAbout(true)} />
        <ProfileRow
          label="Notification Settings"
          onPress={() => router.replace("/settings/notification-sound")}
        />
      </View>

      {/* Back + Logout */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.secondaryButtonText}>Back to home</Text>
      </Pressable>

      <Pressable onPress={handleLogout}>
        <Text style={styles.logout}>Log out</Text>
      </Pressable>

      {/* Modals */}
      <InfoModal
        visible={showAbout}
        title="About MedAssist"
        onClose={() => setShowAbout(false)}
      >
        <Text style={styles.modalText}>
          MedAssist helps you manage medications safely and consistently.
        </Text>
      </InfoModal>

      <InfoModal
        visible={showFaq}
        title="FAQs"
        onClose={() => setShowFaq(false)}
      >
        <Text style={styles.modalText}>
          MedAssist is a support tool and does not replace medical advice.
        </Text>
      </InfoModal>

      <InfoModal
        visible={showTerms}
        title="Terms & Privacy"
        onClose={() => setShowTerms(false)}
      >
        <Text style={styles.modalText}>
          Your data is stored securely and never sold.
        </Text>
      </InfoModal>
    </ScrollView>
  );
}

/* ---------- Reusable Row ---------- */
function ProfileRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

/* ===========================
   STYLES (UI ONLY)
   =========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  verified: {
    fontSize: 13,
    color: "#16A34A",
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  cancel: {
    marginTop: 10,
    color: "#6B7280",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },

  rowText: {
    fontSize: 15,
    color: "#111827",
  },

  arrow: {
    fontSize: 18,
    color: "#9CA3AF",
  },

  secondaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  logout: {
    textAlign: "center",
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 40,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalClose: {
    color: "#2563EB",
    fontWeight: "600",
  },

  modalText: {
    lineHeight: 22,
    fontSize: 14,
  },
  changePhoto: {
    marginTop: 6,
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  avatarWrapper: {
    alignItems: "center",
    padding: 4,
    borderRadius: 60,
    backgroundColor: "#F1F5F9", // subtle outer ring
  },
});
