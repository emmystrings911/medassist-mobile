import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { PanResponder, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function VoiceRecorder({ onSend }: any) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [bars, setBars] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);

  const intervalRef = useRef<any>(null);

  // 🎚️ waveform amplitude
  const amplitude = useSharedValue(10);

  // =========================
  // 📊 LIVE WAVEFORM
  // =========================
  useEffect(() => {
    if (!isRecording || !recording) return;

    intervalRef.current = setInterval(async () => {
      try {
        const status = await recording.getStatusAsync();

        // ✅ REAL MIC METERING
        const metering =
          "metering" in status && status.metering
            ? Math.max(5, status.metering + 60)
            : Math.random() * 30 + 10;

        amplitude.value = withTiming(metering);

        setBars((prev) => [...prev.slice(-35), metering]);
      } catch (err) {
        console.log("Metering error:", err);
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [isRecording, recording]);

  // =========================
  // 🎙️ START RECORDING
  // =========================
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const rec = new Audio.Recording();

      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      // ✅ enable live status updates
      rec.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;

        // 🎚️ real mic level
        const metering = status.metering ?? -160;

        // normalize
        const normalized = Math.max(8, (metering + 160) / 4);

        setBars((prev) => [...prev.slice(-25), normalized]);
      });

      rec.setProgressUpdateInterval(100);

      await rec.startAsync();

      setRecording(rec);
      setIsRecording(true);

      console.log("🎙️ Recording started");
    } catch (err) {
      console.log("Recording error:", err);
    }
  };

  // =========================
  // 🛑 STOP RECORDING
  // =========================
  const stopRecording = async () => {
    try {
      if (!recording) return;

      clearInterval(intervalRef.current);

      await recording.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();

      console.log("🎵 AUDIO URI:", uri);

      setRecording(null);
      setIsRecording(false);
      setLocked(false);
      setBars([]);

      if (uri) {
        onSend(uri);
      }
    } catch (err) {
      console.log("Stop recording error:", err);
    }
  };

  // =========================
  // ❌ CANCEL RECORDING
  // =========================
  const cancelRecording = async () => {
    try {
      if (!recording) return;

      clearInterval(intervalRef.current);

      await recording.stopAndUnloadAsync();

      setRecording(null);
      setIsRecording(false);
      setLocked(false);
      setBars([]);

      console.log("❌ Recording cancelled");
    } catch (err) {
      console.log("Cancel recording error:", err);
    }
  };

  // =========================
  // 🔒 SWIPE UP TO LOCK
  // =========================
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        // 🔒 LOCK
        if (gesture.dy < -80 && isRecording) {
          setLocked(true);
        }

        // ❌ CANCEL
        if (gesture.dx < -120 && isRecording) {
          cancelRecording();
        }
      },

      onPanResponderRelease: () => {
        if (!locked && isRecording) {
          stopRecording();
        }
      },
    }),
  ).current;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* 🎤 BUTTON */}
      <TouchableOpacity
        onPressIn={startRecording}
        delayLongPress={150}
        style={{
          backgroundColor: isRecording ? "#ef4444" : "#22c55e",
          padding: 14,
          borderRadius: 30,
        }}
        {...panResponder.panHandlers}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          {isRecording ? "🎙️" : "🎤"}
        </Text>
      </TouchableOpacity>

      {/* 📊 WAVEFORM */}
      {isRecording && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 12,
            height: 45,
          }}
        >
          {bars.map((b, i) => (
            <WaveBar key={i} height={b} />
          ))}

          <Text
            style={{
              color: locked ? "#22c55e" : "#aaa",
              marginLeft: 10,
              fontSize: 12,
            }}
          >
            {locked ? "🔒 Locked" : "⬆️ Swipe up to lock"}
          </Text>
        </View>
      )}
    </View>
  );
}

function WaveBar({ height }: any) {
  const h = useSharedValue(10);

  useEffect(() => {
    h.value = withTiming(height, {
      duration: 80,
    });
  }, [height]);

  const style = useAnimatedStyle(() => ({
    height: h.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          marginHorizontal: 1,
          backgroundColor: "#22c55e",
          borderRadius: 10,
          alignSelf: "center",
        },
        style,
      ]}
    />
  );
}
