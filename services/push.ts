import { api } from "@/services/api";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let isListenerRegistered = false;

export async function setupNotificationSystem() {
  if (isListenerRegistered) return;
  isListenerRegistered = true;

  // Action buttons
  await Notifications.setNotificationCategoryAsync("medication-actions", [
    { identifier: "TAKE_NOW", buttonTitle: "✅ Take Now" },
    { identifier: "REMIND_LATER", buttonTitle: "⏰ Later" },
  ]);

  // FIX FE-12 — Each sound gets a UNIQUE channel ID.
  // Previously all used "alert", so only the first registration was applied
  // (Android ignores subsequent setNotificationChannelAsync calls for existing IDs).
  await Notifications.setNotificationChannelAsync("calm", {
    name: "Calm Reminder",
    sound: "simple-tone.wav",
    importance: Notifications.AndroidImportance.MAX,
  });

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default Reminder",
    sound: "default",
    importance: Notifications.AndroidImportance.MAX,
  });

  await Notifications.setNotificationChannelAsync("quick", {
    name: "Quick Alert",
    sound: "quick-tone.wav",
    importance: Notifications.AndroidImportance.MAX,
  });

  await Notifications.setNotificationChannelAsync("software", {
    name: "Software Chime",
    sound: "software.wav",
    importance: Notifications.AndroidImportance.MAX,
  });

  await Notifications.setNotificationChannelAsync("tile", {
    name: "Tile Sound",
    sound: "tile.wav",
    importance: Notifications.AndroidImportance.MAX,
  });

  // Handle cold-start notification tap
  const response = await Notifications.getLastNotificationResponseAsync();
  if (response) handleNotificationNavigation(response);

  // Handle foreground/background notification taps
  Notifications.addNotificationResponseReceivedListener(async (response) => {
    const action = response.actionIdentifier;
    const data = response.notification.request.content.data;
    if (!data) return;

    if (action === "TAKE_NOW" && data.doseId) {
      await api.patch(`/doses/${data.doseId}/take`).catch(() => {});
      return;
    }

    if (action === "REMIND_LATER" && data.doseId) {
      await api.patch(`/doses/${data.doseId}/snooze`, { minutes: 30 }).catch(() => {});
      return;
    }

    handleNotificationNavigation(response);
  });
}

function handleNotificationNavigation(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  if (!data) return;

  if (data.screen === "medication-details" && data.medicationId) {
    router.push({
      pathname: "/patient/medication/[id]",
      params: { id: data.medicationId as string },
    });
  }

  if (data.screen === "chat" && data.roomId) {
    router.push({
      pathname: "/patient/caregiver/chat",
      params: { roomId: data.roomId as string },
    });
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  await Notifications.setNotificationChannelAsync("medications", {
    name: "Medication Alerts",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  });

  // FIX FE-3 — Project ID from app config, not hardcoded in source.
  // Set extra.eas.projectId in app.json / app.config.js.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    if (__DEV__) console.warn("⚠️  EAS projectId not found in app config");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}
