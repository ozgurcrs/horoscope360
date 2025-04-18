import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useAstrology from "@/hooks/useAstrology";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import DailyColorEnergy from "@/app/colorenergy";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export default function HomeScreen() {
  const [expandedHoroscope, setExpandedHoroscope] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const { userInfo, clearUserInfo } = useUser();

  const {
    dailyHoroscope,
    loading: horoscopeLoading,
    dailyPlanetPositions,
    moonPhase,
    weeklyForecast,
  } = useAstrology();

  // Tarih formatı
  const formattedDate = format(new Date(), "dd MMMM yyyy", { locale: tr });
  const dayName = format(new Date(), "EEEE", { locale: tr });

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Tüm verileriniz silinecek. Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace("/welcome");
          } catch (error) {
            console.error("Çıkış yapılırken hata oluştu:", error);
          }
        },
      },
    ]);
  };

  const handleLogoPress = () => {
    setTapCount((prev) => prev + 1);

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    if (tapCount + 1 >= 5) {
      console.log("5 kez tıklandı, tüm verileri silme işlemi başlatılıyor");
      Alert.alert(
        "Geliştirici Modu",
        "Tüm verileri silmek istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel", onPress: () => setTapCount(0) },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              try {
                await clearUserInfo(); // UserContext'teki clearUserInfo fonksiyonunu çağır
                console.log(
                  "Veriler silindi, welcome ekranına yönlendiriliyor"
                );
                router.replace("/welcome");
              } catch (error) {
                console.error("Veri silme hatası:", error);
              }
              setTapCount(0);
            },
          },
        ]
      );
    } else {
      tapTimeout.current = setTimeout(() => {
        setTapCount(0);
      }, 1500);
    }
  };

  console.log({ userInfo });

  return (
    <LinearGradient
      colors={["#2A004E", "#4A0072", "#2A004E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {horoscopeLoading ? (
          <LoadingAnimation containerStyle={styles.loadingContainer} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={handleLogoPress}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.logo}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => router.push("/welcome")}
            >
              <View style={styles.dateHeader}>
                <Text style={styles.dayText}>{dayName}</Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <Text style={styles.greetingText}>
              Merhaba, {userInfo?.fullName}
            </Text>

            <View style={styles.zodiacCard}>
              <View style={styles.zodiacIconContainer}>
                <Text style={styles.zodiacIconText}>♌</Text>
              </View>
              <View style={styles.zodiacInfo}>
                <Text style={styles.zodiacTitle}>
                  {userInfo?.horoscope.sunSign}
                </Text>
                <Text style={styles.compatibilityText}>
                  {userInfo?.horoscope.ascendantSign} ile uyumlu
                </Text>
              </View>
            </View>

            <View style={styles.horoscopeCard}>
              <View style={styles.horoscopeHeader}>
                <Text style={styles.horoscopeTitle}>Günlük Burç Yorumum</Text>
                <TouchableOpacity style={styles.todayButton}>
                  <Ionicons name="calendar" size={16} color="#FFFFFF" />
                  <Text style={styles.todayButtonText}>Bugün</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.detailedText}
              </Text>

              <View style={styles.topicsContainer}>
                <View style={styles.topicChip}>
                  <Ionicons name="heart" size={14} color="#FF6B6B" />
                  <Text style={styles.topicText}>Aşk</Text>
                </View>
                <View style={styles.topicChip}>
                  <Ionicons name="briefcase" size={14} color="#4ECDC4" />
                  <Text style={styles.topicText}>Kariyer</Text>
                </View>
                <View style={styles.topicChip}>
                  <Ionicons name="fitness" size={14} color="#FFD166" />
                  <Text style={styles.topicText}>Sağlık</Text>
                </View>
              </View>

              {expandedHoroscope && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailSection}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="heart" size={18} color="#FF6B6B" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailTitle}>Aşk</Text>
                      <Text style={styles.detailText}>
                        {dailyHoroscope?.love}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="briefcase" size={18} color="#4ECDC4" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailTitle}>Kariyer</Text>
                      <Text style={styles.detailText}>
                        {dailyHoroscope?.career}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="fitness" size={18} color="#FFD166" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailTitle}>Sağlık</Text>
                      <Text style={styles.detailText}>
                        {dailyHoroscope?.health}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setExpandedHoroscope(!expandedHoroscope)}
              >
                <Text style={styles.detailButtonText}>
                  {expandedHoroscope ? "Özeti Göster" : "Detaylı Yorum"}
                </Text>
                <Ionicons
                  name={expandedHoroscope ? "chevron-up" : "chevron-forward"}
                  size={14}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Günlük Gezegen Konumları</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Senin Enerjin</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.planetsScrollView}
            >
              {dailyPlanetPositions.map((planet, index) => (
                <View key={index} style={styles.planetCard}>
                  <View style={styles.planetIconContainer}>
                    <Ionicons
                      name={planet.icon as any}
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetPosition}>{planet.sign}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.moonPhaseCard}>
              <Text style={styles.moonPhaseText}>
                Ay Evresi: {moonPhase?.phase}
              </Text>
              <Text style={styles.moonPhaseDate}>{moonPhase?.date}</Text>
              <Text style={styles.moonPhaseDescription}>
                {moonPhase?.description}
              </Text>
              <TouchableOpacity style={styles.moonCalendarButton}>
                <Text style={styles.moonCalendarText}>Ay Takvimi</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push("/colorenergy")}>
              <DailyColorEnergy />
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Haftalık Öngörüler</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Haftalık</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weeklyForecastCard}>
              <Text style={styles.weeklyForecastTitle}>
                {weeklyForecast?.title}
              </Text>
              <Text style={styles.weeklyForecastText}>
                {weeklyForecast?.text}
              </Text>
              <TouchableOpacity style={styles.weeklyDetailButton}>
                <Text style={styles.weeklyDetailButtonText}>
                  Pazartesi Günleri Yenilenir
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 90 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {showSettingsModal && (
        <Modal
          visible={showSettingsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ayarlar</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LinearGradient
                  colors={["#4A0072", "#2A004E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoutGradient}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.logoutIcon}
                  />
                  <Text style={styles.logoutText}>Çıkış Yap</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.logoutDescription}>
                Çıkış yaptığınızda tüm bilgileriniz cihazınızdan silinecek ve
                yeniden başlamanız gerekecektir.
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {showProfileMenu && (
        <Animated.View style={styles.profileMenuContainer}>
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF9ED8" />
            <Text style={styles.profileMenuItemText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateHeader: {
    marginBottom: 16,
  },
  dayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  greetingText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  zodiacCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(114, 45, 159, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  zodiacIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  zodiacIconText: {
    fontSize: 24,
    color: "#6A0DAD",
  },
  zodiacInfo: {
    flex: 1,
  },
  zodiacTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  compatibilityText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  horoscopeCard: {
    backgroundColor: "rgba(70, 26, 100, 1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  horoscopeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  horoscopeTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  todayButtonText: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontSize: 12,
  },
  horoscopeText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 20,
  },
  topicsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  topicText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 12,
  },
  detailButtonText: {
    color: "#FFFFFF",
    marginRight: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  seeAllText: {
    color: "#9061F9",
    fontSize: 12,
  },
  planetsScrollView: {
    marginBottom: 20,
  },
  planetCard: {
    backgroundColor: "rgba(114, 45, 159, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 110,
    alignItems: "center",
  },
  planetIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(144, 97, 249, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  planetName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  planetPosition: {
    color: "#FFFFFF",
    fontSize: 10,
    opacity: 0.8,
  },
  moonPhaseCard: {
    backgroundColor: "rgba(114, 45, 159, 0.6)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  moonPhaseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  moonPhaseDate: {
    color: "#FFFFFF",
    fontSize: 11,
    marginTop: 4,
  },
  moonPhaseDescription: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 20,
  },
  moonCalendarButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 14,
  },
  moonCalendarText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  tarotCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    marginVertical: 20,
  },
  tarotIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tarotTextContainer: {
    flex: 1,
  },
  tarotTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  tarotDescription: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.9,
  },
  weeklyForecastCard: {
    backgroundColor: "rgba(114, 45, 159, 0.6)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  weeklyForecastTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  weeklyForecastText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 14,
  },
  weeklyDetailButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  weeklyDetailButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  expandedDetails: {
    marginTop: 16,
    marginBottom: 16,
  },
  detailSection: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 20,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  logo: {
    width: 160,
    height: 160,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    width: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#2A004E",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  logoutDescription: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 12,
  },
  profileMenuContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(42, 0, 78, 0.95)",
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "rgba(255, 158, 216, 0.3)",
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  profileMenuItemText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "500",
  },
});
