import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { auth } from "../firebase/firebase";

// 🔒 Keep native splash visible until we say otherwise
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  // 🎬 animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // 🔁 Play logo animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    let handled = false;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (handled) return;
      handled = true;

      // ⛔ hide native splash only AFTER auth resolves
      await SplashScreen.hideAsync();

      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    });

    return unsub;
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo.png")}
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },
});
