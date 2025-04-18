import { getHours, getMinutes, parseISO, isValid, parse } from "date-fns";

/**
 * Burç hesaplama için gerekli parametre tipleri
 */
interface HoroscopeParams {
  birthDate: Date;
  birthTime?: string | Date; // "14:30" formatında veya Date objesi
  birthPlace?: string; // Örneğin "İstanbul"
  city?: string; // Alternatif olarak ayrı ayrı şehir
  country?: string; // ve ülke alanları
}

/**
 * Burç bilgilerini içeren döndürülen nesne tipi
 */
interface HoroscopeResult {
  sunSign: string;
  ascendantSign: string | null;
  moonSign: string;
  elementGroup: string;
}

/**
 * Doğum bilgilerine göre burç ve yükselen burç hesaplayan fonksiyon
 * @param params - Kullanıcı bilgileri
 * @returns Burç bilgilerini içeren nesne
 */
export function calculateHoroscope(params: HoroscopeParams): HoroscopeResult {
  const { birthDate, birthTime, birthPlace, city, country } = params;

  if (!birthDate) {
    throw new Error("Doğum tarihi gereklidir");
  }

  // Güneş burcu hesaplama
  const sunSign = calculateSunSign(birthDate);

  // Doğum yerini belirle (birthPlace veya city/country)
  let location = birthPlace;
  if (!location && (city || country)) {
    location = [city, country].filter(Boolean).join(", ");
  }

  // Yükselen burç hesaplama (doğum saati ve yeri varsa)
  let ascendantSign: string | null = null;

  // Hem doğum saati hem de doğum yeri varsa yükselen burç hesapla
  if (birthTime && location && location.trim() !== "") {
    try {
      // Basitleştirilmiş yaklaşım - saati direkt string olarak çıkar
      let timeString = "";

      if (birthTime instanceof Date) {
        // Date objesinin zaman bileşenini al (yalnızca saat:dakika formatında)
        // Native Date API kullanarak saati alalım (date-fns kullanmak yerine)
        const hours = birthTime.getHours();
        const minutes = birthTime.getMinutes();
        timeString = `${hours}:${minutes}`;
      } else if (typeof birthTime === "string") {
        if (birthTime.includes("T") && birthTime.includes(":")) {
          // ISO formatından sadece saati çıkar (örn: "2025-03-28T14:04:59.781Z" -> "14:04")
          const timePart = birthTime.split("T")[1];
          const hourMinute = timePart.split(":");
          timeString = `${hourMinute[0]}:${hourMinute[1]}`;
        } else if (birthTime.includes(":")) {
          // Direkt saat:dakika formatı
          timeString = birthTime;
        } else {
          throw new Error("Geçersiz saat formatı");
        }
      }

      // Saat formatını kontrol et ve parçala
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

      // Saat ve konum değerleriyle yükselen burcu hesapla
      ascendantSign = calculateAscendantWithHourMinute(hour, minute, location);
    } catch (error) {
      console.error("Yükselen burç hesaplanırken hata oluştu:", error);
      ascendantSign = null;
    }
  }

  // Ay burcu hesaplama
  const moonSign = calculateMoonSign(birthDate);

  return {
    sunSign,
    ascendantSign,
    moonSign,
    elementGroup: calculateElementGroup(sunSign),
  };
}

/**
 * Güneş burcunu hesaplayan yardımcı fonksiyon
 * @param birthDate - Doğum tarihi
 * @returns Güneş burcu
 */
function calculateSunSign(birthDate: Date): string {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // JavaScript'te aylar 0'dan başlar

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
 * Saat, dakika ve konum bilgisine göre yükselen burç hesabı
 * @param hour - Saat (0-23)
 * @param minute - Dakika (0-59)
 * @param location - Doğum yeri
 * @returns Yükselen burç
 */
function calculateAscendantWithHourMinute(
  hour: number,
  minute: number,
  location: string
): string {
  // Basitleştirilmiş yaklaşım: şehir adının uzunluğunu ve saati kullanarak
  // burçlar arasında bir seçim yapıyoruz (gerçek bir hesaplama değil)
  const locationFactor = location.length % 4; // 0-3 arası bir değer

  // Saate göre basit bir hesaplama
  // 2 saatte bir burç değiştiği varsayılıyor
  const timeIndex = Math.floor(hour / 2) % 12;

  // Konum faktörü ve saat indeksini birleştirerek bir indeks oluştur
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
 * Ay burcunu hesaplayan yardımcı fonksiyon (basitleştirilmiş)
 * @param birthDate - Doğum tarihi
 * @returns Ay burcu
 */
function calculateMoonSign(birthDate: Date): string {
  // Gerçek ay burcu hesaplaması karmaşıktır, bu basitleştirilmiş bir yaklaşımdır
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;

  // Basitçe, güneş burcundan bir sonraki burcu ay burcu olarak kabul ediyoruz
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
 * Burcun element grubunu döndüren yardımcı fonksiyon
 * @param sign - Güneş burcu
 * @returns Element grubu (Ateş, Toprak, Hava, Su)
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
