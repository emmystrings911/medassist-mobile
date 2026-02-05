import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { createMedication } from "../api/medications";

export default function AddMedication() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [type, setType] = useState<"scheduled" | "prn">("scheduled");
  const [prnIntervalHours, setPrnIntervalHours] = useState<number | null>(null);

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

  const handleSave = async () => {
    if (!name || !dosage) {
      Alert.alert("Missing info", "Please complete all required fields");
      return;
    }

    if (type === "scheduled" && times.length === 0) {
      Alert.alert("Missing time", "Please add at least one time");
      return;
    }

    if (type === "prn" && !prnIntervalHours) {
      Alert.alert(
        "Missing interval",
        "Please set how often this medication can be taken",
      );
      return;
    }

    const startDate = new Date();
    const endDate =
      durationDays && durationDays > 0
        ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;

    try {
      await createMedication({
        name,
        dosage,
        type,
        times: type === "scheduled" ? times : [],
        prnIntervalHours: type === "prn" ? prnIntervalHours : null,
        startDate: type === "scheduled" ? startDate.toISOString() : null,
        endDate: type === "scheduled" ? (endDate?.toISOString() ?? null) : null,
      });

      router.replace("/medication-history/created");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save medication");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 4 }}>
          Add Medication
        </Text>
        <Text style={{ color: "#64748B", marginBottom: 20 }}>
          Set up how and when this medication should be taken
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
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: type === t ? "#0F172A" : "#475569",
                }}
              >
                {t === "scheduled" ? "Scheduled" : "As needed (PRN)"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Medication name
          </Text>
          <TextInput
            placeholder="e.g. Amoxicillin"
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
            }}
          />

          <Text style={{ fontWeight: "600", marginBottom: 6 }}>Dosage</Text>
          <TextInput
            placeholder="e.g. 500mg"
            value={dosage}
            onChangeText={setDosage}
            style={{
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              padding: 12,
            }}
          />
        </View>

        {/* PRN */}
        {type === "prn" && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>
              Minimum interval (hours)
            </Text>
            <TextInput
              placeholder="e.g. 6"
              keyboardType="number-pad"
              value={prnIntervalHours ? String(prnIntervalHours) : ""}
              onChangeText={(v) => setPrnIntervalHours(Number(v) || null)}
              style={{
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 10,
                padding: 12,
              }}
            />
          </View>
        )}

        {/* Scheduled times */}
        {type === "scheduled" && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontWeight: "600", marginBottom: 10 }}>
              Times per day
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {times.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => removeTime(time)}
                  style={{
                    backgroundColor: "#DBEAFE",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#1D4ED8", fontWeight: "500" }}>
                    {time} ✕
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button title="Add time" onPress={() => setShowPicker(true)} />

            {showPicker && (
              <DateTimePicker
                mode="time"
                value={new Date()}
                is24Hour
                display="default"
                onChange={addTime}
              />
            )}
          </View>
        )}

        {/* Duration */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            marginBottom: 30,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 6 }}>
            Duration (days)
          </Text>
          <TextInput
            placeholder="e.g. 7"
            keyboardType="number-pad"
            value={durationDays ? String(durationDays) : ""}
            onChangeText={(v) => setDurationDays(Number(v) || null)}
            style={{
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              padding: 12,
            }}
          />
        </View>

        <Button title="Save medication" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}
