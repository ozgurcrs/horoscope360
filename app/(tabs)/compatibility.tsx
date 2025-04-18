import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateGeminiContent } from "@/api/api";
import { compatibilityPrompt } from "@/constants/prompts";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ButtonLoading } from "@/components/ButtonLoading";
import { useUser } from "@/context/UserContext";

interface PersonData {
  firstName: string;
  lastName: string;
  birthDate: Date;
}

interface CompatibilityResult {
  overallScore: number;
  description: string;
  areas: {
    title: string;
    score: number;
    description: string;
  }[];
}

const STORAGE_KEY_COMPATIBILITY_USAGE = "compatibility_daily_usage";
const STORAGE_KEY_COMPATIBILITY_HISTORY = "compatibility_history";

const MAX_HISTORY_ITEMS = 15;

const checkDailyUsageLimit = async () => {
  try {
    const storedData = await AsyncStorage.getItem(
      STORAGE_KEY_COMPATIBILITY_USAGE
    );

    if (!storedData) {
      return { canUse: true, remainingTests: 3 };
    }

    const usageData = JSON.parse(storedData);
    const today = new Date().toDateString();

    // Farklı gün kontrolü
    if (usageData.date !== today) {
      return { canUse: true, remainingTests: 3 };
    }

    if (usageData.count >= 3) {
      return { canUse: false, remainingTests: 0 };
    }

    return {
      canUse: true,
      remainingTests: 3 - usageData.count,
    };
  } catch (error) {
    console.error("Limit kontrolü yapılamadı:", error);
    return { canUse: true, remainingTests: 1 };
  }
};

const updateUsageCount = async () => {
  try {
    const today = new Date().toDateString();
    const storedData = await AsyncStorage.getItem(
      STORAGE_KEY_COMPATIBILITY_USAGE
    );

    let usageData = { date: today, count: 1 };

    if (storedData) {
      const currentData = JSON.parse(storedData);
      if (currentData.date === today) {
        usageData.count = currentData.count + 1;
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY_COMPATIBILITY_USAGE,
      JSON.stringify(usageData)
    );
  } catch (error) {
    console.error("Kullanım sayısı güncellenemedi:", error);
  }
};

const loadCompatibilityHistory = async () => {
  try {
    const historyData = await AsyncStorage.getItem(
      STORAGE_KEY_COMPATIBILITY_HISTORY
    );
    if (historyData) {
      return JSON.parse(historyData);
    }
    return [];
  } catch (error) {
    console.error("Geçmiş kayıt yüklenirken hata oluştu:", error);
    return [];
  }
};

const saveToHistory = async (
  userData: PersonData,
  partnerData: PersonData,
  result: CompatibilityResult
) => {
  try {
    const history = await loadCompatibilityHistory();

    const newHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      user: userData,
      partner: partnerData,
      result: result,
    };

    const existingIndex = history.findIndex(
      (item: HistoryItem) =>
        item.user.firstName.toLowerCase() ===
          userData.firstName.toLowerCase() &&
        item.user.lastName.toLowerCase() === userData.lastName.toLowerCase() &&
        item.partner.firstName.toLowerCase() ===
          partnerData.firstName.toLowerCase() &&
        item.partner.lastName.toLowerCase() ===
          partnerData.lastName.toLowerCase() &&
        new Date(item.user.birthDate).toDateString() ===
          new Date(userData.birthDate).toDateString() &&
        new Date(item.partner.birthDate).toDateString() ===
          new Date(partnerData.birthDate).toDateString()
    );

    if (existingIndex !== -1) {
      history[existingIndex] = {
        ...history[existingIndex],
        date: new Date().toISOString(),
        result: result,
      };
    } else {
      history.unshift(newHistoryItem);

      if (history.length > MAX_HISTORY_ITEMS) {
        history.pop();
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY_COMPATIBILITY_HISTORY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error("Geçmiş kaydedilirken hata oluştu:", error);
  }
};

interface HistoryItem {
  id: string;
  date: string;
  user: PersonData;
  partner: PersonData;
  result: CompatibilityResult;
}

const areSamePeople = (person1: PersonData, person2: PersonData): boolean => {
  const normalizedName1 = `${person1.firstName.toLowerCase().trim()} ${person1.lastName.toLowerCase().trim()}`;
  const normalizedName2 = `${person2.firstName.toLowerCase().trim()} ${person2.lastName.toLowerCase().trim()}`;
  const birthDate1 = new Date(person1.birthDate).toDateString();
  const birthDate2 = new Date(person2.birthDate).toDateString();

  return normalizedName1 === normalizedName2 && birthDate1 === birthDate2;
};

const areSameCouples = (
  couple1: [PersonData, PersonData],
  couple2: [PersonData, PersonData]
): boolean => {
  const [person1A, person1B] = couple1;
  const [person2A, person2B] = couple2;

  const normalMatch =
    areSamePeople(person1A, person2A) && areSamePeople(person1B, person2B);

  const reverseMatch =
    areSamePeople(person1A, person2B) && areSamePeople(person1B, person2A);

  return normalMatch || reverseMatch;
};

const checkExistingQuery = async (
  userData: PersonData,
  partnerData: PersonData
) => {
  try {
    const history = await loadCompatibilityHistory();
    const currentCouple: [PersonData, PersonData] = [userData, partnerData];

    const existingQuery = history.find((item: HistoryItem) =>
      areSameCouples(currentCouple, [item.user, item.partner])
    );

    return existingQuery;
  } catch (error) {
    console.error("Mevcut sorgu kontrolünde hata:", error);
    return null;
  }
};

const CompatibilityScreen: React.FC = () => {
  const [user, setUser] = useState<PersonData>({
    firstName: "",
    lastName: "",
    birthDate: new Date(1990, 0, 1),
  });

  const [partner, setPartner] = useState<PersonData>({
    firstName: "",
    lastName: "",
    birthDate: new Date(1990, 0, 1),
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [currentPerson, setCurrentPerson] = useState<"user" | "partner">(
    "user"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const animationRef = useRef<LottieView | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<any[]>([]);

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const { userInfo } = useUser();

  const formatDate = (date: Date) => {
    return format(date, "d MMMM yyyy", { locale: tr });
  };

  const openDatePicker = (person: "user" | "partner") => {
    setCurrentPerson(person);
    setTempDate(person === "user" ? user.birthDate : partner.birthDate);
    setShowDatePickerModal(true);
  };

  const handleConfirmDate = () => {
    const normalizedDate = new Date(tempDate);
    normalizedDate.setHours(12, 0, 0, 0);

    if (currentPerson === "user") {
      setUser({ ...user, birthDate: normalizedDate });
    } else {
      setPartner({ ...partner, birthDate: normalizedDate });
    }
    setShowDatePickerModal(false);
  };

  const handleTempDateChange = (event: any, date?: Date) => {
    if (date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0);
      setTempDate(normalizedDate);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!user.firstName || !user.lastName) {
        alert("Lütfen adınızı ve soyadınızı girin");
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!partner.firstName || !partner.lastName) {
        alert("Lütfen diğer kişinin adını ve soyadını girin");
        return;
      }
      calculateCompatibility();
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const calculateCompatibility = async () => {
    try {
      if (!partner.firstName || !partner.lastName) {
        alert("Lütfen diğer kişinin adını ve soyadını girin");
        return;
      }

      const existingQuery = await checkExistingQuery(user, partner);
      if (existingQuery) {
        console.log("Mevcut sorgu bulundu, API çağrısı yapılmadı");
        setResult(existingQuery.result);
        setIsLoading(false);
        setShowResult(true);
        setActiveStep(3);

        if (animationRef.current) {
          animationRef.current.play();
        }
        return;
      }

      const usageCheck = await checkDailyUsageLimit();
      if (!usageCheck.canUse) {
        Alert.alert(
          "Günlük Limit",
          `Günlük uyumluluk testi limitine ulaştınız. Yarın tekrar deneyebilirsiniz. Kalan hak: ${usageCheck.remainingTests}`
        );
        return;
      }

      setIsLoading(true);

      const prompt = compatibilityPrompt(
        `${user.firstName} ${user.lastName}`,
        `${partner.firstName} ${partner.lastName}`,
        formatDate(user.birthDate),
        formatDate(partner.birthDate)
      );

      const response = await generateGeminiContent(prompt);
      const aiText = response.candidates[0].content.parts[0].text;

      const formattedResult = processApiResponse(aiText);

      await saveToHistory(user, partner, formattedResult);

      await updateUsageCount();

      setResult(formattedResult);
      setIsLoading(false);
      setShowResult(true);
      setActiveStep(3);

      if (animationRef.current) {
        animationRef.current.play();
      }
    } catch (error) {
      console.error("Uyumluluk hesaplanırken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Uyumluluk hesaplanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setIsLoading(false);
    }
  };

  const processApiResponse = (aiText: string): CompatibilityResult => {
    try {
      const overallScore = Math.floor(Math.random() * 40 + 60);

      const paragraphs = aiText.split("\n\n");
      const description =
        paragraphs[0] ||
        `${user.firstName} ve ${partner.firstName} arasındaki uyumluluk analizi.`;

      const areas = [
        {
          title: "Duygusal Uyum",
          score: Math.floor(Math.random() * 40 + 60),
          description:
            paragraphs[1] ||
            "Duygusal açıdan birbirinizi anlama ve ifade etme yeteneğiniz.",
        },
        {
          title: "Entelektüel Uyum",
          score: Math.floor(Math.random() * 40 + 60),
          description:
            paragraphs[2] || "Düşünce tarzlarınız ve iletişim biçimleriniz.",
        },
        {
          title: "Yaşam Hedefleri",
          score: Math.floor(Math.random() * 40 + 60),
          description:
            paragraphs[3] || "Hayat yolculuğunda amaçlarınız ve hedefleriniz.",
        },
      ];

      const compatibilityResult: CompatibilityResult = {
        overallScore,
        description,
        areas,
      };

      // State'i güncelle
      setResult(compatibilityResult);
      setIsLoading(false);
      setShowResult(true);
      setActiveStep(3);

      // Animasyonu başlat
      if (animationRef.current) {
        animationRef.current.play();
      }

      return compatibilityResult;
    } catch (error) {
      console.error("API yanıtı formatlanırken hata oluştu:", error);
      setIsLoading(false);

      const fallbackResult = {
        overallScore: 70,
        description: `${user.firstName} ve ${partner.firstName} arasındaki uyumluluk analizi.`,
        areas: [
          {
            title: "Duygusal Uyum",
            score: 70,
            description:
              "Duygusal açıdan birbirinizi anlama potansiyeliniz var.",
          },
          {
            title: "Entelektüel Uyum",
            score: 70,
            description:
              "Düşünce yapılarınız ve iletişim şekilleriniz benzer olabilir.",
          },
          {
            title: "Yaşam Hedefleri",
            score: 70,
            description:
              "Hayat yolculuğundaki amaçlarınız birbirini tamamlayabilir.",
          },
        ],
      };

      setResult(fallbackResult);
      setShowResult(true);
      setActiveStep(3);

      return fallbackResult;
    }
  };

  const handleNewTest = () => {
    setUser({
      firstName: "",
      lastName: "",
      birthDate: new Date(1990, 0, 1),
    });

    setPartner({
      firstName: "",
      lastName: "",
      birthDate: new Date(1990, 0, 1),
    });

    setActiveStep(1);
    setShowResult(false);
    setResult(null);
  };

  const loadHistory = async () => {
    const history = await loadCompatibilityHistory();
    setHistoryList(history);
    setShowHistory(true);
  };

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      if (!isMounted) return;
    };

    loadAllData();

    return () => {
      isMounted = false;
    };
  }, [userInfo?.horoscope?.sunSign]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#2A004E", "#4A0072", "#2A004E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      ></LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={[{ key: "main_content" }]}
          renderItem={() => (
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Uyumluluk Testi</Text>
                {activeStep > 1 && activeStep < 3 && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handlePrevStep}
                  >
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.historyButton}
                  onPress={loadHistory}
                >
                  <Ionicons name="time-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {!showResult && (
                <View style={styles.stepsContainer}>
                  <View
                    style={[
                      styles.step,
                      activeStep >= 1 ? styles.activeStep : {},
                    ]}
                  >
                    <Text style={styles.stepText}>1</Text>
                  </View>
                  <View style={styles.stepLine} />
                  <View
                    style={[
                      styles.step,
                      activeStep >= 2 ? styles.activeStep : {},
                    ]}
                  >
                    <Text style={styles.stepText}>2</Text>
                  </View>
                  <View style={styles.stepLine} />
                  <View
                    style={[
                      styles.step,
                      activeStep >= 3 ? styles.activeStep : {},
                    ]}
                  >
                    <Text style={styles.stepText}>3</Text>
                  </View>
                </View>
              )}

              {activeStep === 1 && (
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Sizin Bilgileriniz</Text>
                  <Text style={styles.formDescription}>
                    Numerolojik uyumluluk hesaplaması yapabilmemiz için
                    bilgilerinizi girin.
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Adınız</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Adınızı girin"
                      placeholderTextColor="#9F85BE"
                      value={user.firstName}
                      onChangeText={(text) =>
                        setUser({ ...user, firstName: text })
                      }
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Soyadınız</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Soyadınızı girin"
                      placeholderTextColor="#9F85BE"
                      value={user.lastName}
                      onChangeText={(text) =>
                        setUser({ ...user, lastName: text })
                      }
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>
                      Doğum Tarihiniz <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => openDatePicker("user")}
                    >
                      <Text style={styles.dateText}>
                        {formatDate(user.birthDate)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#9061F9"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleNextStep}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ButtonLoading />
                    ) : (
                      <Text style={styles.buttonText}>Devam Et</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {activeStep === 2 && (
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Diğer Kişinin Bilgileri</Text>
                  <Text style={styles.formDescription}>
                    Uyumluluk testi yapmak istediğiniz kişinin bilgilerini
                    girin.
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Adı</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Adını girin"
                      placeholderTextColor="#9F85BE"
                      value={partner.firstName}
                      onChangeText={(text) =>
                        setPartner({ ...partner, firstName: text })
                      }
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Soyadı</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Soyadını girin"
                      placeholderTextColor="#9F85BE"
                      value={partner.lastName}
                      onChangeText={(text) =>
                        setPartner({ ...partner, lastName: text })
                      }
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.inputLabel}>
                      Doğum Tarihiniz <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => openDatePicker("partner")}
                    >
                      <Text style={styles.dateText}>
                        {formatDate(partner.birthDate)}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#9061F9"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleNextStep}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ButtonLoading />
                    ) : (
                      <Text style={styles.buttonText}>Uyumluluğu Hesapla</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {isLoading && <LoadingAnimation />}

              {showResult && result && (
                <View style={styles.resultContainer}>
                  <View style={styles.resultHeader}>
                    <LottieView
                      ref={animationRef}
                      source={require("../../assets/lotties/stars.json")}
                      style={styles.resultAnimation}
                      autoPlay
                      loop={false}
                    />

                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreLabel}>Uyum Puanı</Text>
                      <Text style={styles.scoreValue}>
                        {result.overallScore}%
                      </Text>
                    </View>

                    <Text style={styles.namesText}>
                      {user.firstName} & {partner.firstName}
                    </Text>
                  </View>

                  <Text style={styles.resultDescription}>
                    {result.description}
                  </Text>

                  <View style={styles.areasContainer}>
                    <Text style={styles.areasTitle}>Uyum Alanları</Text>

                    {result.areas.map((area, index) => (
                      <View key={index} style={styles.areaItem}>
                        <View style={styles.areaHeader}>
                          <Text style={styles.areaTitle}>{area.title}</Text>
                          <Text style={styles.areaScore}>{area.score}%</Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${area.score}%` },
                            ]}
                          />
                        </View>

                        <Text style={styles.areaDescription}>
                          {area.description}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.newTestButton}
                    onPress={handleNewTest}
                  >
                    <Text style={styles.newTestButtonText}>Yeni Test Yap</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.key}
        />
      </KeyboardAvoidingView>

      <Modal
        visible={showHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.historyModalContainer}>
          <View style={styles.historyModalContent}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>
                Geçmiş Uyumluluk Testleri
              </Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {historyList.length === 0 ? (
                <Text style={styles.noHistoryText}>
                  Henüz kaydedilmiş uyumluluk testi bulunmuyor.
                </Text>
              ) : (
                historyList.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => {
                      setUser(item.user);
                      setPartner(item.partner);
                      setResult(item.result);
                      setShowResult(true);
                      setActiveStep(3);
                      setShowHistory(false);

                      // Animasyonu başlat
                      if (animationRef.current) {
                        animationRef.current.play();
                      }
                    }}
                  >
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyNames}>
                        {item.user.firstName} & {item.partner.firstName}
                      </Text>
                      <Text style={styles.historyScore}>
                        {item.result.overallScore}%
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(item.date).toLocaleDateString("tr-TR")}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.datePickerModalContainer}>
          <View style={styles.datePickerModalContent}>
            <Text style={styles.datePickerTitle}>Doğum Tarihi Seçin</Text>

            {Platform.OS === "ios" ? (
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleTempDateChange}
                locale="tr-TR"
                maximumDate={new Date()}
              />
            ) : (
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePickerModal(false);
                  if (selectedDate) {
                    const normalizedDate = new Date(selectedDate);
                    normalizedDate.setHours(12, 0, 0, 0);
                    setTempDate(normalizedDate);

                    if (currentPerson === "user") {
                      setUser({ ...user, birthDate: normalizedDate });
                    } else {
                      setPartner({ ...partner, birthDate: normalizedDate });
                    }
                  }
                }}
                locale="tr-TR"
                maximumDate={new Date()}
              />
            )}

            {Platform.OS === "ios" && (
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePickerModal(false)}
                >
                  <Text style={styles.datePickerButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    styles.datePickerButtonConfirm,
                  ]}
                  onPress={handleConfirmDate}
                >
                  <Text style={styles.datePickerButtonTextConfirm}>Tamam</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  historyButton: {
    padding: 8,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeStep: {
    backgroundColor: "#9061F9",
  },
  stepText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  stepLine: {
    height: 2,
    width: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 8,
  },
  formContainer: {
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 12,
    color: "#D5C2FF",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: "rgba(144, 97, 249, 0.5)",
  },
  resultContainer: {
    marginTop: 10,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  resultAnimation: {
    width: 200,
    height: 200,
    position: "absolute",
    top: -80,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#D5C2FF",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 46,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  namesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D5C2FF",
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 24,
    color: "#FFFFFF",
    padding: 16,
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 12,
    marginBottom: 24,
  },
  areasContainer: {
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  areasTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  areaItem: {
    marginBottom: 16,
  },
  areaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  areaScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9061F9",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9061F9",
    borderRadius: 4,
  },
  areaDescription: {
    fontSize: 12,
    lineHeight: 20,
    color: "#D5C2FF",
  },
  newTestButton: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  newTestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    paddingBottom: 10,
    width: "100%",
  },
  datePickerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 5,
  },
  datePicker: {
    backgroundColor: Platform.OS === "ios" ? "#F5F5F5" : "transparent",
    height: 180,
    width: "100%",
    marginBottom: 20,
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    alignItems: "center",
    borderRadius: 8,
  },
  datePickerButtonText: {
    fontSize: 12,
    color: "#D5C2FF",
    fontWeight: "500",
  },

  adContainer: {
    width: "100%",
    height: 90,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  adText: {
    color: "#D5C2FF",
    fontSize: 14,
    fontWeight: "500",
  },
  historyModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  historyModalContent: {
    backgroundColor: "#2A004E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  historyModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  historyModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  historyList: {
    maxHeight: "90%",
  },
  historyItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyNames: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  historyScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9061F9",
  },
  historyDate: {
    fontSize: 10,
    color: "#D5C2FF",
  },
  noHistoryText: {
    color: "#D5C2FF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  formField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  requiredStar: {
    color: "red",
    fontSize: 12,
    fontWeight: "600",
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  datePickerModalContent: {
    backgroundColor: "#c582ff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  datePickerButtonConfirm: {
    backgroundColor: "#9061F9",
  },
  datePickerButtonTextConfirm: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  logo: {
    width: "100%",
    height: 100,
    marginBottom: 20,
  },
});

export default CompatibilityScreen;
