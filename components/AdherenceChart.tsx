import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function AdherenceChart({ data }: any) {
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const labels = data?.labels || [];
  const values = data?.values || [];

  // 🎬 Animate bars
  useEffect(() => {
    if (!values.length) {
      setAnimatedData([]);
      return;
    }

    let frame = 0;

    const interval = setInterval(() => {
      frame += 0.1;

      if (frame >= 1) {
        setAnimatedData(values);
        clearInterval(interval);
      } else {
        const scaled = values.map((item: any) => [
          Math.round((item?.[0] || 0) * frame),
          Math.round((item?.[1] || 0) * frame),
        ]);

        setAnimatedData(scaled);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [values]);

  // 🛑 Empty state (prevents crash)
  if (!labels.length || !values.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: "center", color: theme.subText }}>
          No adherence data yet 📊
        </Text>
      </View>
    );
  }

  // 📊 Convert to chart format
  const chartData = animatedData.map((value, index) => ({
    stacks: [
      { value: value?.[0] || 0, color: "#4CAF50" }, // taken
      { value: value?.[1] || 0, color: "#F44336" }, // missed
    ],
    label: labels[index] || "",
    onPress: () => setSelectedIndex(index),
  }));

  return (
    <View>
      <BarChart
        stackData={chartData}
        barWidth={28}
        spacing={18}
        height={220}
        roundedTop
        xAxisLabelTextStyle={{
          color: theme.text,
          fontSize: 11,
        }}
        yAxisTextStyle={{
          color: theme.text,
          fontSize: 11,
        }}
        xAxisColor={theme.border}
        yAxisColor={theme.border}
        rulesColor={theme.border}
      />

      {/* 🟡 Tooltip */}
      {selectedIndex !== null && animatedData[selectedIndex] && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Text style={{ fontSize: 12 }}>
            {animatedData[selectedIndex][0]} taken /{" "}
            {animatedData[selectedIndex][1]} missed
          </Text>
        </View>
      )}

      {/* 🏷 Labels */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {/* {labels.map((label: string, i: number) => (
          <Text key={i} style={{ fontSize: 10, color: theme.subText }}>
            {label}
          </Text>
        ))} */}
      </View>

      {/* 🎨 Legend */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <Text style={{ color: "#4CAF50" }}>● Taken</Text>
        <Text style={{ color: "#F44336" }}>● Missed</Text>
      </View>
    </View>
  );
}
