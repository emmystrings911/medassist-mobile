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

export default function PendingInvitesScreen() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await api.get("/caregiver/pending-invites");
      setInvites(res.data.data || []);
    } catch (err) {
      console.log("❌ Fetch invites error:", err);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (linkId: string, action: "accept" | "reject") => {
    try {
      setActionLoading(linkId);

      await api.post("/caregiver/respond", {
        linkId,
        action,
      });

      // remove from list instantly (smooth UX)
      setInvites((prev) => prev.filter((i) => i._id !== linkId));

      Alert.alert(
        "Success",
        action === "accept" ? "Invite accepted 🎉" : "Invite rejected",
      );
    } catch (err) {
      Alert.alert("Error", "Action failed");
    } finally {
      setActionLoading(null);
    }
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
      <Text style={[title, { color: theme.text }]}>Pending Invites</Text>

      {/* EMPTY */}
      {invites.length === 0 && (
        <View style={center}>
          <Text style={{ color: theme.subText }}>No pending invites 🎉</Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={invites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              card,
              { backgroundColor: theme.surface, shadowColor: theme.shadow },
            ]}
          >
            {/* PATIENT INFO */}
            <Text style={[name, { color: theme.subText }]}>
              {item.patient?.name}
            </Text>
            <Text style={[email, { color: theme.subText }]}>
              {item.patient?.email}
            </Text>

            {/* ACTIONS */}
            <View style={actions}>
              <TouchableOpacity
                onPress={() => respond(item._id, "reject")}
                style={[btn, { backgroundColor: theme.surfaceElevated }]}
                disabled={actionLoading === item._id}
              >
                <Text>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => respond(item._id, "accept")}
                style={[btn, { backgroundColor: theme.success }]}
                disabled={actionLoading === item._id}
              >
                <Text style={{ color: theme.text }}>
                  {actionLoading === item._id ? "..." : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
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
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 3,
};
const email: TextStyle = {
  fontSize: 12,
  marginTop: 4,
};
const name: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
};

const actions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 16,
  gap: 10,
};

const btn: ViewStyle = {
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
};
