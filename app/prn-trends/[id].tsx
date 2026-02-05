import { getMonthlyPrnTrends, getWeeklyPrnTrends } from "@/api/prnTrends";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function PrnTrendsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [mode]);

  const load = async () => {
    setLoading(true);
    try {
      const res =
        mode === "weekly"
          ? await getWeeklyPrnTrends(id!)
          : await getMonthlyPrnTrends(id!);

      setData(res);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const labels =
    mode === "weekly"
      ? data.daily.map((d: any) => d.day)
      : data.daily.map((d: any) => d.day.toString());

  const counts = data.daily.map((d: any) => d.count);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Header */}
      <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 4 }}>
        PRN Usage Trends
      </Text>

      <Text style={{ color: "#64748B", marginBottom: 20 }}>
        Track how often this medication is used
      </Text>

      {/* Toggle */}
      <View style={{ flexDirection: "row", marginBottom: 24 }}>
        {["weekly", "monthly"].map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m as any)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              marginRight: m === "weekly" ? 8 : 0,
              backgroundColor: mode === m ? "#2563EB" : "#E2E8F0",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "700",
                color: mode === m ? "white" : "#0F172A",
              }}
            >
              {m === "weekly" ? "Weekly" : "Monthly"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary */}
      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 16,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 14, color: "#64748B" }}>Total PRN doses</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", marginTop: 4 }}>
          {data.total}
        </Text>
      </View>

      {/* Chart */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          paddingVertical: 12,
        }}
      >
        <BarChart
          data={{
            labels,
            datasets: [{ data: counts }],
          }}
          width={screenWidth - 32}
          height={240}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "white",
            backgroundGradientTo: "white",
            decimalPlaces: 0,
            color: () => "#2563EB",
            labelColor: () => "#0F172A",
            barPercentage: 0.6,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* Insight */}
      <View
        style={{
          marginTop: 24,
          backgroundColor: "#EFF6FF",
          padding: 16,
          borderRadius: 16,
        }}
      >
        <Text style={{ fontWeight: "700", marginBottom: 4 }}>📌 Insight</Text>
        <Text style={{ color: "#1E3A8A" }}>
          Average usage: {(data.total / data.daily.length).toFixed(1)} doses per
          day
        </Text>
      </View>
    </ScrollView>
  );
}
