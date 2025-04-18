import { getHours, getMinutes, parseISO, isValid, parse } from "date-fns";

/**
 */
interface HoroscopeParams {
  birthDate: Date;
  birthTime?: string | Date;
  birthPlace?: string;
  city?: string;
  country?: string;
}

interface HoroscopeResult {
  sunSign: string;
  ascendantSign: string | null;
  moonSign: string;
  elementGroup: string;
}

/**
 *
 * @param params -
 * @returns
 */
export function calculateHoroscope(params: HoroscopeParams): HoroscopeResult {
  const { birthDate, birthTime, birthPlace, city, country } = params;

  if (!birthDate) {
    throw new Error("Doğum tarihi gereklidir");
  }

  const sunSign = calculateSunSign(birthDate);

  let location = birthPlace;
  if (!location && (city || country)) {
    location = [city, country].filter(Boolean).join(", ");
  }

  let ascendantSign: string | null = null;

  if (birthTime && location && location.trim() !== "") {
    try {
      let timeString = "";

      if (birthTime instanceof Date) {
        const hours = birthTime.getHours();
        const minutes = birthTime.getMinutes();
        timeString = `${hours}:${minutes}`;
      } else if (typeof birthTime === "string") {
        if (birthTime.includes("T") && birthTime.includes(":")) {
          const timePart = birthTime.split("T")[1];
          const hourMinute = timePart.split(":");
          timeString = `${hourMinute[0]}:${hourMinute[1]}`;
        } else if (birthTime.includes(":")) {
          timeString = birthTime;
        } else {
          throw new Error("Geçersiz saat formatı");
        }
      }

      const [hourStr, minuteStr] = timeString.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        throw new Error(`Geçersiz saat değerleri: ${hour}:${minute}`);
      }

      console.log(
        `Yükselen burç hesaplanıyor - Saat: ${hour}:${minute}, Yer: ${location}`
      );

      ascendantSign = calculateAscendantWithHourMinute(hour, minute, location);
    } catch (error) {
      console.error("Yükselen burç hesaplanırken hata oluştu:", error);
      ascendantSign = null;
    }
  }

  const moonSign = calculateMoonSign(birthDate);

  return {
    sunSign,
    ascendantSign,
    moonSign,
    elementGroup: calculateElementGroup(sunSign),
  };
}

/**
 *
 * @param birthDate -
 * @returns
 */
function calculateSunSign(birthDate: Date): string {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Kova";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Balık";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Koç";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Boğa";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    return "İkizler";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Yengeç";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Aslan";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Başak";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
    return "Terazi";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Akrep";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Yay";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Oğlak";

  return "Bilinmiyor";
}

/**
 *
 * @param hour -
 * @param minute -
 * @param location -
 * @returns
 */
function calculateAscendantWithHourMinute(
  hour: number,
  minute: number,
  location: string
): string {
  const locationFactor = location.length % 4;

  const timeIndex = Math.floor(hour / 2) % 12;

  const combinedIndex = (timeIndex + locationFactor) % 12;

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

  return signs[combinedIndex];
}

/**
 *
 * @param birthDate -
 * @returns
 */
function calculateMoonSign(birthDate: Date): string {
  const sunSign = calculateSunSign(birthDate);
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

  const index = signs.indexOf(sunSign);
  return signs[(index + 1) % 12];
}

/**
 *
 * @param sign -
 * @returns
 */
function calculateElementGroup(sign: string): string {
  const fireSigns = ["Koç", "Aslan", "Yay"];
  const earthSigns = ["Boğa", "Başak", "Oğlak"];
  const airSigns = ["İkizler", "Terazi", "Kova"];
  const waterSigns = ["Yengeç", "Akrep", "Balık"];

  if (fireSigns.includes(sign)) return "Ateş";
  if (earthSigns.includes(sign)) return "Toprak";
  if (airSigns.includes(sign)) return "Hava";
  if (waterSigns.includes(sign)) return "Su";

  return "Bilinmiyor";
}
