import { Image, StyleSheet, View } from "react-native";

const noiseTexture = require("../assets/textures/noise-scratches.png");

export function NoiseBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image source={noiseTexture} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
});
