import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { api } from "@/services/api";

export default function MedicationDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [med, setMed] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchMedication();
  }, [id]);

  const fetchMedication = async () => {
    try {
      const res = await api.get(`/medications/${id}`);
      setMed(res.data.data);
    } catch (err) {
      console.log("❌ Fetch med error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!med) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Medication not found</Text>
      </View>
    );
  }
  const handleDelete = () => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ],
    );
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/medications/${id}/toggle`);

      // refresh data
      fetchMedication();
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/medications/${id}`);

      Alert.alert("Deleted", "Medication removed");

      router.replace("/patient/(tabs)/medications"); // go back to list
    } catch (err) {
      Alert.alert("Error", "Delete failed");
    }
  };
  // Extract adherence info from med
  const taken = med.takenCount ?? 0;
  const missed = med.missedCount ?? 0;
  const adherence = med.adherence ?? 0;
  const nextDose = med.nextDoseTime
    ? new Date(med.nextDoseTime).toLocaleString()
    : "N/A";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 20 }}>
        {/* HEADER */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: theme.text,
              marginTop: 10,
            }}
          >
            {med.name}
          </Text>
          <Text style={{ color: theme.subText, marginTop: 4 }}>
            {med.dosage}
          </Text>
        </View>

        {/* STATUS */}
        <View
          style={{
            backgroundColor: med.active ? "#E8F5E9" : "#FDECEA",
            padding: 12,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: med.active ? "#2E7D32" : "#C62828",
              fontWeight: "600",
            }}
          >
            {med.active ? "Active Medication" : "Inactive"}
          </Text>
        </View>

        {/* INSTRUCTIONS */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={[
              { fontWeight: "600", marginBottom: 6 },
              { color: theme.text },
            ]}
          >
            Instructions
          </Text>
          <Text style={{ color: theme.subText }}>
            {med.instructions || "No instructions provided"}
          </Text>
        </View>

        {/* SCHEDULE */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{ color: theme.text, fontWeight: "600", marginBottom: 10 }}
          >
            Schedule
          </Text>

          {!med.schedule ? (
            <Text style={{ color: theme.subText }}>No schedule configured</Text>
          ) : (
            <>
              <Text style={{ color: theme.subText }}>
                Type: {med.schedule.type}
              </Text>

              {med.schedule.type === "fixed" && (
                <Text style={{ color: theme.subText }}>
                  Times: {med.schedule.times?.join(", ")}
                </Text>
              )}

              {med.schedule.type === "interval" && (
                <Text style={{ color: theme.subText }}>
                  Every {med.schedule.intervalHours} hours
                </Text>
              )}
            </>
          )}
        </View>
        {/* <View
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 10 }}>
            Upcoming Doses
          </Text>

          {med.compiledSchedule?.length === 0 ? (
            <Text style={{ color: "#999" }}>No upcoming doses</Text>
          ) : (
            med.compiledSchedule.map((dose: any) => (
              <Text key={dose._id}>
                {new Date(dose.scheduledTime).toLocaleString()}
              </Text>
            ))
          )}
        </View> */}

        {/* ADHERENCE */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={[
              { fontWeight: "600", marginBottom: 10 },
              { color: theme.text },
            ]}
          >
            Adherence
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#4CAF50" }}>✅ Taken: {taken}</Text>
            <Text style={{ color: "#F44336" }}>❌ Missed: {missed}</Text>
            <Text style={{ fontWeight: "600", color: theme.subText }}>
              📊 {adherence}%
            </Text>
          </View>
          <Text style={{ marginTop: 6, color: theme.subText }}>
            Next dose: {nextDose}
          </Text>
        </View>

        {/* ACTIONS */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/patient/medication/edit/[id]",
              params: { id: id as string },
            })
          }
          style={{
            backgroundColor: theme.accent,
            padding: 15,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: theme.text, textAlign: "center" }}>
            Edit Medication
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleStatus}
          style={{
            backgroundColor: med.active ? "#FF9800" : "#4CAF50",
            padding: 15,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: theme.text, textAlign: "center" }}>
            {med.active ? "Pause Medication ⏸️" : "Resume Medication ▶️"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={deleteBtn}>
          <Text style={{ color: theme.text, textAlign: "center" }}>
            Delete Medication
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const deleteBtn = {
  backgroundColor: "#F44336",
  padding: 15,
  borderRadius: 12,
};
