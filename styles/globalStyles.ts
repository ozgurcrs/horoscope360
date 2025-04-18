import { Platform, StyleSheet } from "react-native";

export const fontSizes = {
  small: Platform.OS === "android" ? 12 : 14,
  regular: Platform.OS === "android" ? 14 : 16,
  medium: Platform.OS === "android" ? 16 : 18,
  large: Platform.OS === "android" ? 18 : 20,
  xlarge: Platform.OS === "android" ? 22 : 24,
};

export const globalStyles = StyleSheet.create({
  text: {
    fontSize: fontSizes.regular,
    fontFamily: Platform.OS === "android" ? "Roboto" : "System",
  },
  heading: {
    fontSize: fontSizes.large,
    fontWeight: "bold",
    fontFamily: Platform.OS === "android" ? "Roboto" : "System",
  },
});
