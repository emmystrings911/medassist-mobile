import { useEffect, useRef } from "react";
import { Animated, ImageSourcePropType } from "react-native";

export default function OnboardingImage({
  source,
}: {
  source: ImageSourcePropType;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Image
      source={source}
      style={{
        flex: 1,
        width: 320,
        height: 360,
        resizeMode: "contain",
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}
