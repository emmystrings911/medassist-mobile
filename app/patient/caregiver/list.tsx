import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export default function CaregiverListScreen() {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const res = await api.get("/caregiver/my-caregivers");
      setCaregivers(res.data.data || []);
    } catch (err) {
      console.log("❌ Fetch caregivers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeCaregiver = async (linkId: string) => {
    Alert.alert(
      "Remove Caregiver",
      "Are you sure you want to remove this caregiver?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingId(linkId);

              await api.delete(`/caregiver/${linkId}`);

              setCaregivers((prev) => prev.filter((c) => c._id !== linkId));

              Alert.alert("Removed", "Caregiver removed successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to remove caregiver");
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      {/* HEADER */}
      <Text style={[title, { color: theme.text }]}>Your Caregivers</Text>

      {/* EMPTY */}
      {caregivers.length === 0 && (
        <View style={center}>
          <Text style={{ color: theme.subText }}>No caregivers added yet</Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={caregivers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              card,
              { backgroundColor: theme.cardBg, shadowColor: theme.shadow },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[name, { color: theme.text }]}>
                {item.caregiver?.name}
              </Text>
              <Text style={[email, { color: theme.subText }]}>
                {item.caregiver?.email}
              </Text>
            </View>

            {/* REMOVE BUTTON */}
            <TouchableOpacity
              onPress={() => removeCaregiver(item._id)}
              disabled={removingId === item._id}
              style={{
                backgroundColor: "#F44336",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: theme.text }}>
                {removingId === item._id ? "..." : "Remove"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

/* 🎨 STYLES */

const center: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
};

const title: TextStyle = {
  fontSize: 24,
  fontWeight: "700",
  marginBottom: 16,
};

const card: ViewStyle = {
  padding: 16,
  borderRadius: 14,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 3,
};

const name: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
};

const email: TextStyle = {
  fontSize: 12,
  marginTop: 4,
};
