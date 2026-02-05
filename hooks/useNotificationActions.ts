import { api } from "@/api/client";
import * as Notifications from "expo-notifications";

export const listenToNotificationActions = () => {
  Notifications.addNotificationResponseReceivedListener(async (response) => {
    const action = response.actionIdentifier;
    const doseLogId = response.notification.request.content.data?.doseLogId;

    if (!doseLogId) return;

    if (action === "TAKE_NOW") {
      await api.post(`/schedules/${doseLogId}/taken`);
    }

    if (action === "SNOOZE_30") {
      await api.patch(`/schedules/${doseLogId}/snooze`, { minutes: 30 });
    }
  });
};
