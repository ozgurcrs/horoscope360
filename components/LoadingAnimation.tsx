import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

interface LoadingAnimationProps {
  animationSource?: any; // Lottie animasyon kaynağı
  containerStyle?: ViewStyle;
  size?: number;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  animationSource = require("@/assets/lotties/loading.json"),
  containerStyle,

  size = 150,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={[styles.animation, { width: size, height: size }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  animation: {
    width: 150,
    height: 150,
  },
});
