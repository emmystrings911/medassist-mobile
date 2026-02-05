import { listenToNotificationActions } from "@/hooks/useNotificationActions";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ToastProvider } from "react-native-toast-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true, // ✅ required on newer SDKs
    shouldShowList: true, // ✅ required on newer SDKs
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    listenToNotificationActions();

    Notifications.setNotificationCategoryAsync("MEDICATION_REMINDER", [
      {
        identifier: "TAKE_NOW",
        buttonTitle: "Take now",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "SNOOZE_30",
        buttonTitle: "Snooze 30 min",
      },
    ]);
  }, []);

  console.log("🟦 ROOT LAYOUT RENDERED");

  return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      successColor="#16A34A"
      dangerColor="#DC2626"
      warningColor="#F59E0B"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ToastProvider>
  );
}
