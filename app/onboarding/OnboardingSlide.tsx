import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function OnboardingSlide({ item }: any) {
  return (
    <View style={styles.container}>
      {/* IMAGE BACKGROUND */}
      <Image source={item.image} style={styles.image} />

      {/* WHITE CONTENT CARD */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
        <View style={styles.indicator} />

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
  },

  image: {
    height: height * 0.65,
    width: "100%",
    resizeMode: "cover",
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  description: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 22,
  },
});
