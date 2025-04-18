import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants";
import { generateGeminiContent } from "@/api/api";

export interface DailyHoroscope {
  date: string;
  horoscope: string;
  planetaryPositions: {
    planet: string;
    position: string;
  }[];
  moonPhase: string;
}

export interface WeeklyHoroscope {
  startDate: string;
  endDate: string;
  prediction: string;
}

export interface UserZodiacInfo {
  sign: string;
  compatibleSign: string;
}

const cleanJsonResponse = (response: string) => {
  return response
    .replace(/```json\n?/, "")
    .replace(/```/, "")
    .trim();
};

export const getHoroscopeData = async (
  birthDate: Date
): Promise<{
  daily: DailyHoroscope;
  weekly: WeeklyHoroscope;
  userInfo: UserZodiacInfo;
} | null> => {
  try {
    const storedData = await checkStoredData();
    if (storedData) return storedData;

    const userInfoStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!userInfoStr) {
      throw new Error("User info not found");
    }

    const userInfo = JSON.parse(userInfoStr);
    const birthDateObj = new Date(userInfo.birthDate);

    const zodiacPrompt = `${birthDateObj.toISOString()} doğum tarihine göre, sadece aşağıdaki JSON formatında yanıt ver, başka metin ekleme:
    {
      "sign": "<burç adı (türkçe)>",
      "compatibleSign": "<en uyumlu burç (türkçe)>"
    }`;

    const zodiacResponse = await generateGeminiContent(zodiacPrompt);
    const zodiacText = cleanJsonResponse(
      zodiacResponse.candidates[0].content.parts[0].text
    );
    console.log("Cleaned Zodiac Text:", zodiacText);
    const zodiacResult = JSON.parse(zodiacText);

    const dailyPrompt = `${zodiacResult.sign} burcu için, sadece aşağıdaki JSON formatında yanıt ver, başka metin ekleme:
    {
      "horoscope": "<6-7 cümlelik günlük burç yorumu>",
      "planetaryPositions": [
        {"planet": "Güneş", "position": "<konum>"},
        {"planet": "Ay", "position": "<konum>"},
        {"planet": "Merkür", "position": "<konum>"},
        {"planet": "Venüs", "position": "<konum>"},
        {"planet": "Mars", "position": "<konum>"}
      ],
      "moonPhase": "<ay'ın mevcut evresi (türkçe)>"
    }`;

    const dailyResponse = await generateGeminiContent(dailyPrompt);
    const dailyText = cleanJsonResponse(
      dailyResponse.candidates[0].content.parts[0].text
    );
    console.log("Cleaned Daily Text:", dailyText);
    const dailyResult = JSON.parse(dailyText);

    const weeklyPrompt = `${zodiacResult.sign} burcu için, sadece aşağıdaki JSON formatında yanıt ver, başka metin ekleme:
    {
      "prediction": "<gelecek 7 gün için haftalık öngörü>"
    }`;

    const weeklyResponse = await generateGeminiContent(weeklyPrompt);
    const weeklyText = cleanJsonResponse(
      weeklyResponse.candidates[0].content.parts[0].text
    );
    console.log("Cleaned Weekly Text:", weeklyText);
    const weeklyResult = JSON.parse(weeklyText);

    const today = new Date();
    const weekFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = {
      daily: {
        date: today.toISOString(),
        ...dailyResult,
      },
      weekly: {
        startDate: today.toISOString(),
        endDate: weekFromToday.toISOString(),
        ...weeklyResult,
      },
      userInfo: zodiacResult,
    };

    await storeHoroscopeData(result);

    return result;
  } catch (error) {
    console.error("Error fetching horoscope data:", error);
    return null;
  }
};

const checkStoredData = async () => {
  try {
    const storedDaily = await AsyncStorage.getItem(
      STORAGE_KEYS.DAILY_HOROSCOPE
    );
    const storedWeekly = await AsyncStorage.getItem(
      STORAGE_KEYS.WEEKLY_HOROSCOPE
    );
    const storedUserInfo = await AsyncStorage.getItem(
      STORAGE_KEYS.USER_ZODIAC_INFO
    );

    if (storedDaily && storedWeekly && storedUserInfo) {
      const daily = JSON.parse(storedDaily);
      const weekly = JSON.parse(storedWeekly);
      const userInfo = JSON.parse(storedUserInfo);

      const today = new Date().toDateString();
      const storedDate = new Date(daily.date).toDateString();
      const weeklyEndDate = new Date(weekly.endDate);

      if (today === storedDate && weeklyEndDate > new Date()) {
        return {
          daily,
          weekly,
          userInfo,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error checking stored data:", error);
    return null;
  }
};

const storeHoroscopeData = async (data: {
  daily: DailyHoroscope;
  weekly: WeeklyHoroscope;
  userInfo: UserZodiacInfo;
}) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_HOROSCOPE,
      JSON.stringify(data.daily)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.WEEKLY_HOROSCOPE,
      JSON.stringify(data.weekly)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_ZODIAC_INFO,
      JSON.stringify(data.userInfo)
    );
  } catch (error) {
    console.error("Error storing horoscope data:", error);
  }
};
