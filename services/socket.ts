import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// FIX FE-6 — Socket URL from env var; no hardcoded localhost/IP
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_BASE_URL?.replace("/api", "");

// FIX FE-7 — Send JWT in handshake so server middleware can authenticate the socket.
// Previously the token was never sent, so every socket connection was rejected
// by the backend's jwt.verify() check with "Unauthorized".
export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await SecureStore.getItemAsync("token");

  socket = io(SOCKET_URL!, {
    transports: ["websocket"],
    auth: { token },         // ← JWT sent here; server reads socket.handshake.auth.token
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
