import { api } from "./api";

export const getNotifications = async () => {
  return api.get("/notifications");
};

export const sendTestPush = async (expoPushToken: string) => {
  try {
    await fetch("http://10.167.73.4:5000/api/notifications/test-push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: expoPushToken,
      }),
    });
    console.log("Test push sent");
  } catch (err) {
    console.log("❌ Test push error:", err);
  }
};
export const markAsRead = async (id: string) => {
  return api.patch(`/notifications/${id}/read`);
};
