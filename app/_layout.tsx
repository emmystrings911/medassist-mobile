import { ThemeProvider } from "@/context/ThemeContext";
import { setupNotificationSystem } from "@/services/push";
import SocketProvider from "@/utils/SocketProvider";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { setupAuthInterceptor } from "../services/api";

function RootNavigator() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    // FIX FE-17 — Wire 401 interceptor as soon as auth context is available
    setupAuthInterceptor(logout);
  }, [logout]);

  // FIX FE-10 — Show spinner while AuthProvider reads SecureStore on boot.
  // Prevents the auth screen flashing before the stored session is loaded.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!user && <Stack.Screen name="(auth)" />}
        {user?.role === "patient" && <Stack.Screen name="patient/(tabs)" />}
        {user?.role === "caregiver" && <Stack.Screen name="caregiver/(tabs)" />}
      </Stack>
    </ThemeProvider>
  );
}

export default function Layout() {
  useEffect(() => {
    setupNotificationSystem();
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <RootNavigator />
      </SocketProvider>
    </AuthProvider>
  );
}
