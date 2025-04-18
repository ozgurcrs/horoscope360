import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function TabLayout() {
  const { userInfo, isLoaded, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !userInfo) {
      console.log("Kullanıcı bilgisi yok, welcome sayfasına yönlendiriliyor");
      router.replace("/welcome");
    }
  }, [userInfo, isLoaded, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#2A004E",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(184, 191, 234, 0.6)",
        tabBarStyle: {
          backgroundColor: "#4C1F7A",
          borderTopColor: "rgba(131, 149, 255, 0.15)",
          borderTopWidth: 1,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Anasayfa",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tarot"
        options={{
          title: "Tarot",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="compatibility"
        options={{
          title: "Uyumluluk",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="colortest"
        options={{
          title: "Renk Testi",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "color-palette" : "color-palette-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
