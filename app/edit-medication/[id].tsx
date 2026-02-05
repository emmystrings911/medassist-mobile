import { api } from "@/api/client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function EditMedication() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [type, setType] = useState<"scheduled" | "prn">("scheduled");

  const [showPicker, setShowPicker] = useState(false);

  /* -------------------- Load medication -------------------- */
  useEffect(() => {
    loadMedication();
  }, []);

  const loadMedication = async () => {
    try {
      const res = await api.get(`/medications/${id}`);
      const med = res.data;

      setName(med.name);
      setDosage(med.dosage);
      setType(med.type);
      setTimes(med.times ?? []);
      setDurationDays(med.durationDays ?? null);
    } catch {
      Alert.alert("Error", "Failed to load medication");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Time helpers -------------------- */
  const addTime = (_: any, date?: Date) => {
    setShowPicker(false);
    if (!date) return;

    const formatted = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!times.includes(formatted)) {
      setTimes([...times, formatted].sort());
    }
  };

  const removeTime = (time: string) => {
    setTimes(times.filter((t) => t !== time));
  };

  /* -------------------- Save -------------------- */
  const handleSave = async () => {
    if (!name || !dosage) {
      Alert.alert("Missing info", "Name and dosage are required");
      return;
    }

    if (type === "scheduled" && times.length === 0) {
      Alert.alert("Missing time", "Add at least one time");
      return;
    }

    try {
      await api.patch(`/medications/${id}`, {
        name,
        dosage,
        type,
        times: type === "scheduled" ? times : [],
        durationDays,
      });

      Alert.alert(
        "Medication updated",
        "Future reminders have been updated. Past doses are unchanged.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      Alert.alert("Error", "Failed to update medication");
    }
  };

  if (loading) {
    return <Text style={{ padding: 20 }}>Loading…</Text>;
  }

  /* -------------------- UI -------------------- */
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#F8FAFC" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Edit Medication
      </Text>

      {/* Type selector */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#E2E8F0",
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {["scheduled", "prn"].map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setType(t as any);
              if (t === "prn") setTimes([]);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: type === t ? "#FFFFFF" : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: type === t ? "#020617" : "#64748B",
              }}
            >
              {t === "scheduled" ? "Scheduled" : "As needed (PRN)"}
            </Text>
          </Pressable>
        ))}
      </View>

      {type === "prn" && (
        <View
          style={{
            backgroundColor: "#ECFDF5",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: "#065F46" }}>
            PRN medications have no reminders. You can log doses manually.
          </Text>
        </View>
      )}

      {/* Card */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>
          Medication name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Paracetamol"
          style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Dosage</Text>
        <TextInput
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g. 500mg"
          style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        />

        {type === "scheduled" && (
          <>
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>
              Times per day
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {times.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => removeTime(time)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: "#E0F2FE",
                  }}
                >
                  <Text style={{ fontWeight: "600", color: "#0369A1" }}>
                    {time} ✕
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#2563EB",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Add time
              </Text>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                mode="time"
                value={new Date()}
                is24Hour
                display="default"
                onChange={addTime}
              />
            )}
          </>
        )}

        <Text style={{ fontWeight: "600", marginTop: 20 }}>
          Duration (days)
        </Text>
        <TextInput
          placeholder="Optional"
          keyboardType="number-pad"
          value={durationDays ? String(durationDays) : ""}
          onChangeText={(v) => setDurationDays(Number(v) || null)}
          style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 10,
            padding: 12,
            marginTop: 6,
          }}
        />
      </View>

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 14,
          backgroundColor: "#16A34A",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            textAlign: "center",
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          Save changes
        </Text>
      </Pressable>
    </View>
  );
}
