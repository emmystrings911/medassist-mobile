import { getMonthlyAdherenceChart } from "@/api/analytics";
import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function MonthlyAdherenceChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getMonthlyAdherenceChart().then(setData);
  }, []);

  if (!data.length) {
    return <Text style={{ marginTop: 20 }}>No data yet</Text>;
  }

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        Monthly Adherence
      </Text>

      <LineChart
        data={{
          labels: data.map((d) => d.day.toString()),
          datasets: [{ data: data.map((d) => d.adherence) }],
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        yAxisSuffix="%"
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: () => "#475569",
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
