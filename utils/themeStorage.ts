import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "APP_THEME";

export type ThemeMode = "light" | "dark" | "system";

export const saveTheme = async (theme: ThemeMode) => {
  await AsyncStorage.setItem(THEME_KEY, theme);
};

export const getSavedTheme = async (): Promise<ThemeMode | null> => {
  return (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null;
};
