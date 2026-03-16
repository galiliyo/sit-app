import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

const paperBg = require("../assets/images/paper_bg.jpg");

export function NoiseBackground() {
  const { width, height } = useWindowDimensions();
  // Rotate the landscape image 90° so it always appears portrait.
  // After rotation the axes swap, so we size the image to height×width
  // and center it with a translate.
  const longer = Math.max(width, height);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={paperBg}
        resizeMode="cover"
        style={{
          width: longer,
          height: longer,
          transform: [{ rotate: "90deg" }],
        }}
      />
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
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
