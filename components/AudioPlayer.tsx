import { Audio } from "expo-av";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function AudioPlayer({ uri }: { uri: string }) {
  const [sound, setSound] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      setPlaying(true);

      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TouchableOpacity onPress={play}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: "white", marginRight: 10 }}>
          {playing ? "⏸" : "▶"}
        </Text>

        {/* 🎵 Waveform */}
        <View style={{ flexDirection: "row", gap: 2 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 3,
                height: Math.random() * 20 + 5,
                backgroundColor: playing ? "#22c55e" : "#aaa",
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
