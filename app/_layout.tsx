import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, Fragment } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/context/UserContext";

import { Platform, Text as RNText, TextProps } from "react-native";

import "../global.css";
import { countUser } from "./services/userCounter";

SplashScreen.preventAutoHideAsync();

const Text = (props: TextProps) => {
  const { style, ...otherProps } = props;

  return (
    <RNText
      {...otherProps}
      style={[
        {
          fontSize: Platform.OS === "android" ? 14 : 16,
          lineHeight: Platform.OS === "android" ? 20 : 22,
        },
        style,
      ]}
    />
  );
};

export { Text };

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    KaushanScript: require("../assets/fonts/KaushanScript-Regular.ttf"),
    PromptRegular: require("../assets/fonts/Prompt-Regular.ttf"),
    PromptSemiBold: require("../assets/fonts/Prompt-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});

      countUser().catch((err: any) => console.log("Sayım başlatılamadı", err));
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Fragment>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </Fragment>
      </GestureHandlerRootView>
    </UserProvider>
  );
}
