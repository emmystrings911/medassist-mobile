// hooks/useNotifications.ts
import { api } from "@/api/client";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push permission not granted");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // 🔥 Send token to backend
  await api.post("/notifications/register", { token });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medication-alerts", {
      name: "Medication Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500],
      sound: "default",
    });
  }
};
