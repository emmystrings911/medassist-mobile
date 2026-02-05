import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function StreakCard({ streak }: { streak: number }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <View
      style={{
        backgroundColor: "#FFEDD5",
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700" }}>🔥 Streak</Text>

      <Text style={{ fontSize: 32, fontWeight: "800", marginTop: 6 }}>
        {streak} day{streak === 1 ? "" : "s"}
      </Text>
      <Pressable onPress={() => setShowInfo(true)}>
        <Text style={{ color: "#2563EB", marginTop: 6 }}>
          ℹ️ What breaks a streak?
        </Text>
      </Pressable>

      <Text style={{ marginTop: 4, color: "#92400E" }}>
        Consecutive days of perfect adherence
      </Text>
      {showInfo && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700" }}>
            About your streak
          </Text>

          <Text style={{ marginTop: 10 }}>
            Your streak continues when you take all scheduled medications each
            day.
          </Text>

          <Text style={{ marginTop: 10 }}>
            ❌ Missing a scheduled dose breaks the streak.
          </Text>

          <Text style={{ marginTop: 10 }}>
            ⏰ Snoozed doses do not break your streak as long as you take them
            the same day.
          </Text>

          <Text style={{ marginTop: 10 }}>
            💊 “As needed” (PRN) medications never affect streaks.
          </Text>

          <Pressable
            onPress={() => setShowInfo(false)}
            style={{ marginTop: 16 }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#2563EB",
                fontWeight: "600",
              }}
            >
              Got it
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
