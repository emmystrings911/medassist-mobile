export const NOTIFICATION_SOUNDS = [
  { label: "Default", value: "default" },
  { label: "Calm", value: "simple-tone.wav" },
  { label: "Alert", value: "quick-tone.wav" },
  { label: "Software", value: "software.wav" },
  { label: "Tile", value: "tile.wav" },
];

export const SOUND_MAP: Record<string, any> = {
  default: require("../assets/sounds/digital-tone.wav"),
  "simple-tone.wav": require("../assets/sounds/simple-tone.wav"),
  "quick-tone.wav": require("../assets/sounds/quick-tone.wav"),
  "software.wav": require("../assets/sounds/software.wav"),
  "tile.wav": require("../assets/sounds/tile-game.wav"),
};
