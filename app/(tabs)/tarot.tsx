import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateGeminiContent } from "@/api/api";
import { LoadingAnimation } from "@/components/LoadingAnimation";

const { width } = Dimensions.get("window");
// Daha küçük kart boyutları
const CARD_WIDTH = width * 0.48;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

// Tip tanımlamaları
interface TarotCardType {
  id: number;
  name: string;
  image: any; // ReturnType<typeof require> yerine kullanabilirsiniz
  backImage: any;
  meaning?: string;
}

interface TarotCardProps {
  card: TarotCardType;
  index: number;
  onSelect: (card: TarotCardType) => void;
  selectedCards: TarotCardType[];
  isFlipped: boolean;
  onFlip: (cardId: number) => void;
}

// AsyncStorage için anahtar
const STORAGE_KEYS = {
  LAST_READING_DATE: "lastTarotReadingDate",
  LAST_READING_CARDS: "lastTarotReadingCards",
  LAST_READING_RESULT: "lastTarotReadingResult",
};

// Tarot kartları
const tarotCards: TarotCardType[] = [
  {
    id: 1,
    name: "Asılan Adam",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 2,
    name: "Ay",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 3,
    name: "Şeytan",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 4,
    name: "İmparatoriçe",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 5,
    name: "Kule",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 6,
    name: "Güneş",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 7,
    name: "Büyücü",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 8,
    name: "Dünya",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
  {
    id: 9,
    name: "Adalet",
    image: require("../../assets/images/tarot-backdrop.png"),
    backImage: require("../../assets/images/tarot-backdrop.png"),
  },
];

// kartı bileşeni
const TarotCard: React.FC<TarotCardProps> = ({
  card,
  index,
  onSelect,
  selectedCards,
  isFlipped,
  onFlip,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const isSelected = selectedCards.some((c) => c.id === card.id);

  useEffect(() => {
    if (isSelected) {
      setTimeout(
        () => {
          flipCard();
        },
        200 + index * 150
      ); // Daha hızlı sıralı animasyon
    }
  }, [isSelected]);

  const flipCard = () => {
    if (isSelected && !isFlipped) {
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 400, // Daha hızlı çevirme animasyonu
        useNativeDriver: true,
      }).start(() => {
        if (onFlip) onFlip(card.id);
      });
    }
  };

  // Kart rotasyon değerleri
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Görsel efektler için rastgele rotasyon
  const randomRotation = useRef(Math.random() * 4 - 2).current;

  return (
    <TouchableOpacity
      disabled={selectedCards.length >= 3 || isSelected}
      onPress={() => {
        if (!isSelected && selectedCards.length < 3) {
          onSelect(card);
        }
      }}
      style={[
        styles.cardContainer,
        isSelected && styles.selectedCard, // Seçili kart için görsel feedback
      ]}
    >
      <View style={styles.cardWrapper}>
        {isSelected ? (
          <>
            <Animated.View
              style={[
                styles.card,
                frontAnimatedStyle,
                { zIndex: isFlipped ? 0 : 1 },
              ]}
            >
              <Image
                source={card.backImage}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                backAnimatedStyle,
                { zIndex: isFlipped ? 1 : 0 },
              ]}
            >
              <Image
                source={card.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {isFlipped && (
                <View style={styles.cardNameContainer}>
                  <Text style={styles.cardName}>{card.name}</Text>
                </View>
              )}
            </Animated.View>
          </>
        ) : (
          <View style={styles.card}>
            <Image
              source={card.backImage}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardGlow} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const TarotScreen: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState<TarotCardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [readingResult, setReadingResult] = useState<{
    overall: string;
    cards: TarotCardType[];
  } | null>(null);
  const [isSelectingCards, setIsSelectingCards] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shuffledCards, setShuffledCards] = useState<TarotCardType[]>([]);
  const [hasReadToday, setHasReadToday] = useState<boolean>(false);
  const [lastReadingDate, setLastReadingDate] = useState<string>("");
  const animationRef = useRef<LottieView | null>(null);
  const cardFlips = useRef(
    Array(3)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  // Uygulama başlatıldığında bugün tarot bakılmış mı kontrol et
  useEffect(() => {
    checkLastReadingDate();
    shuffleCards();
  }, []);

  // Gün değişimini kontrol et
  const checkLastReadingDate = async () => {
    try {
      const lastReadingDateStr = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_READING_DATE
      );
      const lastCardsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_READING_CARDS
      );
      const lastResultJson = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_READING_RESULT
      );

      if (lastReadingDateStr) {
        const today = new Date().toDateString();
        const lastDate = new Date(lastReadingDateStr).toDateString();

        // Aynı gün içinde okuma yapılmış mı kontrol et
        if (today === lastDate) {
          setHasReadToday(true);
          setLastReadingDate(lastReadingDateStr);

          // Önceki okumanın kartlarını ve sonucunu göster
          if (lastCardsJson && lastResultJson) {
            const lastCards = JSON.parse(lastCardsJson);
            const lastResult = JSON.parse(lastResultJson);

            setSelectedCards(lastCards);
            setReadingResult(lastResult);
            setShowResult(true);
            setIsSelectingCards(false);
          }
        } else {
          // Yeni gün, yeni okuma
          setHasReadToday(false);
        }
      }
    } catch (error) {
      console.error("Tarot okuma durumu kontrol edilemedi:", error);
    }
  };

  // Kartları karıştır
  const shuffleCards = () => {
    const shuffled = [...tarotCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledCards(shuffled.slice(0, 9)); // Sadece 9 kart göster
  };

  // Gemini API'den tarot yorumu almak için fonksiyon
  const fetchTarotReading = async (selectedCards: TarotCardType[]) => {
    try {
      // Seçilen kart isimlerini al
      const cardNames = selectedCards.map((card) => card.name).join(", ");

      // Tarot yorumu için prompt oluştur - daha net bir format isteyelim
      const prompt = `Seçilen tarot kartları: ${cardNames}

Bu tarot kartlarına göre yorumlarını aşağıdaki gibi yap:
1. İlk olarak bir genel özet yaz (3-4 cümle)
2. Ardından her kart için ayrı ayrı yorum yap

Her yorumu boş bir satırla ayır ve aşağıdaki formatta olsun:
- Genel Özet: [genel yorum]

- ${selectedCards[0]?.name}: [1. kart yorumu]
- ${selectedCards[1]?.name}: [2. kart yorumu]
- ${selectedCards[2]?.name}: [3. kart yorumu]

Yorumların sade ve anlaşılır olsun, spiritüel bir dil kullan. Türkçe yazmalısın. Her kart için en az 3 cümle yaz.`;

      // Gemini API'den cevap al
      const response = await generateGeminiContent(prompt);
      const aiText = response.candidates[0].content.parts[0].text;

      console.log("Gemini API yanıtı:", aiText); // Debug için

      // Ayrı yorumları çıkar
      let overall =
        "Tarot kartlarınız geleceğiniz hakkında önemli ipuçları veriyor.";
      const cardMeanings = Array(selectedCards.length).fill("");

      // Genel özeti çıkar
      const overallMatch = aiText.match(/Genel Özet:?\s*(.*?)(?=-|\n\n|\Z)/s);
      if (overallMatch && overallMatch[1]) {
        overall = overallMatch[1].trim();
      }

      // Her kart için yorumları çıkar
      selectedCards.forEach((card, index) => {
        const cardRegex = new RegExp(
          `${card.name}:?\\s*(.*?)(?=-|\\n\\n|\\Z)`,
          "s"
        );
        const match = aiText.match(cardRegex);

        if (match && match[1]) {
          cardMeanings[index] = match[1].trim();
        } else {
          cardMeanings[index] =
            `${card.name} kartı, hayatınızın akışını etkileyen enerjileri temsil ediyor.`;
        }
      });

      // Debug
      console.log("---------- AYRIŞTIRILAN VERİLER ----------");
      console.log("Genel Özet:", overall);
      console.log("Kart 1:", cardMeanings[0]);
      console.log("Kart 2:", cardMeanings[1]);
      console.log("Kart 3:", cardMeanings[2]);
      console.log("-------------------------------------------");

      return {
        overall,
        cards: selectedCards.map((card, index) => ({
          ...card,
          meaning:
            cardMeanings[index] ||
            `${card.name} kartı, hayatınızdaki enerjileri temsil ediyor.`,
        })),
      };
    } catch (error) {
      console.error("Tarot yorumu alınamadı:", error);
      // Hata durumunda basit bir sonuç döndür
      return {
        overall: "Tarot kartlarınız geleceğiniz hakkında ipuçları veriyor.",
        cards: selectedCards.map((card) => ({
          ...card,
          meaning: `${card.name} kartı, hayatınızdaki enerjileri temsil ediyor.`,
        })),
      };
    }
  };

  // handleSelectCard fonksiyonunu güncelle
  const handleSelectCard = async (card: TarotCardType) => {
    console.log("Card selected:", card.name);

    if (
      selectedCards.length < 3 &&
      !selectedCards.some((c) => c.id === card.id)
    ) {
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);
      console.log("Selected cards count:", newSelectedCards.length);

      // Tüm kartlar seçildiğinde
      if (newSelectedCards.length === 3) {
        console.log("All cards selected, starting result generation");
        setIsLoading(true);

        try {
          // Gemini API'den tarot yorumu al
          const result = await fetchTarotReading(newSelectedCards);

          // Önce state'leri güncelle
          setReadingResult(result);
          setShowResult(true);
          setIsSelectingCards(false);
          setHasReadToday(true);

          // Sonra AsyncStorage'a kaydet
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_READING_DATE,
            new Date().toISOString()
          );
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_READING_CARDS,
            JSON.stringify(newSelectedCards)
          );
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_READING_RESULT,
            JSON.stringify(result)
          );

          console.log("States and storage updated successfully");
        } catch (error) {
          console.error("Error in handleSelectCard:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const flipCard = (index: number) => {
    Animated.sequence([
      Animated.timing(cardFlips[index], {
        toValue: 180,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardFlip = (cardId: number) => {
    setFlippedCards([...flippedCards, cardId]);
  };

  console.log(showResult, "showResult");
  console.log(readingResult, "readingResult");

  const resetReading = async () => {
    // Günün tarihi kontrolü
    const today = new Date().toDateString();
    const lastDate = lastReadingDate
      ? new Date(lastReadingDate).toDateString()
      : "";

    // Aynı gün içinde yeni okuma yapamaz
    if (today === lastDate) {
      return;
    }

    setSelectedCards([]);
    setFlippedCards([]);
    setShowResult(false);
    setReadingResult(null);
    setIsSelectingCards(true);
    setHasReadToday(false);
    shuffleCards();

    // Animasyonu baştan başlat
    if (animationRef.current) {
      animationRef.current.reset();
      animationRef.current.play();
    }

    // Eski verileri temizle
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_READING_DATE);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_READING_CARDS);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_READING_RESULT);
  };

  // Bugünün tarihini formatla
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // useEffect ile state değişimlerini izle
  useEffect(() => {
    console.log("State changed:", { showResult, readingResult });
  }, [showResult, readingResult]);

  // Kart çekme işlemi başlatıldığında
  const handleDrawCards = async () => {
    setIsLoading(true);
    // ... diğer kod
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={["#2A004E", "#4A0072", "#2A004E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Tarot Okuması</Text>
        </View>

        {hasReadToday && (
          <View style={styles.dailyInfoBanner}>
            <Ionicons name="time-outline" size={18} color="#D5C2FF" />
            <Text style={styles.dailyInfoText}>
              Bugünkü tarot okumanız tamamlandı. Yarın tekrar bakabilirsiniz.
            </Text>
          </View>
        )}

        {isSelectingCards && !showResult && !hasReadToday && (
          <>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Günlük Tarot Okuması</Text>
              <Text style={styles.instructions}>
                Lütfen üç kart seçin. Seçtiğiniz kartlar, gelecekteki olaylar ve
                enerjiler hakkında size rehberlik edecek.
              </Text>
              <Text style={styles.selectionCount}>
                {selectedCards.length}/3 Kart Seçildi
              </Text>
            </View>

            <View style={styles.deckContainer}>
              {isLoading ? (
                <LoadingAnimation
                  containerStyle={styles.loadingContainer}
                  animationSource={require("@/assets/lotties/loading.json")}
                />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardDeck}
                >
                  {shuffledCards.map((card, index) => (
                    <TarotCard
                      key={card.id}
                      card={card}
                      index={index}
                      onSelect={handleSelectCard}
                      selectedCards={selectedCards}
                      isFlipped={flippedCards.includes(card.id)}
                      onFlip={handleCardFlip}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

        {/* Sonuç Ekranı */}
        {showResult && readingResult && (
          <ScrollView style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Tarot Okuması Sonucu</Text>
              <Text style={styles.resultDate}>
                {formatDate(lastReadingDate || new Date().toISOString())}
              </Text>
            </View>

            <View style={styles.cardDetailsContainer}>
              <Text style={styles.resultTitle}>Tarot Okuması</Text>
              <Text style={styles.overallReading}>{readingResult.overall}</Text>

              {readingResult.cards.map((card, index) => (
                <View key={card.id} style={styles.cardReadingItem}>
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={card.image}
                      style={styles.cardThumbnail}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.cardReadingContent}>
                    <Text style={styles.cardReadingTitle}>{card.name}</Text>
                    <Text style={styles.cardReadingText}>{card.meaning}</Text>
                  </View>
                </View>
              ))}
            </View>

            {!hasReadToday && (
              <TouchableOpacity
                style={styles.newReadingButton}
                onPress={resetReading}
              >
                <Text style={styles.newReadingButtonText}>
                  Yeni Tarot Okuması
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  shuffleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(213, 194, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shuffleText: {
    color: "#D5C2FF",
    marginLeft: 5,
    fontWeight: "500",
  },
  dailyInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 18,
  },
  dailyInfoText: {
    color: "#D5C2FF",
    fontSize: 12,
    marginLeft: 8,
  },
  instructionsContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  sparkleAnimation: {
    width: 150,
    height: 150,
    position: "absolute",
    top: -50,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: "#D5C2FF",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 5,
  },
  deckContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  cardDeck: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  cardContainer: {
    marginHorizontal: -30, // Kartları üst üste bindir - biraz azalttık
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    position: "absolute",
  },
  cardBack: {
    transform: [{ rotateY: "180deg" }],
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardNameContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    alignItems: "center",
  },
  cardName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 12,
    color: "#D5C2FF",
  },
  overallReading: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    padding: 16,
    backgroundColor: "rgba(213, 194, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedCardsContainer: {
    marginBottom: 24,
  },
  resultCardContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(74, 0, 114, 0.5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  resultCardImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  resultCardInfo: {
    flex: 1,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  resultCardMeaning: {
    fontSize: 12,
    lineHeight: 20,
    color: "#D5C2FF",
  },
  newReadingButton: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  newReadingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedCard: {
    opacity: 0.8, // Seçili kartı belirginleştir
    transform: [{ scale: 0.95 }], // Hafif küçültme efekti
  },
  cardDetailsContainer: {
    marginBottom: 24,
  },
  cardReadingItem: {
    flexDirection: "row",
    backgroundColor: "rgba(74, 0, 114, 0.5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  cardImageContainer: {
    marginRight: 16,
  },
  cardThumbnail: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  cardReadingContent: {
    flex: 1,
  },
  cardReadingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardReadingText: {
    fontSize: 12,
    lineHeight: 20,
    color: "#D5C2FF",
  },
});

export default TarotScreen;
