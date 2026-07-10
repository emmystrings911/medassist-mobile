import { useTheme } from "@/hooks/useTheme";
import { createMedication } from "@/services/medication.service";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function AddMedication() {
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const [type, setType] = useState<"fixed" | "interval" | "prn">("fixed");
  const [times, setTimes] = useState<string[]>([]);
  const [intervalHours, setIntervalHours] = useState("");
  const [prnInterval, setPrnInterval] = useState("");
  const [maxPerDay, setMaxPerDay] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState<"start" | "end" | null>(
    null,
  );

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const onTimeSelected = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (!selected) return;

    const time = formatTime(selected);

    if (times.includes(time)) {
      return Alert.alert("Duplicate", "Time already added");
    }

    setTimes([...times, time]);
  };

  const handleSubmit = async () => {
    if (!name || !dosage) {
      return Alert.alert("Error", "Name and dosage are required");
    }

    if (type === "fixed" && times.length === 0) {
      return Alert.alert("Error", "Add at least one time");
    }

    if (type === "interval" && !intervalHours) {
      return Alert.alert("Error", "Enter interval hours");
    }

    // FIX FE-16 — Validate that endDate is after startDate to prevent zero-dose schedules
    if (type !== "prn") {
      if (!startDate || !endDate) {
        return Alert.alert("Error", "Start and end dates are required");
      }
      if (new Date(endDate) <= new Date(startDate)) {
        return Alert.alert("Error", "End date must be after start date");
      }
    }

    try {
      const payload: any = {
        name,
        dosage,
        instructions,
        schedule: {
          type,
        },
      };

      if (type === "fixed") payload.schedule.times = times;
      if (type === "interval")
        payload.schedule.intervalHours = Number(intervalHours);
      if (type === "prn") {
        payload.schedule.prnInterval = Number(prnInterval);
        payload.schedule.maxPerDay = Number(maxPerDay);
      }

      if (type !== "prn") {
        payload.schedule.startDate = startDate;
        payload.schedule.endDate = endDate;
      }

      await createMedication(payload);

      Alert.alert("Success", "Medication created");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create medication");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}
    >
      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "bold" }}>
        Add Medication
      </Text>

      {/* INPUTS */}
      {[
        { label: "Name", value: name, setter: setName },
        { label: "Dosage", value: dosage, setter: setDosage },
        { label: "Instructions", value: instructions, setter: setInstructions },
      ].map((field) => (
        <View key={field.label} style={{ marginTop: 15 }}>
          <Text style={{ color: theme.subText }}>{field.label}</Text>
          <TextInput
            value={field.value}
            onChangeText={field.setter}
            style={{
              backgroundColor: theme.inputBg,
              color: theme.text,
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
              marginTop: 5,
            }}
          />
        </View>
      ))}

      {/* TYPE */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
        {["fixed", "interval", "prn"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t as any)}
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor:
                type === t ? theme.primary : theme.surfaceElevated,
            }}
          >
            <Text
              style={{
                color: type === t ? "#fff" : theme.text,
                textTransform: "capitalize",
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FIXED */}
      {type === "fixed" && (
        <>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={{
              backgroundColor: theme.accent,
              padding: 12,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: theme.buttonText, textAlign: "center" }}>
              + Add Time
            </Text>
          </TouchableOpacity>

          {times.map((t) => (
            <Text key={t} style={{ color: theme.text, marginTop: 5 }}>
              • {t}
            </Text>
          ))}

          {showTimePicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              onChange={onTimeSelected}
            />
          )}
        </>
      )}

      {/* INTERVAL */}
      {type === "interval" && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: theme.subText, marginBottom: 8 }}>
            Select Interval
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {[2, 4, 6, 8, 12, 24].map((hour) => (
              <TouchableOpacity
                key={hour}
                onPress={() => setIntervalHours(String(hour))}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor:
                    intervalHours === String(hour)
                      ? theme.primary
                      : theme.surfaceElevated,
                }}
              >
                <Text
                  style={{
                    color: intervalHours === String(hour) ? "#fff" : theme.text,
                  }}
                >
                  Every {hour}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {type === "prn" && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: theme.subText }}>
            Minimum Time Between Doses
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
            }}
          >
            {[2, 4, 6, 8, 12].map((hour) => (
              <TouchableOpacity
                key={hour}
                onPress={() => setPrnInterval(String(hour))}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor:
                    prnInterval === String(hour)
                      ? theme.primary
                      : theme.surfaceElevated,
                }}
              >
                <Text
                  style={{
                    color: prnInterval === String(hour) ? "#fff" : theme.text,
                  }}
                >
                  {hour}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={{
              color: theme.subText,
              marginTop: 20,
            }}
          >
            Maximum Per Day
          </Text>

          <TextInput
            keyboardType="numeric"
            value={maxPerDay}
            onChangeText={setMaxPerDay}
            placeholder="e.g 4"
            placeholderTextColor="#999"
            style={{
              backgroundColor: theme.inputBg,
              padding: 12,
              borderRadius: 10,
              marginTop: 8,
              color: theme.text,
            }}
          />
        </View>
      )}

      {/* DATE PICKERS */}
      {type !== "prn" && (
        <>
          {["start", "end"].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setShowCalendar(d as any)}
              style={{
                backgroundColor: theme.inputBg,
                padding: 12,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ color: theme.text }}>
                {d === "start"
                  ? startDate || "Start Date"
                  : endDate || "End Date"}
              </Text>
            </TouchableOpacity>
          ))}

          {/* CALENDAR */}
          {showCalendar && (
            <Modal transparent>
              <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
                <View style={{ backgroundColor: "#fff", padding: 20 }}>
                  <Calendar
                    onDayPress={(day) => {
                      showCalendar === "start"
                        ? setStartDate(day.dateString)
                        : setEndDate(day.dateString);
                      setShowCalendar(null);
                    }}
                  />
                </View>
              </View>
            </Modal>
          )}
        </>
      )}

      {/* SUBMIT */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: theme.primary,
          padding: 15,
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Save Medication
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
