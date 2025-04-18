import { generateGeminiContent } from "@/api/api";
import { dailyHoroscopePrompt } from "@/constants/prompts";
import { getUserInformation } from "@/utils/getUserInformation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface DailyHoroscope {
  date: Date | null;
  text: string | null;
}

export const useDailyHoroscope = () => {
  const [horoscope, setHoroscope] = useState<DailyHoroscope>({
    date: null,
    text: "",
  });
  useEffect(() => {
    const fetchDailyHoroscope = async () => {
      try {
        const userInformation = await getUserInformation();

        const prompt = dailyHoroscopePrompt(
          userInformation?.birthDate,
          userInformation?.name
        );

        const dailyHoroscope = await getDailyHoroscope();

        if (dailyHoroscope.date === new Date().toLocaleDateString("tr-TR")) {
          return;
        }

        const response = await generateGeminiContent(prompt);

        const aiText = response.candidates[0].content.parts[0].text;

        await AsyncStorage.setItem(
          "dailyHoroscope",
          JSON.stringify({
            date: new Date().toLocaleDateString("tr-TR"),
            text: aiText,
          })
        );
      } catch (error) {
        console.error("YAKALANAN HATA:", error);
      }
    };

    fetchDailyHoroscope();
  }, []);

  const getDailyHoroscope = async () => {
    try {
      const dailyHoroscopeData = await AsyncStorage.getItem("dailyHoroscope");

      if (!dailyHoroscopeData) {
        const emptyData = { date: null, text: "" };
        setHoroscope(emptyData);
        return emptyData;
      }

      const parsedData = JSON.parse(dailyHoroscopeData);
      setHoroscope(parsedData);
      return parsedData;
    } catch (error) {
      console.log("Burç verisi ayrıştırılamadı:", error);
      const defaultData = { date: null, text: "" };
      setHoroscope(defaultData);
      return defaultData;
    }
  };

  return { horoscope };
};
