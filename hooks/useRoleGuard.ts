import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

/**
 * FIX FE-10 — Returns { ready: boolean } so screens can withhold render
 * until the role check has resolved, preventing a flash of unauthorized UI.
 *
 * Usage:
 *   const { ready } = useRoleGuard(["patient"]);
 *   if (!ready) return null;
 */
export const useRoleGuard = (allowedRoles: string[]): { ready: boolean } => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return; // still bootstrapping auth

    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect to their correct home instead of a blank "/"
      if (user.role === "caregiver") router.replace("/caregiver/(tabs)");
      else router.replace("/patient/(tabs)");
      return;
    }

    setReady(true);
  }, [user, loading]);

  return { ready };
};
