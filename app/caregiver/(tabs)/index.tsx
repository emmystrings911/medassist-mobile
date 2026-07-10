import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export default function CaregiverDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/caregiver/dashboard");
      setPatients(res.data.data.patients || []);
    } catch (err) {
      console.log("❌ Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Risk color
  const getRiskColor = (risk: string) => {
    if (risk === "critical") return theme.danger;
    if (risk === "high") return theme.warning;
    return theme.success;
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
      <Text style={[title, { color: theme.text }]}>Care Dashboard</Text>

      {/* EMPTY STATE */}
      {patients.length === 0 && (
        <View style={center}>
          <Text style={{ color: theme.subText }}>
            No patients connected yet
          </Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDashboard} />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              card,
              { backgroundColor: theme.surface, shadowColor: theme.shadow },
            ]}
          >
            {/* TOP ROW */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={[name, { color: theme.subText }]}>
                  {item.name}
                </Text>
                <Text style={[email, { color: theme.subText }]}>
                  {item.email}
                </Text>
              </View>

              {/* RISK BADGE */}
              <View
                style={{
                  backgroundColor: getRiskColor(item.risk),
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: theme.text, fontSize: 12 }}>
                  {item.risk.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* STATS */}
            <View style={statsRow}>
              {/* Adherence */}
              <View style={statBox}>
                <Text style={statValue}>{item.adherence}%</Text>
                <Text style={[statLabel, { color: theme.subText }]}>
                  Adherence
                </Text>
              </View>

              {/* Missed */}
              <View style={statBox}>
                <Text style={[statValue, { color: theme.danger }]}>
                  {item.missedDoses}
                </Text>
                <Text style={[statLabel, { color: theme.subText }]}>
                  Missed (24h)
                </Text>
              </View>
            </View>

            {/* ACTION */}
            <TouchableOpacity
              style={[actionBtn, { backgroundColor: theme.accent }]}
              onPress={() =>
                router.push({
                  pathname: "/caregiver/patient/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={{ color: theme.text, textAlign: "center" }}>
                View Patient
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
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
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
  marginTop: 2,
};

const statsRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 16,
};

const statBox: ViewStyle = {
  alignItems: "center",
  flex: 1,
};

const statValue: TextStyle = {
  fontSize: 18,
  fontWeight: "700",
};

const statLabel: TextStyle = {
  fontSize: 11,
  marginTop: 2,
};

const actionBtn: ViewStyle = {
  marginTop: 16,
  padding: 12,
  borderRadius: 10,
};
