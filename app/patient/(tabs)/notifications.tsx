import { NotificationCard } from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import { getNotifications, markAsRead } from "@/services/notification.service";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [banner, setBanner] = useState<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadNotifications();

    const sub = Notifications.addNotificationReceivedListener((notif) => {
      setBanner({
        title: notif.request.content.title,
        body: notif.request.content.body,
      });

      // auto hide
      setTimeout(() => setBanner(null), 4000);
    });

    return () => sub.remove();
  }, []);

  const loadNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data.data);
  };

  // 🔴 REAL-TIME UPDATE
  useNotifications((newNotif: any) => {
    setNotifications((prev) => [
      {
        ...newNotif,
        _id: Date.now().toString(), // temp id
        read: false,
      },
      ...prev,
    ]);
  });

  const handleRead = async (id: string) => {
    await markAsRead(id);

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <View style={{ padding: 20, marginTop: 15 }}>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "bold" }}>
          Notifications 🔔
        </Text>

        <Text style={{ color: theme.subText }}>{unreadCount} unread</Text>
      </View>
      {banner && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            backgroundColor: theme.surfaceElevated,
            padding: 14,
            borderRadius: 12,
            zIndex: 999,
          }}
        >
          <Text style={{ color: theme.buttonText, fontWeight: "bold" }}>
            {banner.title}
          </Text>
          <Text style={{ color: theme.subText }}>{banner.body}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <NotificationCard item={item} onRead={handleRead} />
        )}
      />
    </View>
  );
}
