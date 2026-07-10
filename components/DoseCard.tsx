import { useTheme } from "@/hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";

export function DoseCard({ dose, onTake }: any) {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      const diff = new Date(dose.scheduledTime).getTime() - Date.now();

      setTimeLeft(diff <= 0 ? "Due now" : `${Math.floor(diff / 60000)} min`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isDue = new Date(dose.scheduledTime) <= new Date();

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>
        {dose.medication?.name}
      </Text>

      <Text style={{ color: theme.subText, marginTop: 4 }}>
        {new Date(dose.scheduledTime).toLocaleTimeString()}
      </Text>

      <Text style={{ marginTop: 6, color: theme.subText }}>⏳ {timeLeft}</Text>

      {dose.status === "missed" && (
        <Text style={{ color: theme.danger, marginTop: 6 }}>Missed</Text>
      )}

      {dose.status === "taken" && (
        <Text style={{ color: theme.accent, marginTop: 6 }}>Taken</Text>
      )}

      {dose.status === "pending" && (
        <TouchableOpacity
          disabled={!isDue}
          onPress={() => onTake(dose._id)}
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            backgroundColor: isDue ? theme.primary : theme.border,
          }}
        >
          <Text style={{ color: theme.buttonText, textAlign: "center" }}>
            Mark as Taken
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
