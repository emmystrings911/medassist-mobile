import { darkTheme, lightTheme } from "@/constants/theme";
import { getSavedTheme, saveTheme } from "@/utils/themeStorage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  theme: typeof lightTheme;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();

  const [mode, setMode] = useState<ThemeMode>("system");

  // load saved preference
  useEffect(() => {
    (async () => {
      const saved = await getSavedTheme();
      if (saved === "light" || saved === "dark" || saved === "system") {
        setMode(saved);
      } else {
        setMode("system");
      }
    })();
  }, []);

  // resolved actual theme
  const resolvedMode: "light" | "dark" = useMemo(() => {
    if (mode === "system") {
      return system === "dark" ? "dark" : "light";
    }
    return mode;
  }, [mode, system]);

  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    await saveTheme(newMode);
  };

  const toggleTheme = async () => {
    const next = resolvedMode === "dark" ? "light" : "dark";
    await setThemeMode(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        resolvedMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
