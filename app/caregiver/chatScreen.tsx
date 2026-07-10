import { useSocket } from "@/utils/SocketProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { mediaDevices, RTCPeerConnection, RTCView } from "react-native-webrtc";

const pcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function CallScreen() {
  const { socket } = useSocket();

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const timeoutRef = useRef<any>(null);
  const [callAnswered, setCallAnswered] = useState(false);

  // ✅ CALL CONTROLS
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const params = useLocalSearchParams();
  const router = useRouter();

  const targetId = params.targetId as string;
  const roomId = params.roomId as string;
  const caregiverId = params.caregiverId as string;
  const patientId = params.patientId as string;
  const callType = params.callType as string;

  console.log("Call params:", params);

  const isCaller =
    params.isCaller === "true" ||
    (Array.isArray(params.isCaller) && params.isCaller[0] === "true");

  const offerParam = params.offer ? JSON.parse(params.offer as string) : null;

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      try {
        // 🎥 GET MEDIA
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video:
            callType === "video"
              ? {
                  facingMode: "user",
                }
              : false,
        });

        setLocalStream(stream);

        const pc = new RTCPeerConnection(pcConfig) as any;

        // 🎯 ADD TRACKS
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 🎧 REMOTE STREAM
        pc.ontrack = (event: any) => {
          if (event?.streams?.[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        // 🧊 ICE
        pc.addEventListener("icecandidate", (event: any) => {
          if (event?.candidate) {
            socket.emit("ice_candidate", {
              to: targetId,
              candidate: event.candidate,
            });
          }
        });

        pcRef.current = pc;

        // =========================
        // 📞 CALLER FLOW
        // =========================
        if (isCaller) {
          const offer = await pc.createOffer();

          await pc.setLocalDescription(offer);

          socket.emit("call_user", {
            to: targetId,
            offer,
            roomId,
            callType,
          });

          // ⏰ AUTO END AFTER 30s
          timeoutRef.current = setTimeout(() => {
            console.log("📵 emitting missed_call");
            if (!callAnswered) {
              socket.emit("missed_call", {
                to: targetId,
                roomId,
                callType,
              });

              handleLeaveCall(true);
            }
          }, 30000);
        }

        // =========================
        // 📥 RECEIVER FLOW
        // =========================
        if (!isCaller && offerParam) {
          await pc.setRemoteDescription(offerParam);

          const answer = await pc.createAnswer();

          await pc.setLocalDescription(answer);

          socket.emit("answer_call", {
            to: targetId,
            answer,
          });
        }

        // =========================
        // 📡 SOCKET EVENTS
        // =========================

        socket.on("call_answered", async (data: any) => {
          const { answer } = data;

          setCallAnswered(true);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          await pc.setRemoteDescription(answer);
        });

        socket.on("ice_candidate", async (data: any) => {
          const { candidate } = data;

          if (candidate) {
            await pc.addIceCandidate(candidate);
          }
        });

        socket.on("call_ended", () => {
          handleLeaveCall(false);
        });
      } catch (err) {
        console.log("Call init error:", err);
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [socket]);

  // =========================
  // 🧹 CLEANUP
  // =========================
  const cleanup = () => {
    try {
      pcRef.current?.close();
      pcRef.current = null;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      localStream?.getTracks().forEach((track: any) => {
        track.stop();
      });

      remoteStream?.getTracks?.().forEach((track: any) => {
        track.stop();
      });

      setLocalStream(null);
      setRemoteStream(null);
    } catch (err) {
      console.log("Cleanup error:", err);
    }
  };

  // =========================
  // ❌ LEAVE CALL
  // =========================
  const handleLeaveCall = (emit = true) => {
    try {
      if (emit) {
        socket?.emit("end_call", {
          to: targetId,
        });
      }

      cleanup();

      // ✅ RETURN TO CHAT
      router.push({
        pathname: "/caregiver/chat",
        params: {
          roomId,
          caregiverId,
          patientId,
        },
      });
    } catch (err) {
      console.log("End call error:", err);
    }
  };

  // =========================
  // 🎤 TOGGLE MUTE
  // =========================
  const toggleMute = () => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track: any) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  // =========================
  // 📷 TOGGLE CAMERA
  // =========================
  const toggleCamera = () => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track: any) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((prev) => !prev);
  };

  // =========================
  // 🔄 SWITCH CAMERA
  // =========================
  const switchCamera = () => {
    try {
      const videoTrack = localStream?.getVideoTracks?.()[0];

      if (videoTrack && videoTrack._switchCamera) {
        videoTrack._switchCamera();
        setIsFrontCamera((prev) => !prev);
      }
    } catch (err) {
      console.log("Switch camera error:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {/* 🎥 REMOTE */}
      {callType === "video" && remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ flex: 1 }}
          objectFit="cover"
        />
      )}

      {/* 📷 LOCAL */}
      {callType === "video" && localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{
            width: 120,
            height: 180,
            position: "absolute",
            top: 50,
            right: 10,
            borderRadius: 12,
            overflow: "hidden",
          }}
          objectFit="cover"
          mirror={isFrontCamera}
        />
      )}

      {callType === "audio" && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 30 }}>📞</Text>

          <Text
            style={{
              color: "white",
              fontSize: 22,
              marginTop: 20,
            }}
          >
            Audio Call
          </Text>
        </View>
      )}

      {/* 🎛️ CONTROLS */}
      <View
        style={{
          position: "absolute",
          bottom: 50,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        {/* 🎤 MUTE */}
        <TouchableOpacity
          onPress={toggleMute}
          style={{
            backgroundColor: isMuted ? "#ef4444" : "#1f2937",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>{isMuted ? "🔇" : "🎤"}</Text>
        </TouchableOpacity>

        {/* 📷 VIDEO CONTROLS */}
        {callType === "video" && (
          <>
            {/* 📷 CAMERA */}
            <TouchableOpacity
              onPress={toggleCamera}
              style={{
                backgroundColor: isCameraOff ? "#ef4444" : "#1f2937",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>{isCameraOff ? "🚫" : "📷"}</Text>
            </TouchableOpacity>

            {/* 🔄 SWITCH CAMERA */}
            <TouchableOpacity
              onPress={switchCamera}
              style={{
                backgroundColor: "#1f2937",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>🔄</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ❌ END */}
        <TouchableOpacity
          onPress={() => {
            if (!callAnswered && isCaller) {
              socket?.emit("missed_call", {
                to: targetId,
                roomId,
                callType,
              });
            }

            handleLeaveCall(true);
          }}
          style={{
            backgroundColor: "red",
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28 }}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
