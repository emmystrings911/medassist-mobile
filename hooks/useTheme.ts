import { darkTheme, lightTheme } from "@/constants/theme";
import { getSavedTheme, saveTheme } from "@/utils/themeStorage";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export function useTheme() {
  const system = useColorScheme(); // "light" | "dark" | null

  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<any>({});

  const resolveMode = (m: ThemeMode) => {
    if (m === "system") return system ?? "light";
    return m;
  };

  const setThemeMode = async (m: ThemeMode) => {
    setMode(m);
    await saveTheme(m);
  };

  useEffect(() => {
    (async () => {
      const saved = await getSavedTheme();
      if (saved) setMode(saved as ThemeMode);
    })();
  }, []);

  useEffect(() => {
    const active = resolveMode(mode);

    setTheme(active === "dark" ? darkTheme : lightTheme);
  }, [mode, system]);

  return {
    theme,
    mode,
    setThemeMode,
  };
}
