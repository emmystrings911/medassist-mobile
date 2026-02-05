import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { getWeeklyAdherence } from "../api/analytics";

export default function MedicationAdherence() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getWeeklyAdherence();
      setData(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9", padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: "#020617" }}>
        Medication Adherence
      </Text>

      <Text style={{ marginTop: 4, color: "#475569", fontSize: 15 }}>
        Per-medication adherence performance
      </Text>

      <FlatList
        style={{ marginTop: 20 }}
        data={data}
        keyExtractor={(i) => i.medicationId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        renderItem={({ item }) => {
          const adherenceColor =
            item.adherence >= 80
              ? "#16A34A"
              : item.adherence >= 50
                ? "#CA8A04"
                : "#DC2626";

          return (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                elevation: 1,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                {item.name}
              </Text>

              {item.type === "scheduled" ? (
                <>
                  <Text style={{ marginTop: 6, color: "#475569" }}>
                    {item.taken} of {item.expected} doses taken
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontWeight: "800",
                      color: adherenceColor,
                    }}
                  >
                    {item.adherence}% adherence
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    marginTop: 8,
                    fontStyle: "italic",
                    color: "#64748B",
                  }}
                >
                  PRN taken {item.taken} times this period
                </Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              No adherence data yet
            </Text>
            <Text style={{ marginTop: 6, color: "#475569" }}>
              Once medications are taken, stats will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
