import { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface MissedDoseBannerProps {
  dose: any;
  onTakeNow: (dose: any) => Promise<void> | void;
  onSnooze: (dose: any) => Promise<void> | void;
}

export default function MissedDoseBanner({
  dose,
  onTakeNow,
  onSnooze,
}: MissedDoseBannerProps) {
  const [loading, setLoading] = useState(false);

  if (!dose || dose.status === "taken") return null;

  const isPaused = dose.medicationId?.isActive === false;

  const medicationName =
    dose.medicationId?.name || dose.medicationName || "Medication";

  const scheduledTime = dose.scheduledAt
    ? new Date(dose.scheduledAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleTakeNow = async () => {
    if (loading || isPaused) return;

    try {
      setLoading(true);
      await onTakeNow(dose);
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async () => {
    if (loading || isPaused) return;
    try {
      setLoading(true);
      await onSnooze(dose);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        opacity: isPaused ? 0.6 : 1,
      }}
    >
      <Text style={{ fontWeight: "700", color: "#991B1B", fontSize: 15 }}>
        ⏰ Missed dose
      </Text>

      <Text style={{ marginTop: 6, color: "#7F1D1D" }}>
        {medicationName} • scheduled at {scheduledTime}
      </Text>

      {isPaused && (
        <Text
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "#92400E",
            fontStyle: "italic",
          }}
        >
          This medication is currently paused
        </Text>
      )}

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <Pressable
          onPress={handleTakeNow}
          disabled={loading || isPaused}
          style={{
            flex: 1,
            backgroundColor: "#16A34A",
            paddingVertical: 12,
            borderRadius: 10,
            marginRight: 8,
            opacity: loading || isPaused ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Take now
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSnooze}
          disabled={loading || isPaused}
          style={{
            flex: 1,
            backgroundColor: "#F59E0B",
            paddingVertical: 12,
            borderRadius: 10,
            opacity: loading || isPaused ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Snooze 30 min
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
