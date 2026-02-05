import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SLIDES } from "./data";
import { OnboardingSlide } from "./OnboardingSlide";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem("onboarded", "true");
    router.replace("/auth/signUp");
  };

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        {/* DOTS */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.activeDot]}
            />
          ))}
        </View>

        {/* BUTTON */}
        <Pressable
          onPress={() => {
            if (index < SLIDES.length - 1) {
              flatListRef.current?.scrollToIndex({
                index: index + 1,
                animated: true,
              });
            } else {
              finish();
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {index === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    backgroundColor: "white",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 18,
    backgroundColor: "#2563EB",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
