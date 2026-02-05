import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getAdherence, getWeeklyChart } from "../../api/analytics";
import WeeklyAdherenceChart from "../../components/WeeklyAdherenceChart";

export default function AdherenceOverview() {
  const [range, setRange] = useState<"week" | "month">("week");
  const [stats, setStats] = useState<any>(null);
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    getWeeklyChart().then(setChart);
  }, []);

  useEffect(() => {
    setLoading(true);
    getAdherence(range).then((res) => {
      setStats(res);
      setLoading(false);
    });
  }, [range]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9", padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 26, fontWeight: "800", color: "#020617" }}>
        Adherence
      </Text>

      <Text style={{ marginTop: 4, color: "#475569", fontSize: 15 }}>
        Your medication consistency overview
      </Text>

      {/* Range toggle */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#E2E8F0",
          borderRadius: 14,
          marginTop: 20,
          padding: 4,
        }}
      >
        {(["week", "month"] as const).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: range === r ? "white" : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "700",
                color: range === r ? "#020617" : "#64748B",
              }}
            >
              {r === "week" ? "Week" : "Month"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chart */}
      {range === "week" && chart.length > 0 && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "white",
            borderRadius: 18,
            padding: 16,
            elevation: 2,
          }}
        >
          <WeeklyAdherenceChart data={chart} />
        </View>
      )}

      {/* Summary Card */}
      {stats && (
        <View
          style={{
            backgroundColor: "#020617",
            borderRadius: 18,
            padding: 20,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
            {range === "week" ? "Weekly" : "Monthly"} Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#E5E7EB" }}>✅ Taken: {stats.taken}</Text>
            <Text style={{ color: "#E5E7EB" }}>❌ Missed: {stats.missed}</Text>
            <Text style={{ color: "white", fontWeight: "800" }}>
              📊 {stats.adherence}%
            </Text>
          </View>
        </View>
      )}

      {/* CTA */}
      <Pressable
        onPress={() => router.push("/MedicationAdherence")}
        style={{
          marginTop: 24,
          backgroundColor: "#2563EB",
          paddingVertical: 14,
          borderRadius: 14,
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "800",
            textAlign: "center",
            fontSize: 16,
          }}
        >
          View medication breakdown
        </Text>
      </Pressable>
    </View>
  );
}
