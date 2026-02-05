import { api } from "@/api/client";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

function formatDay(date: string) {
  return new Date(date).toDateString();
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MedicationHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get(`/logs/medication/${id}`);
      setLogs(res.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  let lastDay = "";

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Medication History
      </Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View
            style={{
              marginTop: 80,
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }}>
              No medication history yet
            </Text>

            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: "#64748B",
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Once you start taking or logging this medication, all activity
              will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const day = formatDay(item.scheduledAt);
          const showDay = day !== lastDay;
          lastDay = day;

          const statusColor =
            item.status === "taken"
              ? "#16A34A"
              : item.status === "missed"
                ? "#DC2626"
                : "#CA8A04";

          const label =
            item.status === "taken"
              ? item.source === "manual"
                ? "Taken (manual)"
                : "Taken"
              : item.status === "missed"
                ? "Missed"
                : "Snoozed";

          return (
            <>
              {showDay && (
                <Text
                  style={{
                    marginTop: 16,
                    marginBottom: 6,
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  {day}
                </Text>
              )}

              <View
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: "#F8FAFC",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  {formatTime(item.scheduledAt)}
                </Text>

                <Text
                  style={{
                    marginTop: 4,
                    color: statusColor,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </View>
            </>
          );
        }}
      />
    </View>
  );
}
