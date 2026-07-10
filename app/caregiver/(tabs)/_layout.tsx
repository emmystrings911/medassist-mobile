import { useAuth } from "@/hooks/useAuth";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useTheme } from "@/hooks/useTheme";
import { getSocket } from "@/services/socket";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  useRoleGuard(["caregiver"]);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user && user.role === "patient") {
      router.replace("/patient/(tabs)");
    }
  }, [user]);

  // 🔔 socket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = () => {
      setUnread((prev) => prev + 1);
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, []);

  // ⛔ optional: prevent render flicker
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarStyle: { backgroundColor: theme.background },
        tabBarInactiveTintColor: theme.subText,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pending"
        options={{
          title: "Pending Requests",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
