import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";

// FIX FE-2 — Route to the correct tab group based on role.
// Previously routed everyone to "/(tabs)" which doesn't exist.
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null; // AuthProvider is still bootstrapping

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === "caregiver") return <Redirect href="/caregiver/(tabs)" />;
  return <Redirect href="/patient/(tabs)" />;
}
