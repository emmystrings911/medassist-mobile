import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

export const playRingtone = async () => {
  sound = new Audio.Sound();

  await sound.loadAsync(require("../assets/sounds/quick-tone.wav")); // 👈 add file
  await sound.setIsLoopingAsync(true);
  await sound.playAsync();
};

export const stopRingtone = async () => {
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
    sound = null;
  }
};
