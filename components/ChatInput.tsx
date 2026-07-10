import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  text: string;
  setText: (text: string) => void;
  onSend: () => void;
  onTyping: (text: string) => void;
  onImage?: (uri: string) => void;
  onFile?: (file: any) => void; // ✅ NEW
  onAudio?: (uri: string) => void;
  replyingTo?: any;
  onCancelReply?: () => void;
};

export default function ChatInput({
  text,
  setText,
  onSend,
  onTyping,
  onImage,
  onFile,
  onAudio,
  replyingTo,
  onCancelReply,
}: Props) {
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [bars, setBars] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;

    if (isRecording) {
      interval = setInterval(() => {
        const value = Math.random() * 40 + 10;
        setBars((prev) => [...prev.slice(-25), value]);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  // ========================
  // 📷 PICK IMAGE
  // ========================
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) {
      const uri = res.assets[0].uri;
      onImage?.(uri);
    }
  };

  // ========================
  // 📎 PICK FILE
  // ========================
  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (res.assets && res.assets.length > 0) {
      onFile?.(res.assets[0]); // 👈 send full file object
    }
  };

  // ========================
  // 🎙️ RECORDING
  // ========================
  const startRecording = async () => {
    try {
      setCancelled(false);

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  };

  const pauseRecording = async () => {
    if (!recordingRef.current) return;

    await recordingRef.current.pauseAsync();
    setIsPaused(true);
  };

  const resumeRecording = async () => {
    if (!recordingRef.current) return;

    await recordingRef.current.startAsync();
    setIsPaused(false);
  };

  const stopRecording = async () => {
    clearInterval(intervalRef.current);

    if (!recordingRef.current) return;

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();

    setIsRecording(false);
    setBars([]);
    setLocked(false);

    if (!cancelled && uri) {
      setPreviewUri(uri);
    }

    recordingRef.current = null;
  };

  const sendAudio = () => {
    if (previewUri && onAudio) {
      onAudio(previewUri);
    }
    setPreviewUri(null);
  };

  const cancelRecording = async () => {
    if (!recordingRef.current) return;

    await recordingRef.current.stopAndUnloadAsync();

    recordingRef.current = null;
    setIsRecording(false);
    setBars([]);
    setCancelled(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isRecording,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < -50) setLocked(true);
        if (gesture.dx < -50) setCancelled(true);
      },

      onPanResponderRelease: async () => {
        if (cancelled) {
          await cancelRecording();
          return;
        }

        if (!locked) {
          await stopRecording();
        }
      },
    }),
  ).current;

  return (
    <View style={{ padding: 10, backgroundColor: "#111" }}>
      {/* 🔁 REPLY PREVIEW */}
      {replyingTo && (
        <View
          style={{
            backgroundColor: "#1f2937",
            padding: 8,
            borderLeftWidth: 3,
            borderColor: "#22c55e",
            marginBottom: 5,
          }}
        >
          <Text style={{ color: "#22c55e", fontSize: 12 }}>
            Replying to {replyingTo.senderName}
          </Text>
          <Text style={{ color: "#aaa" }} numberOfLines={1}>
            {replyingTo.message}
          </Text>

          <TouchableOpacity onPress={onCancelReply}>
            <Text style={{ color: "red", marginTop: 4 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🎧 AUDIO PREVIEW */}
      {previewUri && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "white" }}>Voice ready</Text>

          <TouchableOpacity onPress={sendAudio}>
            <Text style={{ color: "#22c55e", marginLeft: 10 }}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPreviewUri(null)}>
            <Text style={{ color: "red", marginLeft: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🎙️ RECORDING */}
      {isRecording && (
        <View
          style={{
            backgroundColor: "#1f2937",
            padding: 12,
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: "#22c55e",
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            🎙️ Recording {duration}s
          </Text>

          {/* 📊 AUDIO BARS */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              height: 40,
              marginBottom: 15,
            }}
          >
            {bars.map((b, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: b,
                  backgroundColor: "#22c55e",
                  marginRight: 2,
                  borderRadius: 4,
                }}
              />
            ))}
          </View>

          {/* 🎛️ CONTROLS */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* ⏸️ PAUSE */}
            <TouchableOpacity
              onPress={isPaused ? resumeRecording : pauseRecording}
            >
              <Text style={{ color: "white", fontSize: 16 }}>
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </Text>
            </TouchableOpacity>

            {/* ⏹️ STOP */}
            <TouchableOpacity onPress={stopRecording}>
              <Text style={{ color: "#22c55e", fontSize: 16 }}>⏹ Stop</Text>
            </TouchableOpacity>

            {/* ❌ CANCEL */}
            <TouchableOpacity onPress={cancelRecording}>
              <Text style={{ color: "red", fontSize: 16 }}>🗑 Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 💬 INPUT ROW */}
      {!isRecording && !previewUri && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* 📎 FILE */}
          <TouchableOpacity onPress={pickFile}>
            <Text style={{ color: "white", fontSize: 18 }}>📎</Text>
          </TouchableOpacity>

          {/* 📷 IMAGE */}
          <TouchableOpacity onPress={pickImage} style={{ marginLeft: 10 }}>
            <Text style={{ color: "white", fontSize: 18 }}>📷</Text>
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={(val) => {
              setText(val);
              onTyping(val);
            }}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            style={{
              flex: 1,
              backgroundColor: "#1f2937",
              color: "white",
              padding: 10,
              borderRadius: 10,
              marginHorizontal: 10,
            }}
          />

          {text.trim() ? (
            <TouchableOpacity onPress={onSend}>
              <Text style={{ color: "#22c55e" }}>Send</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPressIn={startRecording}>
              <Text style={{ color: "white", fontSize: 22 }}>🎤</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
