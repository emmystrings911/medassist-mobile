// hooks/useNotifications.ts
import { getSocket } from "@/services/socket";
import { useEffect } from "react";

export const useNotifications = (onReceive: any) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("notification", (data) => {
      onReceive(data);
    });

    return () => {
      socket.off("notification");
    };
  }, []);
};
