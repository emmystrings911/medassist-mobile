import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextStyle, View, ViewStyle } from "react-native";

export default function PatientDetails() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const { theme } = useTheme();

  useEffect(() => { fetchPatient(); }, []);

  // FIX FE-6 — api client (env-var URL) instead of hardcoded IP
  const fetchPatient = async () => {
    try {
      const res = await api.get(`/caregiver/patient/${id}`);
      setData(res.data.data);
    } catch { /* silent */ }
  };

  const getRiskColor = (risk: string) => {
    if (risk === "critical") return theme.danger;
    if (risk === "high") return theme.warning;
    return theme.success;
  };

  if (!data) {
    return <View style={center}><ActivityIndicator /></View>;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background }}
      ListHeaderComponent={
        <>
          <View style={[header, { backgroundColor: theme.surface }]}>
            <Text style={[name, { color: theme.text }]}>{data.name}</Text>
            <Text style={[email, { color: theme.subText }]}>{data.email}</Text>
            <View style={[riskBadge, { backgroundColor: getRiskColor(data.risk) }]}>
              <Text style={{ color: "#fff" }}>{data.risk?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={[card, { backgroundColor: theme.surface }]}>
            <Text style={[sectionTitle, { color: theme.text }]}>Adherence</Text>
            <View style={[progressBar, { backgroundColor: theme.border }]}>
              <View style={{ width: `${data.adherence}%`, backgroundColor: theme.accent, height: "100%", borderRadius: 10 }} />
            </View>
            <Text style={{ marginTop: 6, color: theme.subText }}>{data.adherence}% adherence</Text>
          </View>

          <View style={[card, { backgroundColor: theme.surface }]}>
            <Text style={[sectionTitle, { color: theme.text }]}>Missed Doses (24h)</Text>
            <Text style={{ fontSize: 24, color: theme.danger }}>{data.missedDoses}</Text>
          </View>

          <Text style={[sectionTitleBig, { color: theme.text }]}>Medications</Text>
        </>
      }
      data={data.medications}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => (
        <View style={[card, { backgroundColor: theme.surface }]}>
          <Text style={[medName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[medTime, { color: theme.subText }]}>{item.schedule}</Text>
          <Text style={{ color: theme.subText }}>Taken: {item.taken} | Missed: {item.missed}</Text>
          <View style={[progressBar, { backgroundColor: theme.border }]}>
            <View style={{
              width: `${item.adherence}%`,
              backgroundColor: item.status === "critical" ? theme.danger : item.status === "warning" ? theme.warning : theme.success,
              height: "100%",
            }} />
          </View>
          <Text style={{ color: theme.subText }}>{item.adherence}% adherence</Text>

          {/* FIX FE-4 — Removed Take/Snooze buttons. Caregivers cannot mark doses on behalf
              of patients — the backend ownership check (dose.patient === req.user.id) will
              reject any such request since the caregiver is not the patient. */}
        </View>
      )}
    />
  );
}

const center: ViewStyle = { flex: 1, justifyContent: "center", alignItems: "center" };
const header: ViewStyle = { padding: 20, marginBottom: 10 };
const name: TextStyle = { fontSize: 22, fontWeight: "700" };
const email: TextStyle = { marginTop: 4 };
const riskBadge: ViewStyle = { marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" };
const card: ViewStyle = { padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 14 };
const sectionTitle: TextStyle = { fontWeight: "600", marginBottom: 10 };
const sectionTitleBig: TextStyle = { fontSize: 18, fontWeight: "700", margin: 16 };
const progressBar: ViewStyle = { height: 10, borderRadius: 10, overflow: "hidden" };
const medName: TextStyle = { fontSize: 16, fontWeight: "600" };
const medTime: TextStyle = { marginTop: 4 };
