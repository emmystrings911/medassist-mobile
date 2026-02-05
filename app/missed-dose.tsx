import { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { getDoseHistory, markDoseTaken } from "../api/doseLogs";

export default function MissedDoses() {
  const [missed, setMissed] = useState<any[]>([]);

  useEffect(() => {
    loadMissed();
  }, []);

  const loadMissed = async () => {
    const logs = await getDoseHistory();
    const missedOnly = logs.filter((l: any) => l.status === "missed");
    setMissed(missedOnly);
  };

  const handleMarkTaken = async (id: string) => {
    await markDoseTaken(id);
    loadMissed();
  };

  if (missed.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No missed doses 🎉</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={missed}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontWeight: "bold" }}>{item.medication?.name}</Text>
          <Text>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</Text>

          <Button
            title="Mark as taken"
            onPress={() => handleMarkTaken(item._id)}
          />
        </View>
      )}
    />
  );
}
