import IncomingCallModal from "@/components/IncomingCallModal";
import { useAuth } from "@/hooks/useAuth";
import { playRingtone, stopRingtone } from "@/utils/ringtone";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type IncomingCallType = {
  from: string;
  offer: any;
  roomId: string;
  callType: "audio" | "video";
} | null;

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: any) {
  const [socket, setSocket] = useState<Socket | null>(null);

  // ✅ INCOMING CALL STATE
  const [incomingCall, setIncomingCall] = useState<IncomingCallType>(null);

  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        // ✅ NO TOKEN = NO SOCKET
        if (!token) {
          socketRef.current?.removeAllListeners();
          socketRef.current?.disconnect();

          socketRef.current = null;
          setSocket(null);

          return;
        }

        // ✅ DESTROY OLD SOCKET
        if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }

        const s = io("http://10.143.246.4:5000", {
          auth: { token },

          transports: ["websocket"],

          reconnection: true,
          reconnectionAttempts: Infinity,

          forceNew: true,
          autoConnect: true,
        });

        socketRef.current = s;

        setSocket(s);

        s.on("connect", () => {
          console.log("🟢 Socket connected:", s.id);
        });

        s.on("disconnect", () => {
          console.log("🔴 Socket disconnected");
        });

        s.on("connect_error", (err) => {
          console.log("Socket connect error:", err.message);
        });

        // =========================
        // 📞 INCOMING CALL
        // =========================
        s.on("incoming_call", async (payload: any) => {
          if (!payload || !payload.from) return;

          setIncomingCall({
            from: payload.from,
            offer: payload.offer,
            roomId: payload.roomId,
            callType: payload.callType || "video",
          });

          await playRingtone();
        });

        s.on("call_ended", async () => {
          await stopRingtone();
          setIncomingCall(null);
        });
      } catch (err) {
        console.log("Socket init error:", err);
      }
    };

    init();

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
    };
  }, [user]);

  // =========================
  // ✅ ACCEPT CALL
  // =========================
  const acceptCall = async () => {
    try {
      if (!incomingCall) return;

      await stopRingtone();

      router.push({
        pathname: "/patient/caregiver/callScreen",
        params: {
          targetId: incomingCall.from,
          isCaller: "false",
          offer: JSON.stringify(incomingCall.offer),
          roomId: incomingCall.roomId,
          callType: incomingCall.callType,
        },
      });

      setIncomingCall(null);
    } catch (err) {
      console.log("Accept call error:", err);
    }
  };

  // =========================
  // ❌ DECLINE CALL
  // =========================
  const declineCall = async () => {
    try {
      if (!incomingCall) return;

      await stopRingtone();

      socketRef.current?.emit("end_call", {
        to: incomingCall.from,
      });

      socketRef.current?.emit("missed_call", {
        to: incomingCall.from,
        roomId: incomingCall.roomId,
        callType: incomingCall.callType,
      });

      setIncomingCall(null);
    } catch (err) {
      console.log("Decline call error:", err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}

      {/* 📞 GLOBAL INCOMING CALL UI */}
      <IncomingCallModal
        visible={!!incomingCall}
        callerName={
          incomingCall?.callType === "audio"
            ? "Incoming voice call"
            : "Incoming video call"
        }
        onAccept={acceptCall}
        onDecline={declineCall}
      />
    </SocketContext.Provider>
  );
}
