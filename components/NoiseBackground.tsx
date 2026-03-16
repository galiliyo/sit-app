import { Image, StyleSheet, View } from "react-native";

const paperBg = require("../assets/images/paper_bg.jpg");

export function NoiseBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image source={paperBg} style={styles.image} resizeMode="cover" />
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
  },
});
