import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

interface ButtonLoadingProps {
  animationSource?: any;
  containerStyle?: ViewStyle;
  size?: number;
  color?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  animationSource = require("@/assets/lotties/loading.json"),
  containerStyle,
  size = 30,
  color,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={[styles.animation, { width: size, height: size }]}
        colorFilters={color ? [{ keypath: "**", color }] : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: 30,
    height: 30,
  },
});
