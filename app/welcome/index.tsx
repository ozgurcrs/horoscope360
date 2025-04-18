import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Animated,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { UserInfoForm } from "@/components/UserInfoForm";
import { useRouter } from "expo-router";
import { useWelcome } from "@/hooks/useWelcome";

const { width, height } = Dimensions.get("window");

const snapPoints = Platform.OS === "android" ? [0.85, 0.95] : [0.7, 0.95];

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const {
    handleSaveUser,
    handleCloseBottomSheet,
    isLoadingWelcomePage,
    bottomSheetRef,
    handleLogoPress,
  } = useWelcome();
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmitUserInfo = async (data: any) => {
    await handleSaveUser(data);
    router.push("/(tabs)");
  };

  // handleOpenBottomSheet fonksiyonunda değişiklik
  const handleOpenBottomSheet = () => {
    console.log("BottomSheet'i açmaya çalışıyorum");

    // Android için daha yüksek bir değer kullan
    const openPoint = Platform.OS === "android" ? 0.95 : 0.9;
    bottomSheetRef.current?.scrollTo(openPoint);

    setTimeout(() => {
      console.log("BottomSheet aktif mi:", bottomSheetRef.current?.isActive());
    }, 500);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#2A004E",
        paddingVertical: Platform.OS === "android" ? 16 : 20,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingTop: Platform.OS === "android" ? 20 : 40,
            paddingBottom: Platform.OS === "android" ? 30 : 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={handleLogoPress}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{
                width: Platform.OS === "android" ? width * 0.6 : width * 0.7,
                height:
                  Platform.OS === "android" ? height * 0.15 : height * 0.2,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>

          <Animated.Text
            style={{
              opacity: fadeAnim,
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 20,
            }}
          >
            Günlük Burç Yorumları
          </Animated.Text>

          <View style={styles.starsContainer}>
            <LottieView
              source={require("../../assets/lotties/stars.json")}
              autoPlay
              loop
              style={styles.starsAnimation}
            />
          </View>

          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingHorizontal: 20,
              },
            ]}
          >
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="star" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Günlük Burç Yorumları</Text>
                <Text style={styles.featureDescription}>
                  Her gün güncellenen detaylı burç analizleri
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="heart" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Uyumluluk Testleri</Text>
                <Text style={styles.featureDescription}>
                  İlişki ve uyum analizleri
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="color-palette" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Kişilik Renk Testi</Text>
                <Text style={styles.featureDescription}>
                  Renklerle kişiliğinizi keşfedin
                </Text>
              </View>
            </View>
          </Animated.View>

          <View
            style={{
              position: "absolute",
              bottom: Platform.OS === "android" ? 30 : 50,
              width: "100%",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#9061F9",
                paddingVertical: Platform.OS === "android" ? 12 : 14,
                paddingHorizontal: 30,
                borderRadius: 30,
                width: Platform.OS === "android" ? "85%" : "80%",
                alignItems: "center",
                marginBottom: Platform.OS === "android" ? 25 : 40,
              }}
              onPress={handleOpenBottomSheet}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: Platform.OS === "android" ? 16 : 18,
                  fontWeight: "600",
                }}
              >
                Keşfetmeye Başla
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints} // Platform bazlı snapPoints kullan
        title="Kişisel Bilgiler"
        onClose={handleCloseBottomSheet}
      >
        <UserInfoForm
          onSubmit={handleSubmitUserInfo}
          isLoading={isLoadingWelcomePage}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  starsContainer: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.6,
  },
  starsAnimation: {
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#D5C2FF",
    textAlign: "center",
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(144, 97, 249, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#D5C2FF",
  },
  startButton: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: width - 48,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 24,
  },
});
