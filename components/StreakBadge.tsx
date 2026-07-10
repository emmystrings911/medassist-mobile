import { useTheme } from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function StreakBadge({ streak = 0 }: { streak: number }) {
  // 🔥 animation values
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const { theme } = useTheme();

  // 🎯 bounce when streak changes
  useEffect(() => {
    scale.value = 0.8;

    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
  }, [streak]);

  // 💫 continuous glow
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  // 🔥 animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glow.value, [0, 1], [0.3, 0.8]);

    return {
      shadowOpacity: opacity,
      shadowRadius: 10 + glow.value * 10,
    };
  });

  // 🎨 dynamic color based on streak
  const getColor = () => {
    if (streak >= 14) return "#FF6B00"; // 🔥 strong
    if (streak >= 7) return "#FF9800"; // ⚡ medium
    return "#9E9E9E"; // 💤 low
  };

  const color = getColor();

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          padding: 16,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",

          // 💫 glow base
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        animatedStyle,
        glowStyle,
      ]}
    >
      {/* 🔥 ICON */}
      <MaterialCommunityIcons name="fire" size={36} color={color} />

      {/* 🔢 COUNT */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginTop: 4,
          color: theme.text,
        }}
      >
        {streak}
      </Text>

      <Text style={{ fontSize: 12, color: theme.subText }}>Day Streak</Text>
    </Animated.View>
  );
}
