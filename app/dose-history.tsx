import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Text, View } from "react-native";
import { getDoseHistory, markDoseTaken } from "../api/doseLogs";

export default function DoseHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getDoseHistory();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load dose history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (id: string) => {
    try {
      await markDoseTaken(id);
      loadLogs(); // refresh list after update
    } catch (err) {
      console.error("Failed to mark dose as taken", err);
    }
  };

  const renderItem = ({ item }: any) => (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {item.medication?.name || "Medication"}
      </Text>

      <Text style={{ marginTop: 4, color: "#475569" }}>
        Status: {item.status}
      </Text>

      {item.status !== "taken" && (
        <View style={{ marginTop: 12 }}>
          <Button
            title="Mark as taken"
            onPress={() => handleMarkTaken(item._id)}
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading dose history…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{
        padding: 16,
        flexGrow: logs.length === 0 ? 1 : undefined,
      }}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            No dose history yet
          </Text>

          <Text
            style={{
              marginTop: 8,
              textAlign: "center",
              color: "#64748B",
            }}
          >
            Once you take or miss medications, they will appear here.
          </Text>
        </View>
      }
    />
  );
}
