import { api } from "@/api/client";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

const SOUNDS = [
  { id: "default", label: "Default" },
  { id: "bell", label: "Tile game" },
  { id: "chime", label: "Digital tone" },
  { id: "quicktone", label: "Quick tone" },
];

const SOUND_MAP: Record<string, any> = {
  bell: require("../../assets/sounds/tile-game.wav"),
  chime: require("../../assets/sounds/digital-tone.wav"),
  quicktone: require("../../assets/sounds/quick-tone.wav"),
};

export default function NotificationSoundScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState("default");
  const [playing, setPlaying] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.data?.notificationSound) {
          setSelected(res.data.notificationSound);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPreference();
  }, []);
  const pulse = useRef(new Animated.Value(1)).current;

  /* -------------------- Sound Preview -------------------- */
  const playSound = async (soundId: string) => {
    if (playing) {
      await playing.unloadAsync();
      setPlaying(null);
    }

    pulse.setValue(1);

    if (soundId === "default") return;

    const { sound } = await Audio.Sound.createAsync(SOUND_MAP[soundId]);
    await sound.setVolumeAsync(volume);
    setPlaying(sound);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    await sound.playAsync();
  };

  /* -------------------- Save Preference -------------------- */
  const save = async () => {
    await api.patch("/users/preferences", {
      notificationSound: selected,
    });
    router.push("/(tabs)/profile");
  };

  /* -------------------- Cleanup -------------------- */
  useEffect(() => {
    return () => {
      if (playing) {
        playing.unloadAsync();
      }
    };
  }, [playing]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* ---------- Header ---------- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,

          borderBottomWidth: 1,
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
        }}
      >
        <Pressable onPress={() => router.push("/profile")}>
          <Text
            style={{
              fontSize: 22,
              marginRight: 12,
              color: "#0F172A",
            }}
          >
            ←
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#0F172A",
          }}
        >
          Notification Sound
        </Text>
      </View>

      {/* ---------- Content ---------- */}
      <View style={{ padding: 20 }}>
        <Text
          style={{
            color: "#64748B",
            marginBottom: 16,
          }}
        >
          Choose how your medication reminders sound
        </Text>

        {SOUNDS.map((sound) => {
          const isSelected = selected === sound.id;

          return (
            <Pressable
              key={sound.id}
              onPress={() => {
                setSelected(sound.id);
                playSound(sound.id);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 14,
                backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                borderColor: isSelected ? "#2563EB" : "#E5E7EB",

                borderWidth: 1,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#0F172A",
                }}
              >
                {sound.label}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {isSelected && playing && sound.id !== "default" && (
                  <Animated.View
                    style={{
                      marginRight: 12,
                      transform: [{ scale: pulse }],
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>🔊</Text>
                  </Animated.View>
                )}

                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? "#2563EB" : "#CBD5E1",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#2563EB",
                      }}
                    />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* ---------- Volume Slider ---------- */}
        <View style={{ marginTop: 28 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 10,
              color: "#0F172A",
            }}
          >
            Preview volume
          </Text>

          <Slider
            value={volume}
            onValueChange={async (v) => {
              setVolume(v);
              if (playing) {
                await playing.setVolumeAsync(v);
              }
            }}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            minimumTrackTintColor="#2563EB"
            maximumTrackTintColor="#CBD5E1"
            thumbTintColor="#2563EB"
          />
        </View>

        {/* ---------- Save ---------- */}
        <Pressable
          onPress={save}
          style={{
            backgroundColor: "#2563EB",
            padding: 16,
            borderRadius: 14,
            marginTop: 32,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Save sound
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
