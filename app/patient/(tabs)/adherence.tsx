import { useTheme } from "@/hooks/useTheme";
import { getAdherence } from "@/services/adherence.service";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdherenceChart from "../../../components/AdherenceChart";

export default function AdherenceScreen() {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    loadData(period);
  }, [period]);

  const loadData = async (selectedPeriod: string) => {
    try {
      setLoading(true);

      const res = await getAdherence(selectedPeriod);

      const apiData = res.data.data;

      // ✅ TRANSFORM DATA → chart format
      const transformed = {
        labels: apiData.labels || [],
        values: apiData.labels.map((_: any, i: number) => [
          apiData.taken?.[i] || 0,
          apiData.missed?.[i] || 0,
        ]),
      };

      setData(transformed);
    } catch (err) {
      console.log("❌ Adherence error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background, padding: 22 }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: theme.text,
        }}
      >
        Adherence 📊
      </Text>

      {/* 🔘 PERIOD SWITCH */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.inputBg,
          borderRadius: 12,
          padding: 5,
          marginBottom: 20,
        }}
      >
        {["weekly", "monthly", "yearly"].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              backgroundColor: period === p ? "#4CAF50" : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: period === p ? "#fff" : "#333",
                fontWeight: "600",
              }}
            >
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📊 CHART */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <AdherenceChart data={data} style={{ color: theme.text }} />
      )}
    </ScrollView>
  );
}
