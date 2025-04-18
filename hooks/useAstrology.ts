import { horoscopePrompt } from "@/constants/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { DailyHoroscope, MoonPhase } from "@/types";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockData } from "@/constants/mockData";
interface PlanetPosition {
  name: string;
  sign: string;
  icon: string;
}

interface WeeklyForecast {
  title: string;
  text: string;
}

const useAstrology = () => {
  const genAI = new GoogleGenerativeAI(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""
  );

  const [dailyHoroscope, setDailyHoroscope] = useState<DailyHoroscope>();
  const [loading, setLoading] = useState(false);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast>();
  const [moonPhase, setMoonPhase] = useState<MoonPhase>({
    phase: "Dolunay",
    date: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    description:
      "Bugün içindeki parlaklık dışarıya yansıyor. Hedeflerine odaklan ve sezgilerine güven.",
  });
  const [dailyPlanetPositions, setDailyPlanetPositions] = useState<
    PlanetPosition[]
  >([]);
  const { userInfo } = useUser();

  const getDailyHoroscope = async () => {
    try {
      setLoading(true);

      if (!userInfo) {
        throw new Error("Kullanıcı bilgisi alınamadı");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = horoscopePrompt(
        userInfo?.birthDate || "",
        userInfo?.fullName || ""
      );

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const cleanedText = text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/^Genel Bakış:?/im, "")
        .replace(/^Genel Yorum:?/im, "")
        .replace(/^Günlük Yorum:?/im, "");

      const sections = cleanedText.split(/Aşk:|Kariyer:|Sağlık:/i);

      let mainText = sections[0].trim();
      if (mainText.length < 100) {
        mainText = mockData.horoscope.detailedText;
      }

      const dailyPlanetPositions = calculateDailyPlanetPositions();
      setDailyPlanetPositions(dailyPlanetPositions);

      setDailyHoroscope({
        text: mainText.substring(0, 150) + "...",
        detailedText: mainText,
        love: sections[1]?.trim() || mockData.horoscope.love,
        career: sections[2]?.trim() || mockData.horoscope.career,
        health: sections[3]?.trim() || mockData.horoscope.health,
      });
      setLoading(false);
    } catch (error) {
      setDailyHoroscope({
        text: mockData.horoscope.detailedText,
        detailedText: mockData.horoscope.detailedText,
        love: mockData.horoscope.love,
        career: mockData.horoscope.career,
        health: mockData.horoscope.health,
      });
      setLoading(false);
    }
  };

  const getWeeklyForecast = async (sign: string) => {
    const STORAGE_KEY = "weekly_forecast_data";

    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const today = new Date();
      const dayOfWeek = today.getDay();

      if (!storedData || dayOfWeek === 1) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `${sign} burcu için bu haftanın (önümüzdeki 7 gün) astrolojik öngörüsünü Türkçe olarak yaz. 3-4 cümle ile özetle. Özellikle kariyer, ilişkiler ve dikkat edilmesi gereken günler hakkında bilgi ver. Cevabında "Bu hafta seni neler bekliyor?" sorusuna yanıt veriyormuş gibi başla.`;

          const result = await model.generateContent(prompt);
          const text = result.response.text();

          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              data: text
                .replace(/^(bu hafta seni neler bekliyor\?)/i, "")
                .trim(),
              timestamp: Date.now(),
            })
          );

          setWeeklyForecast({
            title: "Bu hafta seni neler bekliyor?",
            text: text.replace(/^(bu hafta seni neler bekliyor\?)/i, "").trim(),
          });
        } catch (error) {
          console.error("Forecast error:", error);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setWeeklyForecast({
              title: "Bu hafta seni neler bekliyor?",
              text: parsedData.data,
            });
          }
        }
      } else {
        const parsedData = JSON.parse(storedData);
        setWeeklyForecast({
          title: "Bu hafta seni neler bekliyor?",
          text: parsedData.data,
        });
      }
    } catch (error) {
      console.error("Error reading stored data:", error);
      setWeeklyForecast({
        title: "Bu hafta seni neler bekliyor?",
        text: "Bu hafta kariyerinde ilerlemek için yeni fırsatlar çıkabilir. İlişkilerde açık iletişimi koruman önemli. Perşembe günü finansal konularda dikkatli olmalısın.",
      });
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const dailyPlanetPositions = calculateDailyPlanetPositions();
        setDailyPlanetPositions(dailyPlanetPositions);

        const simpleMoonPhase = getSimpleMoonPhase();
        setMoonPhase(simpleMoonPhase);

        await getDailyHoroscope();
        await getWeeklyForecast(userInfo?.horoscope.sunSign || "");
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      }
    };

    loadAllData();
  }, []);

  const getSimpleMoonPhase = (): MoonPhase => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    let phase = "";
    let description = "";

    if (dayOfMonth < 7) {
      phase = "Yeni Ay";
      description =
        "Yeni fırsatların kapıları sana açılıyor! Bu evrede atacağın her adım, gelecekte büyük başarılara dönüşecek. Hedeflerini belirle ve ilk adımı cesaretle at.";
    } else if (dayOfMonth < 14) {
      phase = "İlk Dördün";
      description =
        "Potansiyelinin şimdi farkına varma zamanı! Karşına çıkan engelleri aşma gücüne sahipsin. Cesaretle ilerle, parlayan enerjin çevrene ilham verecek.";
    } else if (dayOfMonth < 21) {
      phase = "Dolunay";
      description =
        "Enerjin ve sezgilerin en yüksek noktada! İçindeki ışık dışarı yansıyor, duygusal netlik kazanıyorsun. Yarım kalan işleri tamamla, ilişkilerini derinleştir.";
    } else {
      phase = "Son Dördün";
      description =
        "Kendini keşfetme yolculuğundasın. Geçmişten ders al ve geleceğe umutla bak. Seni sınırlandıran düşüncelerden arınma vakti, yeni bir döngüye hazırlan!";
    }

    if (dayOfMonth === 1 || dayOfMonth === 2) {
      phase = "Yeni Ay";
      description =
        "Taze bir başlangıç için mükemmel zaman! Bugün attığın her tohum, yakında büyük bir ağaca dönüşecek. Kalbinde taşıdığın hayalleri gerçekleştirme fırsatıyla dolup taşıyorsun.";
    } else if (dayOfMonth === 7 || dayOfMonth === 8) {
      phase = "Hilal (Büyüyen)";
      description =
        "İçindeki kararlılık her geçen gün artıyor. Attığın adımların meyvelerini görmeye başlıyorsun. Kendine olan inancını koru, yıldızlar senin için parlıyor!";
    } else if (dayOfMonth === 14 || dayOfMonth === 15) {
      phase = "Dolunay";
      description =
        "Bugün kozmik enerjiler seninle! Gizli yeteneklerin ortaya çıkıyor, sezgilerin güçleniyor. Kendini ifade etmekten çekinme, parlaklığın herkesi etkileyecek.";
    } else if (dayOfMonth === 21 || dayOfMonth === 22) {
      phase = "Son Dördün";
      description =
        "Hayatın dengelerini yeniden kurmak için ideal zaman. Seni olgunlaştıran deneyimlerin değerini anla. Yakında başlayacak yeni döngü için içsel hazırlığını tamamla.";
    } else if (
      dayOfMonth === 28 ||
      dayOfMonth === 29 ||
      dayOfMonth === 30 ||
      dayOfMonth === 31
    ) {
      phase = "Hilal (Küçülen)";
      description =
        "İçsel bilgeliğin artıyor, sessizliğin gücünü keşfediyorsun. Kendini dinleme zamanı! Yakında başlayacak yeni döngü için enerjini topla, büyük değişimler kapıda.";
    }

    return {
      phase,
      date: today.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      description,
    };
  };

  return {
    dailyHoroscope,
    getDailyHoroscope,
    loading,
    dailyPlanetPositions,
    moonPhase,
    weeklyForecast,
  };
};

export default useAstrology;

function calculateDailyPlanetPositions(): PlanetPosition[] {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;

  const planets = [
    { name: "Güneş", baseSign: "Koç", degreePerDay: 1, icon: "sunny-outline" },
    {
      name: "Ay",
      baseSign: "Yengeç",
      degreePerDay: 13.2,
      icon: "moon-outline",
    },
    {
      name: "Merkür",
      baseSign: "İkizler",
      degreePerDay: 1.4,
      icon: "planet-outline",
    },
    { name: "Venüs", baseSign: "Boğa", degreePerDay: 1.2, icon: "planet" },
    {
      name: "Mars",
      baseSign: "Koç",
      degreePerDay: 0.5,
      icon: "planet-outline",
    },
    {
      name: "Jüpiter",
      baseSign: "Yay",
      degreePerDay: 0.08,
      icon: "planet-outline",
    },
    {
      name: "Satürn",
      baseSign: "Oğlak",
      degreePerDay: 0.03,
      icon: "planet-outline",
    },
  ];

  const signs = [
    "Koç",
    "Boğa",
    "İkizler",
    "Yengeç",
    "Aslan",
    "Başak",
    "Terazi",
    "Akrep",
    "Yay",
    "Oğlak",
    "Kova",
    "Balık",
  ];

  return planets.map((planet) => {
    const dayFactor = (day + month * 30) * planet.degreePerDay;
    const totalDegrees = dayFactor % 360;

    const signIndex = Math.floor(totalDegrees / 30);
    const sign = signs[signIndex];

    return {
      name: planet.name,
      sign,
      icon: planet.icon,
    };
  });
}
